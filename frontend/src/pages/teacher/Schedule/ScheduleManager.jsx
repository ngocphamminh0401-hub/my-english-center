import React, { useEffect, useState } from 'react';
import { Spin, Table, Tabs, message } from 'antd';
import TeacherLayout from '../../../layouts/TeacherLayout';
import { getTeacherSchedules } from '../../../services/teacherApi';

const formatDate = (value) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(
    new Date(value)
  );
};

const formatTime = (value) => {
  if (!value) return '';
  return value.toString().slice(0, 5);
};

export default function ScheduleManager() {
  const [activeTab, setActiveTab] = useState('current');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    let mounted = true;
    const loadSchedules = async () => {
      try {
        setLoading(true);
        const response = await getTeacherSchedules({ status: activeTab });
        if (!mounted) return;
        setData(response.schedules || []);
      } catch (error) {
        message.error('Không thể tải lịch dạy.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadSchedules();
    return () => {
      mounted = false;
    };
  }, [activeTab]);

  const columns = [
    {
      title: 'Lớp học',
      dataIndex: 'class_name',
      key: 'class_name',
    },
    {
      title: 'Ngày dạy',
      dataIndex: 'session_date',
      key: 'session_date',
      render: (value) => formatDate(value),
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_, record) =>
        `${formatTime(record.start_time)} - ${formatTime(record.end_time)}`,
    },
    {
      title: 'Phòng học',
      dataIndex: 'room_name',
      key: 'room_name',
      render: (value) => value || 'Chưa cập nhật',
    },
    {
      title: 'Cơ sở',
      dataIndex: 'branch_name',
      key: 'branch_name',
      render: (value) => value || 'Chưa cập nhật',
    },
  ];

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Quản lý lịch trình
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi các ca dạy theo trạng thái lớp.
          </p>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: 'current', label: 'Current' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'past', label: 'Past' },
          ]}
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {loading ? (
            <div className="flex justify-center py-8">
              <Spin />
            </div>
          ) : (
            <Table
              dataSource={data}
              columns={columns}
              rowKey="schedule_id"
              pagination={{ pageSize: 6 }}
              locale={{ emptyText: 'Không có lịch dạy phù hợp.' }}
            />
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}
