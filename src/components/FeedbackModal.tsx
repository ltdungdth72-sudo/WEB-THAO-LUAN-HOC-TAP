import React, { useState, useEffect } from 'react';
import { GroupSubmission, TeacherFeedback, TopicConfig } from '../types.ts';
import { playFeedbackSavedSound } from '../utils/sound.ts';
import { X, Save, CheckCircle2, MessageSquare, ThumbsUp, AlertTriangle, Lightbulb, Globe, Lock } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: number;
  submission?: GroupSubmission;
  feedback?: TeacherFeedback;
  topic?: TopicConfig;
  teacherPin: string;
  onSaveFeedbackSuccess: (updatedFeedback: TeacherFeedback, updatedSubmission: GroupSubmission) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  groupId,
  submission,
  feedback,
  topic,
  teacherPin,
  onSaveFeedbackSuccess
}) => {
  const [generalComment, setGeneralComment] = useState('');
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [isReviewed, setIsReviewed] = useState(false);
  const [isPublishedToStudent, setIsPublishedToStudent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (feedback) {
      setGeneralComment(feedback.generalComment || '');
      setStrengths(feedback.strengths || '');
      setImprovements(feedback.improvements || '');
      setSuggestions(feedback.suggestions || '');
      setIsReviewed(Boolean(feedback.isReviewed));
      setIsPublishedToStudent(Boolean(feedback.isPublishedToStudent));
    } else {
      setGeneralComment('');
      setStrengths('');
      setImprovements('');
      setSuggestions('');
      setIsReviewed(false);
      setIsPublishedToStudent(false);
    }
    setSaveMessage('');
  }, [feedback, groupId, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (markAsReviewedOverride?: boolean) => {
    setIsSaving(true);
    setSaveMessage('');

    const reviewedState = markAsReviewedOverride !== undefined ? markAsReviewedOverride : isReviewed;

    try {
      const res = await fetch('/api/teacher/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-teacher-pin': teacherPin
        },
        body: JSON.stringify({
          groupId,
          generalComment,
          strengths,
          improvements,
          suggestions,
          isReviewed: reviewedState,
          isPublishedToStudent
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsReviewed(reviewedState);
        playFeedbackSavedSound();
        setSaveMessage('Đã lưu nhận xét và đồng bộ thành công!');
        onSaveFeedbackSuccess(data.feedback, data.submission);
        setTimeout(() => {
          setSaveMessage('');
        }, 3000);
      } else {
        setSaveMessage(data.error || 'Lỗi khi lưu nhận xét');
      }
    } catch {
      setSaveMessage('Lỗi kết nối máy chủ!');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 text-slate-900 relative border border-slate-200 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-600 text-white font-extrabold rounded-lg text-sm">
              Nhóm {groupId}
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Nhận Xét & Đánh Giá Tiết Học
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Chủ đề: <span className="font-semibold text-slate-700">{topic?.title}</span>
          </p>
        </div>

        {/* Quick View of Submission Summary */}
        <div className="mb-5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-900">Trạng thái bài nộp của nhóm:</span>
            <span className="font-bold text-blue-600 uppercase">
              {submission?.status === 'reviewed'
                ? 'Đã nhận xét'
                : submission?.status === 'submitted'
                ? 'Đã gửi bài'
                : submission?.status === 'in_progress'
                ? 'Đang làm bài'
                : 'Chưa nộp bài'}
            </span>
          </div>
          {submission?.submittedAt && (
            <div className="flex justify-between">
              <span>Thời gian nộp bài:</span>
              <span className="font-mono text-slate-600">
                {new Date(submission.submittedAt).toLocaleTimeString('vi-VN')} ({new Date(submission.submittedAt).toLocaleDateString('vi-VN')})
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Tổng độ dài câu trả lời:</span>
            <span className="font-mono font-medium text-slate-800">
              {submission?.wordCount?.total || 0} từ
            </span>
          </div>
        </div>

        {/* 4 Feedback Fields */}
        <div className="space-y-4">
          {/* Field 1: Nhận xét chung */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>1. Nhận xét chung</span>
            </label>
            <textarea
              value={generalComment}
              onChange={e => setGeneralComment(e.target.value)}
              placeholder="Nhận xét tổng quát về mức độ hiểu bài, khả năng phân tích và tinh thần thảo luận của nhóm..."
              rows={2}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 bg-white"
            />
          </div>

          {/* Field 2: Điểm mạnh */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-1">
              <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>2. Điểm mạnh / Ưu điểm nổi bật</span>
            </label>
            <textarea
              value={strengths}
              onChange={e => setStrengths(e.target.value)}
              placeholder="Chỉ ra các lập luận sắc bén, ví dụ thực tế chính xác hoặc giải pháp hay của nhóm..."
              rows={2}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 bg-white"
            />
          </div>

          {/* Field 3: Nội dung cần bổ sung */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>3. Nội dung cần bổ sung / Lưu ý</span>
            </label>
            <textarea
              value={improvements}
              onChange={e => setImprovements(e.target.value)}
              placeholder="Những khía cạnh chưa đầy đủ, nhầm lẫn về quy định pháp luật bản quyền cần làm rõ..."
              rows={2}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-500 bg-white"
            />
          </div>

          {/* Field 4: Đề xuất hướng hoàn thiện */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-purple-800 mb-1">
              <Lightbulb className="w-3.5 h-3.5 text-purple-600" />
              <span>4. Đề xuất hướng hoàn thiện</span>
            </label>
            <textarea
              value={suggestions}
              onChange={e => setSuggestions(e.target.value)}
              placeholder="Lời khuyên ứng dụng vào thực tế khi học sinh tạo video, bài thuyết trình hoặc tải phần mềm..."
              rows={2}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-purple-500 bg-white"
            />
          </div>
        </div>

        {/* Toggles & Options */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isReviewed}
              onChange={e => setIsReviewed(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500"
            />
            <span className="font-semibold text-slate-800">
              Đánh dấu đã hoàn thành nhận xét (Chuyển thẻ sang màu xanh lá)
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPublishedToStudent}
              onChange={e => setIsPublishedToStudent(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500"
            />
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              {isPublishedToStudent ? (
                <>
                  <Globe className="w-3.5 h-3.5 text-blue-600" /> Công khai nhận xét cho học sinh
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-slate-500" /> Nhận xét nội bộ giáo viên
                </>
              )}
            </span>
          </label>
        </div>

        {saveMessage && (
          <div className="mt-3 p-2 bg-emerald-50 text-emerald-800 text-xs rounded-lg flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
          >
            Đóng
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Lưu & Đánh dấu đã nhận xét</span>
          </button>

          <button
            onClick={() => handleSave()}
            disabled={isSaving}
            className="py-2.5 px-4 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-md flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Đang lưu...' : 'LƯU NHẬN XÉT'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
