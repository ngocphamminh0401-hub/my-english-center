import React, { useEffect, useState } from 'react';
import { Button, Input, Modal, Table, Upload, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import TeacherLayout from '../../../layouts/TeacherLayout';
import {
  createTeacherAssignment,
  getTeacherAssignments,
} from '../../../services/teacherAssignmentsApi';

const { TextArea } = Input;

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.pdf', '.mp3', '.wav'];

const getFileExtension = (name) => {
  const lastDot = name.lastIndexOf('.');
  return lastDot >= 0 ? name.substring(lastDot).toLowerCase() : '';
};

const formatDate = (value) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(
    new Date(value)
  );
};

export default function AssignmentManager() {
  const { class_id: classId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [fileList, setFileList] = useState([]);

  const loadAssignments = async () => {
    if (!classId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await getTeacherAssignments(classId);
      setAssignments(response.assignments || []);
    } catch (error) {
      message.error('Không thể tải danh sách bài tập.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [classId]);

  const handleBeforeUpload = (file) => {
    const extension = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      message.error('Chỉ hỗ trợ file PDF hoặc Audio (mp3, wav).');
      return Upload.LIST_IGNORE;
    }
    if (file.size > MAX_FILE_SIZE) {
      message.error('Dung lượng file vượt quá 20MB.');
      return Upload.LIST_IGNORE;
    }
    setFileList([
      {
        uid: file.uid,
        name: file.name,
        status: 'done',
        originFileObj: file,
      },
    ]);
    return false;
  };

  const handleRemove = () => {
    setFileList([]);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setFileList([]);
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      message.error('Vui lòng nhập tiêu đề.');
      return;
    }
    try {
      setCreating(true);
      const file = fileList[0]?.originFileObj || null;
      await createTeacherAssignment(classId, {
        title: title.trim(),
        description: description.trim(),
        due_date: dueDate || null,
        file,
      });
      message.success('Đã tạo bài tập.');
      setModalOpen(false);
      resetForm();
      await loadAssignments();
    } catch (error) {
      const serverMessage = error?.response?.data?.message;
      message.error(serverMessage || 'Không thể tạo bài tập.');
    } finally {
      setCreating(false);
    }
  };

  const columns = [
    {
      title: 'Bài tập',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Hạn nộp',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (value) => formatDate(value),
    },
    {
      title: 'Chờ chấm',
      dataIndex: 'pending_count',
      key: 'pending_count',
      render: (value) => value || 0,
    },
    {
      title: 'Đã chấm',
      dataIndex: 'graded_count',
      key: 'graded_count',
      render: (value) => value || 0,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() =>
            navigate(`/teacher/assignments/${record.assignment_id}/grading`)
          }
        >
          Chấm bài
        </Button>
      ),
    },
  ];

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Quản lý bài tập
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Tạo bài tập mới và chấm bài liên tục.
            </p>
          </div>
          <Button type="primary" onClick={() => setModalOpen(true)}>
            Tạo bài tập mới
          </Button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <Table
            dataSource={assignments}
            columns={columns}
            rowKey="assignment_id"
            loading={loading}
            pagination={{ pageSize: 8 }}
            locale={{ emptyText: 'Chưa có bài tập.' }}
          />
        </div>
      </div>

      <Modal
        open={modalOpen}
        title="Tạo bài tập mới"
        onCancel={() => {
          setModalOpen(false);
          resetForm();
        }}
        onOk={handleCreate}
        okText="Tạo bài tập"
        confirmLoading={creating}
      >
        <div className="space-y-4">
          <div>
            <div className="mb-1 text-sm font-medium text-slate-700">
              Tiêu đề
            </div>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ví dụ: Writing Task 1"
            />
          </div>
          <div>
            <div className="mb-1 text-sm font-medium text-slate-700">
              Hạn nộp
            </div>
            <Input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>
          <div>
            <div className="mb-1 text-sm font-medium text-slate-700">
              Mô tả
            </div>
            <TextArea
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Nội dung bài tập..."
            />
          </div>
          <div>
            <div className="mb-1 text-sm font-medium text-slate-700">
              File đính kèm
            </div>
            <Upload
              beforeUpload={handleBeforeUpload}
              onRemove={handleRemove}
              fileList={fileList}
              maxCount={1}
            >
              <Button>Chọn file (PDF/Audio)</Button>
            </Upload>
          </div>
        </div>
      </Modal>
    </TeacherLayout>
  );
}
