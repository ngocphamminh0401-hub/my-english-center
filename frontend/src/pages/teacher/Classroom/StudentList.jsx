import React, { useEffect, useState } from 'react';
import { Spin, Table, message } from 'antd';
import { getClassStudents } from '../../../services/classroomApi';

export default function StudentList({ classId }) {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    let mounted = true;
    const loadStudents = async () => {
      if (!classId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await getClassStudents(classId);
        if (!mounted) return;
        setStudents(response.students || []);
      } catch (error) {
        message.error('Không thể tải danh sách học viên.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadStudents();
    return () => {
      mounted = false;
    };
  }, [classId]);

  const columns = [
    {
      title: 'Học viên',
      dataIndex: 'full_name',
      key: 'full_name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (value) => value || '—',
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {loading ? (
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      ) : (
        <Table
          dataSource={students}
          columns={columns}
          rowKey="student_id"
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: 'Chưa có học viên.' }}
        />
      )}
    </div>
  );
}
