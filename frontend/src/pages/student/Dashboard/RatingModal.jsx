import React, { useEffect, useState } from 'react';
import { Button, Input, Modal, Rate } from 'antd';

const { TextArea } = Input;

export default function RatingModal({
  open,
  submitting,
  classInfo,
  onSubmit,
  onClose,
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (open) {
      setRating(0);
      setComment('');
    }
  }, [open, classInfo?.classId]);

  const handleSubmit = () => {
    if (rating < 1) return;
    onSubmit({ rating, comment });
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      destroyOnClose
    >
      <div className="space-y-4">
        <div className="rounded-2xl bg-emerald-50 p-4 text-center">
          <div className="text-sm font-semibold text-emerald-700">
            Chúc mừng bạn đã hoàn thành khóa học!
          </div>
          <div className="mt-1 text-xs text-emerald-600">
            Hãy dành 1 phút để đánh giá trải nghiệm của mình nhé.
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="text-sm font-semibold text-slate-800">
            {classInfo?.className || 'Lớp học'}
          </div>
          <div className="text-xs text-slate-500">
            Giáo viên: {classInfo?.teacherName || `#${classInfo?.teacherId || ''}`}
          </div>
        </div>

        <div className="text-center">
          <Rate value={rating} onChange={setRating} />
        </div>

        <div>
          <TextArea
            rows={4}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Chia sẻ thêm về trải nghiệm học tập của bạn..."
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Để sau</Button>
          <Button
            type="primary"
            disabled={rating < 1}
            loading={submitting}
            onClick={handleSubmit}
          >
            Gửi đánh giá
          </Button>
        </div>
      </div>
    </Modal>
  );
}
