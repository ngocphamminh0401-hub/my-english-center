import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input, Radio, Spin, Table, message } from 'antd';
import { getClassAttendance, saveClassAttendance } from '../../../services/classroomApi';

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

const defaultStatus = 'present';

export default function AttendanceGrid({ classId, scheduleId }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schedule, setSchedule] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});

  useEffect(() => {
    let mounted = true;
    const loadAttendance = async () => {
      if (!classId || !scheduleId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await getClassAttendance(classId, scheduleId);
        if (!mounted) return;
        setSchedule(response.schedule);
        setStudents(response.students || []);
        const nextMap = {};
        (response.students || []).forEach((student) => {
          nextMap[student.student_id] = {
            status: student.status || defaultStatus,
            note: student.note || '',
          };
        });
        setAttendanceMap(nextMap);
      } catch (error) {
        message.error('Không thể tải dữ liệu điểm danh.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadAttendance();
    return () => {
      mounted = false;
    };
  }, [classId, scheduleId]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleNoteChange = (studentId, note) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        note,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = students.map((student) => ({
        student_id: student.student_id,
        status: attendanceMap[student.student_id]?.status || defaultStatus,
        note: attendanceMap[student.student_id]?.note || '',
      }));
      await saveClassAttendance(classId, scheduleId, payload);
      message.success('Lưu điểm danh thành công.');
    } catch (error) {
      const serverMessage = error?.response?.data?.message;
      message.error(serverMessage || 'Không thể lưu điểm danh.');
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        title: 'Học viên',
        dataIndex: 'full_name',
        key: 'full_name',
        width: 220,
      },
      {
        title: 'Trạng thái',
        key: 'status',
        render: (_, record) => (
          <Radio.Group
            value={attendanceMap[record.student_id]?.status || defaultStatus}
            onChange={(event) =>
              handleStatusChange(record.student_id, event.target.value)
            }
          >
            <Radio value="present">Có mặt</Radio>
            <Radio value="late">Đi muộn</Radio>
            <Radio value="absent">Vắng mặt</Radio>
          </Radio.Group>
        ),
      },
      {
        title: 'Ghi chú',
        key: 'note',
        render: (_, record) => (
          <Input
            value={attendanceMap[record.student_id]?.note || ''}
            onChange={(event) =>
              handleNoteChange(record.student_id, event.target.value)
            }
            placeholder="Ví dụ: Xin phép ốm"
            size="small"
          />
        ),
      },
    ],
    [attendanceMap]
  );

  if (!classId || !scheduleId) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
        Vui lòng chọn buổi học từ lịch dạy để điểm danh.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold text-slate-800">
          {schedule?.class_name || 'Buổi học'}
        </div>
        <div className="text-xs text-slate-500">
          {schedule?.session_date ? formatDate(schedule.session_date) : ''}{' '}
          {schedule?.start_time
            ? `• ${formatTime(schedule.start_time)} - ${formatTime(
                schedule.end_time
              )}`
            : ''}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {loading ? (
          <div className="flex justify-center py-8">
            <Spin />
          </div>
        ) : (
          <>
            <Table
              dataSource={students}
              columns={columns}
              rowKey="student_id"
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: 'Chưa có học viên.' }}
            />
            <div className="mt-4 flex justify-end">
              <Button type="primary" loading={saving} onClick={handleSave}>
                Lưu điểm danh
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
