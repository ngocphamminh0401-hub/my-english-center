import React, { useEffect, useState } from 'react';
import { Button, Input, Modal, Upload, message } from 'antd';

const { TextArea } = Input;
const { Dragger } = Upload;

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.doc', '.docx', '.pdf', '.mp3', '.wav'];

const getFileExtension = (name) => {
  const lastDot = name.lastIndexOf('.');
  return lastDot >= 0 ? name.substring(lastDot).toLowerCase() : '';
};

export default function SubmissionForm({
  open,
  assignment,
  loading,
  readOnly = false,
  onClose,
  onSubmit,
}) {
  const [content, setContent] = useState('');
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (open) {
      setContent(assignment?.content || '');
      setFileList(
        assignment?.fileUrl
          ? [
              {
                uid: assignment.assignmentId,
                name: assignment.fileUrl.split('/').pop(),
                status: 'done',
                url: assignment.fileUrl,
              },
            ]
          : []
      );
    }
  }, [open, assignment]);

  const handleBeforeUpload = (file) => {
    const extension = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      message.error('Chỉ hỗ trợ file Word, PDF hoặc Audio (mp3, wav).');
      return Upload.LIST_IGNORE;
    }
    if (file.size > MAX_FILE_SIZE) {
      message.error('Dung lượng file vượt quá 10MB.');
      return Upload.LIST_IGNORE;
    }
    setFileList([
      {
        uid: file.uid,
        name: file.name,
        status: 'done',
        originFileObj: file,
      },
    ]);
    return false;
  };

  const handleRemove = () => {
    setFileList([]);
  };

  const handleSubmit = async () => {
    if (!content && fileList.length === 0) {
      message.error('Vui lòng nhập nội dung hoặc đính kèm file.');
      return;
    }
    const file = fileList[0]?.originFileObj || null;
    await onSubmit({ content, file });
  };

  return (
    <Modal
      open={open}
      title={readOnly ? 'Bài đã nộp' : 'Nộp bài tập'}
      onCancel={onClose}
      footer={
        readOnly
          ? [
              <Button key="close" onClick={onClose}>
                Đóng
              </Button>,
            ]
          : [
              <Button key="cancel" onClick={onClose}>
                Hủy
              </Button>,
              <Button
                key="submit"
                type="primary"
                loading={loading}
                onClick={handleSubmit}
              >
                Nộp bài
              </Button>,
            ]
      }
    >
      <div className="space-y-4">
        <div>
          <div className="text-sm font-semibold text-slate-700">
            {assignment?.title || 'Bài tập'}
          </div>
          {assignment?.dueDate && (
            <div className="text-xs text-slate-500">
              Hạn nộp: {new Date(assignment.dueDate).toLocaleString('vi-VN')}
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Nội dung bài làm
          </label>
          <TextArea
            rows={6}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Nhập nội dung bài làm..."
            disabled={readOnly}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Tệp đính kèm
          </label>
          {readOnly ? (
            fileList.length > 0 ? (
              <a
                href={fileList[0].url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-emerald-600 underline"
              >
                {fileList[0].name || 'Tải file'}
              </a>
            ) : (
              <div className="text-sm text-slate-500">
                Không có file đính kèm.
              </div>
            )
          ) : (
            <Dragger
              multiple={false}
              beforeUpload={handleBeforeUpload}
              onRemove={handleRemove}
              fileList={fileList}
              maxCount={1}
            >
              <p className="text-sm font-medium text-slate-600">
                Kéo & thả hoặc bấm để chọn file
              </p>
              <p className="text-xs text-slate-400">
                Hỗ trợ Word, PDF, Audio (mp3, wav). Tối đa 10MB.
              </p>
            </Dragger>
          )}
        </div>
      </div>
    </Modal>
  );
}
