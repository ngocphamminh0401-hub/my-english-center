import React, { useEffect, useState } from 'react';
import { Tabs, message } from 'antd';
import AssignmentList from './AssignmentList';
import SubmissionForm from './SubmissionForm';
import FeedbackModal from './FeedbackModal';
import {
  getStudentAssignments,
  submitAssignment,
  getAssignmentFeedback,
} from '../../../services/assignmentApi';
import MasterLayout from '../../../layouts/MasterLayout';

export default function AssignmentSpace() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    pending: [],
    submitted: [],
    graded: [],
  });
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionOpen, setSubmissionOpen] = useState(false);
  const [readOnlySubmission, setReadOnlySubmission] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const response = await getStudentAssignments();
      setData({
        pending: response.pending || [],
        submitted: response.submitted || [],
        graded: response.graded || [],
      });
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách bài tập.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleOpenSubmit = (assignment) => {
    setSelectedAssignment(assignment);
    setReadOnlySubmission(false);
    setSubmissionOpen(true);
  };

  const handleOpenView = (assignment) => {
    setSelectedAssignment(assignment);
    setReadOnlySubmission(true);
    setSubmissionOpen(true);
  };

  const handleSubmitAssignment = async ({ content, file }) => {
    if (!selectedAssignment) return;
    try {
      setSubmitLoading(true);
      await submitAssignment(selectedAssignment.assignmentId, { content, file });
      message.success('Nộp bài thành công.');
      setSubmissionOpen(false);
      await loadAssignments();
    } catch (err) {
      const serverMessage = err?.response?.data?.message;
      message.error(serverMessage || 'Không thể nộp bài.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleOpenFeedback = async (assignment) => {
    setSelectedAssignment(assignment);
    setFeedbackOpen(true);
    setFeedbackLoading(true);
    try {
      const response = await getAssignmentFeedback(assignment.assignmentId);
      setFeedback(response.feedback);
    } catch (err) {
      const serverMessage = err?.response?.data?.message;
      message.error(serverMessage || 'Không thể tải phản hồi.');
      setFeedback(null);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const renderContent = (items, variant) => {
    if (loading) {
      return (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
          Đang tải danh sách...
        </div>
      );
    }
    if (error) {
      return (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          {error}
        </div>
      );
    }
    return (
      <AssignmentList
        items={items}
        variant={variant}
        onAction={(item) => {
          if (variant === 'pending') {
            handleOpenSubmit(item);
          } else if (variant === 'submitted') {
            handleOpenView(item);
          } else {
            handleOpenFeedback(item);
          }
        }}
      />
    );
  };

  return (
    <MasterLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Không gian Bài tập
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi và nộp bài tập của bạn theo từng trạng thái.
          </p>
        </div>

        <Tabs
          defaultActiveKey="pending"
          items={[
            {
              key: 'pending',
              label: `Chưa làm (${data.pending.length})`,
              children: renderContent(data.pending, 'pending'),
            },
            {
              key: 'submitted',
              label: `Đã nộp (${data.submitted.length})`,
              children: renderContent(data.submitted, 'submitted'),
            },
            {
              key: 'graded',
              label: `Đã chấm (${data.graded.length})`,
              children: renderContent(data.graded, 'graded'),
            },
          ]}
        />
      </div>

      <SubmissionForm
        open={submissionOpen}
        assignment={selectedAssignment}
        loading={submitLoading}
        readOnly={readOnlySubmission}
        onClose={() => setSubmissionOpen(false)}
        onSubmit={handleSubmitAssignment}
      />

      <FeedbackModal
        open={feedbackOpen}
        loading={feedbackLoading}
        feedback={feedback}
        onClose={() => setFeedbackOpen(false)}
      />
    </MasterLayout>
  );
}
