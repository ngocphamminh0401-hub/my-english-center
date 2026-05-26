import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import RatingModal from './RatingModal';
import { getEvaluationStatus, submitEvaluation } from '../../../services/evaluationApi';

export default function EvaluationTrigger() {
  const [queue, setQueue] = useState([]);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const response = await getEvaluationStatus();
        if (!mounted) return;
        const classes = response.classes || [];
        if (classes.length > 0) {
          setQueue(classes);
          setOpen(true);
        }
      } catch (error) {
        const serverMessage = error?.response?.data?.message;
        message.error(serverMessage || 'Không thể tải trạng thái đánh giá.');
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const currentClass = queue[0];

  const handleSubmit = async ({ rating, comment }) => {
    if (!currentClass) return;
    try {
      setSubmitting(true);
      await submitEvaluation({
        class_id: currentClass.classId,
        teacher_id: currentClass.teacherId,
        rating,
        comment,
      });
      message.success('Gửi đánh giá thành công.');
      setQueue((prev) => {
        const next = prev.slice(1);
        if (next.length === 0) {
          setOpen(false);
        }
        return next;
      });
    } catch (error) {
      const serverMessage = error?.response?.data?.message;
      message.error(serverMessage || 'Không thể gửi đánh giá.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (!currentClass) return null;

  return (
    <RatingModal
      open={open}
      submitting={submitting}
      classInfo={currentClass}
      onSubmit={handleSubmit}
      onClose={handleClose}
    />
  );
}
