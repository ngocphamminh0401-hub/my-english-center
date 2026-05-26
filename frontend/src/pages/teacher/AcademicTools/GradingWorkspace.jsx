import React, { useEffect, useMemo, useState } from 'react';
import { Avatar, Button, Input, InputNumber, Spin, Tabs, message } from 'antd';
import { useParams } from 'react-router-dom';
import TeacherLayout from '../../../layouts/TeacherLayout';
import {
  getSubmissionsBoard,
  gradeSubmission,
} from '../../../services/teacherAssignmentsApi';

const statusLabels = {
  not_submitted: 'Chưa nộp',
  pending: 'Chờ chấm',
  graded: 'Đã chấm',
};

const statusColors = {
  not_submitted: 'bg-slate-100 text-slate-500',
  pending: 'bg-amber-100 text-amber-700',
  graded: 'bg-emerald-100 text-emerald-700',
};

const buildList = (board) => {
  const all = [];
  board.notSubmitted.forEach((item) =>
    all.push({ ...item, statusKey: 'not_submitted' })
  );
  board.pending.forEach((item) => all.push({ ...item, statusKey: 'pending' }));
  board.graded.forEach((item) => all.push({ ...item, statusKey: 'graded' }));
  return all;
};

export default function GradingWorkspace() {
  const { assignment_id: assignmentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [board, setBoard] = useState({
    assignment: null,
    notSubmitted: [],
    pending: [],
    graded: [],
  });
  const [activeFilter, setActiveFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [gradeValue, setGradeValue] = useState(null);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const loadBoard = async () => {
    if (!assignmentId) return null;
    try {
      setLoading(true);
      const response = await getSubmissionsBoard(assignmentId);
      setBoard({
        assignment: response.assignment,
        notSubmitted: response.notSubmitted || [],
        pending: response.pending || [],
        graded: response.graded || [],
      });
      return response;
    } catch (error) {
      message.error('Không thể tải dữ liệu chấm bài.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoard();
  }, [assignmentId]);

  const allList = useMemo(() => buildList(board), [board]);

  const filteredList = useMemo(() => {
    if (activeFilter === 'all') return allList;
    return allList.filter((item) => item.statusKey === activeFilter);
  }, [activeFilter, allList]);

  useEffect(() => {
    if (selected) {
      setGradeValue(selected.grade ?? null);
      setComment(selected.teacherComment || '');
    } else {
      setGradeValue(null);
      setComment('');
    }
  }, [selected]);

  const handleSelect = (item) => {
    setSelected(item);
  };

  const handleSaveAndNext = async () => {
    if (!selected?.submissionId) {
      message.error('Bài làm chưa được nộp.');
      return;
    }
    if (gradeValue === null || Number.isNaN(Number(gradeValue))) {
      message.error('Vui lòng nhập điểm.');
      return;
    }
    try {
      setSaving(true);
      await gradeSubmission(selected.submissionId, {
        grade: Number(gradeValue),
        teacher_comment: comment,
      });
      message.success('Đã lưu điểm.');
      const response = await loadBoard();
      if (!response) return;
      const updatedBoard = {
        assignment: response.assignment,
        notSubmitted: response.notSubmitted || [],
        pending: response.pending || [],
        graded: response.graded || [],
      };
      const updatedList = buildList(updatedBoard).filter((item) =>
        activeFilter === 'all' ? true : item.statusKey === activeFilter
      );
      const nextItem = updatedList.find(
        (item) => item.studentId !== selected.studentId
      );
      setSelected(nextItem || null);
    } catch (error) {
      const serverMessage = error?.response?.data?.message;
      message.error(serverMessage || 'Không thể lưu điểm.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex h-[70vh] items-center justify-center">
          <Spin />
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">Bài tập</div>
          <div className="text-xl font-semibold text-slate-800">
            {board.assignment?.title || 'Assignment'}
          </div>
          {board.assignment?.description && (
            <div className="mt-2 text-sm text-slate-500">
              {board.assignment.description}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
          <div className="w-full lg:w-[32%] space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <Tabs
                activeKey={activeFilter}
                onChange={setActiveFilter}
                items={[
                  { key: 'all', label: `Tất cả (${allList.length})` },
                  {
                    key: 'not_submitted',
                    label: `Chưa nộp (${board.notSubmitted.length})`,
                  },
                  {
                    key: 'pending',
                    label: `Chờ chấm (${board.pending.length})`,
                  },
                  { key: 'graded', label: `Đã chấm (${board.graded.length})` },
                ]}
              />

              {filteredList.length === 0 ? (
                <div className="text-sm text-slate-500">
                  Không có học viên phù hợp.
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredList.map((item) => (
                    <button
                      key={`${item.studentId}-${item.statusKey}`}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                        selected?.studentId === item.studentId
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar style={{ backgroundColor: '#6366f1' }}>
                          {item.fullName?.charAt(0) || 'S'}
                        </Avatar>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-slate-800">
                            {item.fullName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {item.submissionId
                              ? 'Đã nộp bài'
                              : 'Chưa có bài nộp'}
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[item.statusKey]}`}
                        >
                          {statusLabels[item.statusKey]}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            {!selected ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Vui lòng chọn một học viên để bắt đầu chấm bài.
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-slate-500">Học viên</div>
                  <div className="text-lg font-semibold text-slate-800">
                    {selected.fullName}
                  </div>
                </div>

                {selected.submissionId ? (
                  <>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                      {selected.content || 'Không có nội dung bài làm.'}
                    </div>
                    {selected.fileUrl && (
                      <a
                        href={selected.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-indigo-600 underline"
                      >
                        Tải file bài làm
                      </a>
                    )}
                  </>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    Học viên chưa nộp bài.
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div>
                    <div className="mb-1 text-sm font-medium text-slate-700">
                      Điểm số
                    </div>
                    <InputNumber
                      className="w-full"
                      value={gradeValue}
                      onChange={setGradeValue}
                      min={0}
                      max={10}
                      step={0.5}
                      disabled={!selected.submissionId}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <div className="mb-1 text-sm font-medium text-slate-700">
                      Nhận xét
                    </div>
                    <Input.TextArea
                      rows={6}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      disabled={!selected.submissionId}
                      placeholder="Nhận xét của giáo viên..."
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="primary"
                    loading={saving}
                    onClick={handleSaveAndNext}
                    disabled={!selected.submissionId}
                  >
                    Lưu & Chuyển tiếp
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
