import React, { useState } from 'react';
import { Button, Input, Radio, message, Alert } from 'antd';
import AdminMasterLayout from '../../../layouts/AdminLayout';
import { createBroadcast } from '../../../services/adminOpsApi';

const TARGET_OPTIONS = [
  {
    value: 'all',
    label: 'Toàn bộ hệ thống',
    description: 'Gửi đến tất cả giáo viên và học viên',
  },
  {
    value: 'teachers',
    label: 'Tất cả Giáo viên',
    description: 'Chỉ gửi đến nhóm giáo viên',
  },
  {
    value: 'students',
    label: 'Tất cả Học viên',
    description: 'Chỉ gửi đến nhóm học viên',
  },
];

const TARGET_LABELS = Object.fromEntries(
  TARGET_OPTIONS.map((o) => [o.value, o.label])
);

export default function SystemBroadcast() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const handleBroadcast = async () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      message.warning('Vui lòng nhập tiêu đề thông báo.');
      return;
    }
    if (!trimmedContent) {
      message.warning('Vui lòng nhập nội dung thông báo.');
      return;
    }

    setLoading(true);
    setLastResult(null);
    try {
      const result = await createBroadcast({
        title: trimmedTitle,
        content: trimmedContent,
        targetType,
      });

      setLastResult({
        type: 'success',
        announcementId: result.announcementId,
        target: TARGET_LABELS[targetType],
        createdAt: result.createdAt,
      });

      message.success('Thông báo đã được phát sóng thành công!');
      setTitle('');
      setContent('');
      setTargetType('all');
    } catch {
      message.error('Có lỗi xảy ra khi phát sóng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminMasterLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">
            Phát sóng thông báo hệ thống
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Thông báo sẽ được hiển thị cho toàn bộ người dùng được chọn.
          </p>
        </div>

        {lastResult && (
          <Alert
            type="success"
            showIcon
            message="Phát sóng thành công"
            description={
              <span>
                Thông báo #{lastResult.announcementId} đã được gửi đến{' '}
                <strong>{lastResult.target}</strong>.
              </span>
            }
            closable
            onClose={() => setLastResult(null)}
          />
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tiêu đề <span className="text-rose-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề thông báo..."
              maxLength={200}
              showCount
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nội dung <span className="text-rose-500">*</span>
            </label>
            <Input.TextArea
              rows={7}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Soạn nội dung thông báo tại đây..."
              showCount
              maxLength={1000}
            />
          </div>

          {/* Target audience */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Đối tượng nhận
            </label>
            <Radio.Group
              value={targetType}
              onChange={(e) => setTargetType(e.target.value)}
              className="flex flex-col gap-2"
            >
              {TARGET_OPTIONS.map((opt) => (
                <Radio key={opt.value} value={opt.value}>
                  <span className="font-medium text-slate-700">{opt.label}</span>
                  <span className="ml-2 text-xs text-slate-400">
                    — {opt.description}
                  </span>
                </Radio>
              ))}
            </Radio.Group>
          </div>

          {/* Broadcast button */}
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={handleBroadcast}
            disabled={!title.trim() || !content.trim()}
            className="w-full"
            style={{ backgroundColor: '#e11d48', borderColor: '#e11d48' }}
          >
            {loading ? 'Đang phát sóng...' : 'Phát sóng (Broadcast)'}
          </Button>
        </div>

        {/* Info panel */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-600 mb-2">Lưu ý</p>
          <ul className="text-xs text-slate-500 space-y-1 list-disc pl-4">
            <li>Thông báo hệ thống sẽ hiển thị ngay lập tức trên portal.</li>
            <li>
              Lựa chọn "Toàn bộ hệ thống" gửi đến tất cả giáo viên và học viên.
            </li>
            <li>Thông báo đã gửi không thể thu hồi qua giao diện này.</li>
          </ul>
        </div>
      </div>
    </AdminMasterLayout>
  );
}
