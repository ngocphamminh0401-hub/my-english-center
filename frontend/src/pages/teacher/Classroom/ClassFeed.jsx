import React, { useEffect, useState } from 'react';
import { Button, Input, List, Spin, message } from 'antd';
import {
  createClassAnnouncement,
  getClassAnnouncements,
} from '../../../services/classroomApi';

const { TextArea } = Input;

const formatDateTime = (value) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

export default function ClassFeed({ classId }) {
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [creating, setCreating] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const loadAnnouncements = async () => {
    if (!classId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await getClassAnnouncements(classId);
      setAnnouncements(response.announcements || []);
    } catch (error) {
      message.error('Không thể tải bảng tin lớp.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, [classId]);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      message.error('Vui lòng nhập tiêu đề và nội dung.');
      return;
    }
    try {
      setCreating(true);
      await createClassAnnouncement(classId, {
        title: title.trim(),
        content: content.trim(),
      });
      message.success('Đã đăng thông báo.');
      setTitle('');
      setContent('');
      setShowComposer(false);
      await loadAnnouncements();
    } catch (error) {
      const serverMessage = error?.response?.data?.message;
      message.error(serverMessage || 'Không thể đăng thông báo.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold text-slate-800">Bảng tin lớp</div>
        <Button type="primary" onClick={() => setShowComposer((prev) => !prev)}>
          {showComposer ? 'Đóng' : 'Tạo thông báo mới'}
        </Button>
      </div>

      {showComposer && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <Input
            placeholder="Tiêu đề thông báo"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <TextArea
            rows={4}
            placeholder="Nội dung thông báo..."
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
          <div className="flex justify-end">
            <Button type="primary" loading={creating} onClick={handleCreate}>
              Đăng thông báo
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {loading ? (
          <div className="flex justify-center py-6">
            <Spin />
          </div>
        ) : (
          <List
            dataSource={announcements}
            locale={{ emptyText: 'Chưa có thông báo.' }}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={<span className="font-semibold">{item.title}</span>}
                  description={<div className="text-sm">{item.content}</div>}
                />
                <div className="text-xs text-slate-400">
                  {formatDateTime(item.created_at)}
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
}
