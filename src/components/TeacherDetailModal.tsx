import React from 'react';
import { ClassroomSession, GroupSubmission, TeacherFeedback, TopicConfig } from '../types.ts';
import { X, Maximize2, MessageSquare, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface TeacherDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: number;
  session: ClassroomSession;
  submission?: GroupSubmission;
  feedback?: TeacherFeedback;
  topic?: TopicConfig;
  onOpenPresentation: (groupId: number) => void;
  onOpenFeedback: (groupId: number) => void;
}

export const TeacherDetailModal: React.FC<TeacherDetailModalProps> = ({
  isOpen,
  onClose,
  groupId,
  session,
  submission,
  feedback,
  topic,
  onOpenPresentation,
  onOpenFeedback
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 text-slate-900 border border-slate-200 shadow-2xl my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-extrabold text-base">
              Nhóm {groupId}
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Chi Tiết Bài Thảo Luận
              </h2>
              <p className="text-xs text-slate-500">{topic?.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tình huống và trạng thái */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-blue-600 uppercase">Tình huống được giao</span>
            <div className="flex items-center gap-2">
              {submission?.status === 'reviewed' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đã nhận xét
                </span>
              ) : submission?.status === 'submitted' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Đã gửi bài
                </span>
              ) : submission?.status === 'in_progress' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                  Đang làm bài
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-medium">
                  Chưa bắt đầu
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed italic">
            &ldquo;{topic?.situation}&rdquo;
          </p>

          <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>
              Nộp lúc: {submission?.submittedAt ? new Date(submission.submittedAt).toLocaleTimeString('vi-VN') : 'Chưa nộp'}
            </span>
            <span>Tổng số từ: {submission?.wordCount?.total || 0} từ</span>
          </div>
        </div>

        {/* 3 Câu trả lời của nhóm */}
        <div className="space-y-4 mb-5 max-h-[50vh] overflow-y-auto pr-1">
          {session.questions.map((q, idx) => {
            const answer = idx === 0 ? submission?.answer1 : idx === 1 ? submission?.answer2 : submission?.answer3;
            const wordCount = idx === 0 ? submission?.wordCount?.ans1 : idx === 1 ? submission?.wordCount?.ans2 : submission?.wordCount?.ans3;

            return (
              <div key={q.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                    CÂU HỎI {idx + 1}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">{wordCount || 0} từ</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 mb-2">{q.question}</h4>
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-800 whitespace-pre-wrap leading-relaxed border border-slate-100">
                  {answer ? answer : <span className="text-slate-400 italic">Nhóm chưa nhập câu trả lời.</span>}
                </div>
              </div>
            );
          })}

          {/* Teacher Feedback section if exists */}
          {feedback && (feedback.generalComment || feedback.strengths || feedback.improvements || feedback.suggestions) && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
              <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Nhận xét hiện tại của giáo viên ({session.teacherName}):</span>
              </div>
              {feedback.generalComment && (
                <p className="text-xs text-slate-700 mb-1.5">
                  <span className="font-semibold text-slate-900">Chung: </span>
                  {feedback.generalComment}
                </p>
              )}
              {feedback.strengths && (
                <p className="text-xs text-emerald-800 mb-1.5">
                  <span className="font-semibold">Điểm mạnh: </span>
                  {feedback.strengths}
                </p>
              )}
              {feedback.improvements && (
                <p className="text-xs text-amber-800 mb-1.5">
                  <span className="font-semibold">Cần bổ sung: </span>
                  {feedback.improvements}
                </p>
              )}
              {feedback.suggestions && (
                <p className="text-xs text-blue-800">
                  <span className="font-semibold">Đề xuất: </span>
                  {feedback.suggestions}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-2">
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenFeedback(groupId);
              }}
              className="py-2.5 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>Chỉnh sửa nhận xét</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenPresentation(groupId);
              }}
              className="py-2.5 px-4 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-md flex items-center gap-1.5 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
              <span>TRÌNH CHIẾU TOÀN MÀN HÌNH</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
