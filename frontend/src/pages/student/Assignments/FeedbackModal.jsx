import React from 'react';
import { Modal, Spin } from 'antd';

export default function FeedbackModal({ open, loading, feedback, onClose }) {
  return (
    <Modal open={open} title="Điểm & Phản hồi" onCancel={onClose} footer={null}>
      {loading ? (
        <div className="flex justify-center py-6">
          <Spin />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl bg-emerald-50 p-4 text-center">
            <div className="text-xs font-semibold text-emerald-600">Điểm số</div>
            <div className="mt-2 text-4xl font-bold text-emerald-700">
              {feedback?.grade ?? '—'}
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-700">Nhận xét</div>
            <div className="mt-2 whitespace-pre-line rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              {feedback?.teacher_comment || 'Chưa có nhận xét từ giáo viên.'}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
