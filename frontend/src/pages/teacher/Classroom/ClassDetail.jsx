import React, { useState } from 'react';
import { Tabs } from 'antd';
import { useParams } from 'react-router-dom';
import TeacherLayout from '../../../layouts/TeacherLayout';
import AttendanceGrid from './AttendanceGrid';
import ClassFeed from './ClassFeed';
import StudentList from './StudentList';

export default function ClassDetail() {
  const { class_id: classId, schedule_id: scheduleId } = useParams();
  const [activeTab, setActiveTab] = useState('students');

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Quản lý lớp học
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi học viên, điểm danh và thông báo lớp học.
          </p>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'students',
              label: 'Danh sách học viên',
              children: <StudentList classId={classId} />,
            },
            {
              key: 'attendance',
              label: 'Điểm danh',
              children: (
                <AttendanceGrid classId={classId} scheduleId={scheduleId} />
              ),
            },
            {
              key: 'feed',
              label: 'Bảng tin lớp',
              children: <ClassFeed classId={classId} />,
            },
          ]}
        />
      </div>
    </TeacherLayout>
  );
}
