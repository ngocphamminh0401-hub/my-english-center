import React, { useCallback, useEffect, useState } from 'react';
import {
  Button, Form, Input, Modal, Select, Table, Tag, message,
} from 'antd';
import AdminMasterLayout from '../../../layouts/AdminLayout';
import {
  getAdminUsers, createAdminUser, updateAdminUser, deactivateAdminUser,
} from '../../../services/adminApi';

const ROLE_LABELS = { student: 'Học viên', teacher: 'Giáo viên', manager: 'Quản trị' };
const ROLE_COLORS = { student: 'blue', teacher: 'green', manager: 'red' };
const STATUS_COLORS = { true: 'success', false: 'default' };

const roleOptions = [
  { value: 'student', label: 'Học viên' },
  { value: 'teacher', label: 'Giáo viên' },
  { value: 'manager', label: 'Quản trị viên' },
];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(undefined);

  // Modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const loadUsers = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const data = await getAdminUsers({
        page: pg, limit: 10, search: search || undefined, role: roleFilter || undefined,
      });
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setPage(pg);
    } catch {
      message.error('Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => { loadUsers(1); }, [loadUsers]);

  const handleCreate = async () => {
    let values;
    try { values = await createForm.validateFields(); } catch { return; }
    setSubmitting(true);
    try {
      await createAdminUser(values);
      message.success('Tạo tài khoản thành công.');
      setCreateOpen(false);
      createForm.resetFields();
      loadUsers(1);
    } catch (e) {
      message.error(e?.response?.data?.message || 'Không thể tạo tài khoản.');
    } finally { setSubmitting(false); }
  };

  const handleEdit = async () => {
    let values;
    try { values = await editForm.validateFields(); } catch { return; }
    setSubmitting(true);
    try {
      await updateAdminUser(editTarget.user_id, values);
      message.success('Cập nhật thành công.');
      setEditOpen(false);
      loadUsers(page);
    } catch (e) {
      message.error(e?.response?.data?.message || 'Không thể cập nhật.');
    } finally { setSubmitting(false); }
  };

  const handleDeactivate = async (userId, name) => {
    Modal.confirm({
      title: `Vô hiệu hóa tài khoản "${name}"?`,
      content: 'Người dùng sẽ không thể đăng nhập sau khi bị vô hiệu hóa.',
      okText: 'Xác nhận', cancelText: 'Hủy', okButtonProps: { danger: true },
      async onOk() {
        try {
          await deactivateAdminUser(userId);
          message.success('Đã vô hiệu hóa.');
          loadUsers(page);
        } catch {
          message.error('Không thể vô hiệu hóa.');
        }
      },
    });
  };

  const openEdit = (record) => {
    setEditTarget(record);
    editForm.setFieldsValue({
      full_name: record.full_name,
      email: record.email,
      role: record.role,
    });
    setEditOpen(true);
  };

  const columns = [
    {
      title: 'Họ tên',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (v) => <span className="font-medium text-slate-800">{v}</span>,
    },
    { title: 'Email', dataIndex: 'email', key: 'email', className: 'text-slate-500 text-sm' },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (v) => <Tag color={ROLE_COLORS[v]}>{ROLE_LABELS[v] ?? v}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (v) => <Tag color={STATUS_COLORS[String(v)]}>{v ? 'Hoạt động' : 'Đã vô hiệu'}</Tag>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (v) => v ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(new Date(v)) : '—',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Button size="small" onClick={() => openEdit(record)}>Sửa</Button>
          {record.is_active && (
            <Button size="small" danger onClick={() => handleDeactivate(record.user_id, record.full_name)}>
              Vô hiệu hóa
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminMasterLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Quản lý người dùng</h1>
            <p className="text-sm text-slate-500 mt-0.5">Quản lý tài khoản học viên, giáo viên và quản trị viên.</p>
          </div>
          <Button type="primary" onClick={() => setCreateOpen(true)}>
            + Tạo tài khoản
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <Input.Search
            placeholder="Tìm theo tên hoặc email..."
            allowClear
            style={{ width: 280 }}
            onSearch={(v) => setSearch(v)}
            onChange={(e) => { if (!e.target.value) setSearch(''); }}
          />
          <Select
            allowClear
            placeholder="Vai trò"
            style={{ width: 160 }}
            options={roleOptions}
            onChange={setRoleFilter}
          />
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <Table
            columns={columns}
            dataSource={users}
            rowKey="user_id"
            loading={loading}
            pagination={{
              current: page,
              pageSize: 10,
              total,
              onChange: (pg) => loadUsers(pg),
              showTotal: (t) => `${t} người dùng`,
            }}
            size="middle"
          />
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        title="Tạo tài khoản mới"
        open={createOpen}
        onOk={handleCreate}
        onCancel={() => { setCreateOpen(false); createForm.resetFields(); }}
        okText="Tạo"
        cancelText="Hủy"
        confirmLoading={submitting}
      >
        <Form form={createForm} layout="vertical" className="mt-4">
          <Form.Item name="full_name" label="Họ và tên" rules={[{ required: true, min: 2 }]}>
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="email@example.com" />
          </Form.Item>
          <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
            <Select options={roleOptions} placeholder="Chọn vai trò" />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6 }]}>
            <Input.Password placeholder="Tối thiểu 6 ký tự" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa người dùng"
        open={editOpen}
        onOk={handleEdit}
        onCancel={() => setEditOpen(false)}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={submitting}
      >
        <Form form={editForm} layout="vertical" className="mt-4">
          <Form.Item name="full_name" label="Họ và tên" rules={[{ required: true, min: 2 }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
            <Select options={roleOptions} />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu mới (để trống nếu không đổi)">
            <Input.Password placeholder="Bỏ trống để giữ nguyên" />
          </Form.Item>
        </Form>
      </Modal>
    </AdminMasterLayout>
  );
}
