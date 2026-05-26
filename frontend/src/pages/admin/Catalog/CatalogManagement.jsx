import React, { useCallback, useEffect, useState } from 'react';
import {
  Button, Form, Input, InputNumber, Modal, Select, Table, Tabs, Tag, message,
} from 'antd';
import AdminMasterLayout from '../../../layouts/AdminLayout';
import { getBranches } from '../../../services/adminOpsApi';
import {
  getAdminCourses, createAdminCourse, updateAdminCourse, deleteAdminCourse,
  getAdminRooms,
  getAdminTeachers,
  getAdminClasses, createAdminClass, updateAdminClass, deleteAdminClass,
  getEnrollments, addEnrollment, removeEnrollment,
} from '../../../services/adminApi';
import dayjs from 'dayjs';

/* ─── Courses Tab ─── */
function CoursesTab() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await getAdminCourses();
      setCourses(d.courses || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (r) => {
    setEditing(r);
    form.setFieldsValue({ title: r.title, description: r.description, max_sessions: r.max_sessions });
    setModalOpen(true);
  };

  const handleSave = async () => {
    let values;
    try { values = await form.validateFields(); } catch { return; }
    setSubmitting(true);
    try {
      if (editing) {
        await updateAdminCourse(editing.course_id, values);
        message.success('Đã cập nhật khóa học.');
      } else {
        await createAdminCourse(values);
        message.success('Đã tạo khóa học.');
      }
      setModalOpen(false);
      load();
    } catch (e) {
      message.error(e?.response?.data?.message || 'Lỗi khi lưu.');
    } finally { setSubmitting(false); }
  };

  const handleDelete = (r) => {
    Modal.confirm({
      title: `Xóa khóa học "${r.title}"?`,
      content: 'Thao tác này không thể hoàn tác.',
      okText: 'Xóa', okButtonProps: { danger: true }, cancelText: 'Hủy',
      async onOk() {
        try {
          await deleteAdminCourse(r.course_id);
          message.success('Đã xóa.');
          load();
        } catch {
          message.error('Không thể xóa (có lớp học đang sử dụng khóa học này).');
        }
      },
    });
  };

  const cols = [
    { title: 'Tên khóa học', dataIndex: 'title', key: 'title', render: (v) => <span className="font-medium">{v}</span> },
    { title: 'Số buổi tối đa', dataIndex: 'max_sessions', key: 'max_sessions', align: 'center', render: (v) => <Tag>{v} buổi</Tag> },
    { title: 'Mô tả', dataIndex: 'description', key: 'desc', render: (v) => <span className="text-slate-500 text-xs">{v || '—'}</span> },
    {
      title: '', key: 'actions', width: 120,
      render: (_, r) => (
        <div className="flex gap-2">
          <Button size="small" onClick={() => openEdit(r)}>Sửa</Button>
          <Button size="small" danger onClick={() => handleDelete(r)}>Xóa</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="primary" onClick={openCreate}>+ Thêm khóa học</Button>
      </div>
      <Table columns={cols} dataSource={courses} rowKey="course_id" loading={loading} size="middle" pagination={{ pageSize: 10 }} />

      <Modal title={editing ? 'Chỉnh sửa khóa học' : 'Thêm khóa học'} open={modalOpen}
        onOk={handleSave} onCancel={() => setModalOpen(false)} okText="Lưu" cancelText="Hủy" confirmLoading={submitting}>
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="title" label="Tên khóa học" rules={[{ required: true, min: 2 }]}>
            <Input placeholder="Vd: IELTS 6.5, TOEIC 700+" />
          </Form.Item>
          <Form.Item name="max_sessions" label="Số buổi tối đa" rules={[{ required: true }]}>
            <InputNumber min={1} max={30} style={{ width: '100%' }} addonAfter="buổi" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả (tùy chọn)">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

/* ─── Classes Tab ─── */
function ClassesTab() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [enrollTarget, setEnrollTarget] = useState(null);
  const [enrollData, setEnrollData] = useState({ enrolled: [], available: [] });
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Dropdown data
  const [courses, setCourses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cls, crs, br, tc] = await Promise.all([
        getAdminClasses(),
        getAdminCourses(),
        getBranches(),
        getAdminTeachers(),
      ]);
      setClasses(cls.classes || []);
      setCourses((crs.courses || []).map((c) => ({ value: c.course_id, label: c.title })));
      setBranches((br.branches || []).map((b) => ({ value: b.branch_id, label: b.branch_name })));
      setTeachers((tc.teachers || []).map((t) => ({ value: t.user_id, label: t.full_name })));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadRooms = async (branchId) => {
    if (!branchId) { setRooms([]); return; }
    const d = await getAdminRooms(branchId);
    setRooms((d.rooms || []).map((r) => ({ value: r.room_id, label: r.room_name })));
  };

  const openCreate = () => { setEditing(null); form.resetFields(); setRooms([]); setModalOpen(true); };
  const openEdit = (r) => {
    setEditing(r);
    form.setFieldsValue({
      class_name: r.class_name,
      course_id: r.course_id,
      branch_id: r.branch_id,
      teacher_id: r.teacher_id,
      room_id: r.room_id,
      max_students: r.max_students,
      start_date: r.start_date ? dayjs(r.start_date).format('YYYY-MM-DD') : null,
      end_date: r.end_date ? dayjs(r.end_date).format('YYYY-MM-DD') : null,
    });
    if (r.branch_id) loadRooms(r.branch_id);
    setModalOpen(true);
  };

  const openEnroll = async (r) => {
    setEnrollTarget(r);
    setEnrollModalOpen(true);
    setEnrollLoading(true);
    try {
      const d = await getEnrollments(r.class_id);
      setEnrollData({ enrolled: d.enrolled || [], available: d.available || [] });
    } catch { message.error('Không thể tải danh sách.'); }
    finally { setEnrollLoading(false); }
  };

  const handleEnrollAdd = async (studentId) => {
    try {
      await addEnrollment({ class_id: enrollTarget.class_id, student_id: studentId });
      message.success('Đã thêm học viên.');
      const d = await getEnrollments(enrollTarget.class_id);
      setEnrollData({ enrolled: d.enrolled || [], available: d.available || [] });
    } catch (e) { message.error(e?.response?.data?.message || 'Lỗi.'); }
  };

  const handleEnrollRemove = async (studentId) => {
    try {
      await removeEnrollment({ class_id: enrollTarget.class_id, student_id: studentId });
      message.success('Đã xóa học viên.');
      const d = await getEnrollments(enrollTarget.class_id);
      setEnrollData({ enrolled: d.enrolled || [], available: d.available || [] });
    } catch (e) { message.error(e?.response?.data?.message || 'Lỗi.'); }
  };

  const handleSave = async () => {
    let values;
    try { values = await form.validateFields(); } catch { return; }
    setSubmitting(true);
    try {
      if (editing) {
        await updateAdminClass(editing.class_id, values);
        message.success('Đã cập nhật lớp học.');
      } else {
        await createAdminClass(values);
        message.success('Đã tạo lớp học.');
      }
      setModalOpen(false);
      load();
    } catch (e) {
      message.error(e?.response?.data?.message || 'Lỗi khi lưu.');
    } finally { setSubmitting(false); }
  };

  const handleDelete = (r) => {
    Modal.confirm({
      title: `Xóa lớp "${r.class_name}"?`, okText: 'Xóa', okButtonProps: { danger: true }, cancelText: 'Hủy',
      async onOk() {
        try { await deleteAdminClass(r.class_id); message.success('Đã xóa.'); load(); }
        catch { message.error('Không thể xóa.'); }
      },
    });
  };

  const fmtDate = (v) => v ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(new Date(v)) : '—';

  const cols = [
    { title: 'Tên lớp', dataIndex: 'class_name', key: 'class_name', render: (v) => <span className="font-medium">{v}</span> },
    { title: 'Khóa học', dataIndex: 'course_name', key: 'course_name', render: (v) => <span className="text-sm text-slate-600">{v}</span> },
    { title: 'Chi nhánh', dataIndex: 'branch_name', key: 'branch_name' },
    { title: 'Giáo viên', dataIndex: 'teacher_name', key: 'teacher_name', render: (v) => v ?? <span className="text-slate-400">Chưa gán</span> },
    { title: 'Sĩ số tối đa', dataIndex: 'max_students', key: 'max_students', align: 'center' },
    { title: 'Khai giảng', dataIndex: 'start_date', key: 'start_date', render: fmtDate },
    { title: 'Kết thúc', dataIndex: 'end_date', key: 'end_date', render: fmtDate },
    {
      title: '', key: 'actions', width: 180,
      render: (_, r) => (
        <div className="flex gap-1 flex-wrap">
          <Button size="small" onClick={() => openEdit(r)}>Sửa</Button>
          <Button size="small" onClick={() => openEnroll(r)}>DS HV</Button>
          <Button size="small" danger onClick={() => handleDelete(r)}>Xóa</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="primary" onClick={openCreate}>+ Tạo lớp học</Button>
      </div>
      <Table columns={cols} dataSource={classes} rowKey="class_id" loading={loading} size="middle" scroll={{ x: 900 }} pagination={{ pageSize: 10 }} />

      {/* Create/Edit Class Modal */}
      <Modal title={editing ? 'Chỉnh sửa lớp học' : 'Tạo lớp học mới'} open={modalOpen}
        onOk={handleSave} onCancel={() => setModalOpen(false)} okText="Lưu" cancelText="Hủy"
        confirmLoading={submitting} width={560}>
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="class_name" label="Tên lớp" rules={[{ required: true, min: 2 }]}>
            <Input placeholder="Vd: IELTS 6.5 - Sáng T2T4" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="course_id" label="Khóa học" rules={[{ required: true }]}>
              <Select options={courses} placeholder="Chọn khóa học" />
            </Form.Item>
            <Form.Item name="max_students" label="Sĩ số tối đa" rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: '100%' }} addonAfter="HV" />
            </Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="branch_id" label="Chi nhánh" rules={[{ required: true }]}>
              <Select
                options={branches}
                placeholder="Chọn chi nhánh"
                onChange={(v) => { form.setFieldValue('room_id', null); loadRooms(v); }}
              />
            </Form.Item>
            <Form.Item name="room_id" label="Phòng học">
              <Select options={rooms} placeholder="Chọn phòng" allowClear />
            </Form.Item>
          </div>
          <Form.Item name="teacher_id" label="Giáo viên phụ trách" rules={[{ required: true }]}>
            <Select options={teachers} placeholder="Chọn giáo viên" showSearch filterOption={(input, opt) => opt.label.toLowerCase().includes(input.toLowerCase())} />
          </Form.Item>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="start_date" label="Ngày khai giảng">
              <Input type="date" />
            </Form.Item>
            <Form.Item name="end_date" label="Ngày kết thúc">
              <Input type="date" />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Enrollment Modal */}
      <Modal title={`Danh sách học viên — ${enrollTarget?.class_name}`}
        open={enrollModalOpen} onCancel={() => setEnrollModalOpen(false)} footer={null} width={680}>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">
              Đã đăng ký ({enrollData.enrolled.length})
            </p>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {enrollData.enrolled.length === 0 ? (
                <p className="text-sm text-slate-400">Chưa có học viên.</p>
              ) : enrollData.enrolled.map((s) => (
                <div key={s.student_id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5">
                  <div>
                    <p className="text-xs font-medium text-slate-800">{s.full_name}</p>
                    <p className="text-[11px] text-slate-400">{s.email}</p>
                  </div>
                  <Button size="small" danger onClick={() => handleEnrollRemove(s.student_id)}>Xóa</Button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">
              Có thể thêm ({enrollData.available.length})
            </p>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {enrollData.available.length === 0 ? (
                <p className="text-sm text-slate-400">Không có học viên khả dụng.</p>
              ) : enrollData.available.map((s) => (
                <div key={s.student_id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-1.5">
                  <div>
                    <p className="text-xs font-medium text-slate-800">{s.full_name}</p>
                    <p className="text-[11px] text-slate-400">{s.email}</p>
                  </div>
                  <Button size="small" type="primary" onClick={() => handleEnrollAdd(s.student_id)}>Thêm</Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ─── Rooms Tab ─── */
function RoomsTab() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [branchFilter, setBranchFilter] = useState(undefined);

  useEffect(() => {
    let mounted = true;
    Promise.all([getAdminRooms(), getBranches()]).then(([r, b]) => {
      if (!mounted) return;
      setRooms(r.rooms || []);
      setBranches((b.branches || []).map((br) => ({ value: br.branch_id, label: br.branch_name })));
    });
    return () => { mounted = false; };
  }, []);

  const loadRooms = async (branchId) => {
    setLoading(true);
    try {
      const d = await getAdminRooms(branchId);
      setRooms(d.rooms || []);
      setBranchFilter(branchId);
    } finally { setLoading(false); }
  };

  const cols = [
    { title: 'Phòng học', dataIndex: 'room_name', key: 'room_name', render: (v) => <span className="font-medium">{v}</span> },
    {
      title: 'Chi nhánh', dataIndex: 'branch_id', key: 'branch',
      render: (v) => branches.find((b) => b.value === v)?.label ?? '—',
    },
  ];

  return (
    <div className="space-y-4">
      <Select
        allowClear
        placeholder="Lọc theo chi nhánh"
        style={{ width: 200 }}
        options={branches}
        onChange={(v) => loadRooms(v)}
      />
      <Table columns={cols} dataSource={rooms} rowKey="room_id" loading={loading} size="middle" pagination={{ pageSize: 15 }} />
    </div>
  );
}

/* ─── Main Component ─── */
export default function CatalogManagement() {
  const tabItems = [
    { key: 'courses', label: 'Khóa học', children: <CoursesTab /> },
    { key: 'classes', label: 'Lớp học', children: <ClassesTab /> },
    { key: 'rooms', label: 'Phòng học', children: <RoomsTab /> },
  ];

  return (
    <AdminMasterLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Quản lý danh mục</h1>
          <p className="text-sm text-slate-500 mt-1">CRUD cho khóa học, lớp học và phòng học.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Tabs items={tabItems} />
        </div>
      </div>
    </AdminMasterLayout>
  );
}
