import React, { useState, useEffect } from 'react';
import { ClassroomSession, GroupSubmission, TeacherFeedback, TopicConfig } from '../types.ts';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  X, 
  MessageSquare, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface ProjectorPresentationViewProps {
  currentGroupId: number;
  session: ClassroomSession;
  submissions: Record<number, GroupSubmission>;
  feedbacks: Record<number, TeacherFeedback>;
  onClose: () => void;
  onSelectGroup: (groupId: number) => void;
  onOpenFeedback: (groupId: number) => void;
}

export const ProjectorPresentationView: React.FC<ProjectorPresentationViewProps> = ({
  currentGroupId,
  session,
  submissions,
  feedbacks,
  onClose,
  onSelectGroup,
  onOpenFeedback
}) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const submission = submissions[currentGroupId] || {
    groupId: currentGroupId,
    groupNumber: currentGroupId,
    topicId: Math.ceil(currentGroupId / 3),
    answer1: '',
    answer2: '',
    answer3: '',
    status: 'not_started'
  };

  const topic: TopicConfig | undefined = session.topics.find(t => t.id === Math.ceil(currentGroupId / 3));
  const feedback = feedbacks[currentGroupId];

  // Handle keyboard arrow keys for navigation and Escape to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        if (currentGroupId < 12) {
          onSelectGroup(currentGroupId + 1);
        } else {
          onSelectGroup(1); // loop
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentGroupId > 1) {
          onSelectGroup(currentGroupId - 1);
        } else {
          onSelectGroup(12); // loop
        }
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGroupId, onSelectGroup, onClose]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handlePrev = () => {
    onSelectGroup(currentGroupId > 1 ? currentGroupId - 1 : 12);
  };

  const handleNext = () => {
    onSelectGroup(currentGroupId < 12 ? currentGroupId + 1 : 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col overflow-y-auto select-none">
      {/* Top Navigation & Status Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-xl bg-blue-600 text-white font-extrabold text-lg tracking-tight shadow-md">
              NHÓM {currentGroupId}
            </span>
            <span className="text-slate-400 text-sm hidden sm:inline">|</span>
            <span className="text-sm font-semibold text-slate-300 truncate max-w-md">
              {topic?.title}
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 ml-4">
            {submission.status === 'reviewed' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đã nhận xét
              </span>
            ) : submission.status === 'submitted' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-950/80 text-blue-400 border border-blue-800/80 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5" /> Đã nộp bài
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs">
                Chưa hoàn tất
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Group Switcher Dropdown */}
          <select
            value={currentGroupId}
            onChange={e => onSelectGroup(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:border-blue-500 cursor-pointer"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>
                Nhóm {num} ({submissions[num]?.status === 'submitted' || submissions[num]?.status === 'reviewed' ? 'Đã nộp' : 'Chưa nộp'})
              </option>
            ))}
          </select>

          {/* Toggle Teacher Feedback */}
          <button
            onClick={() => setShowFeedback(!showFeedback)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
              showFeedback
                ? 'bg-amber-600/30 text-amber-300 border-amber-500/50'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {showFeedback ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{showFeedback ? 'Ẩn nhận xét' : 'Hiện nhận xét'}</span>
          </button>

          {/* Teacher Feedback Button */}
          <button
            onClick={() => onOpenFeedback(currentGroupId)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Viết nhận xét</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
            title="Bật/Tắt toàn màn hình (Phím F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 transition-colors ml-1"
            title="Thoát trình chiếu (Phím Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Presentation Stage (16:9 Optimized) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col justify-between">
        {/* Situation Header Card */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 mb-6 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                TÌNH HUỐNG THẢO LUẬN
              </span>
              <p className="text-base md:text-lg font-medium text-slate-100 mt-1 leading-relaxed">
                &ldquo;{topic?.situation}&rdquo;
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs text-slate-500 font-mono">
                {submission.submittedAt
                  ? `Nộp: ${new Date(submission.submittedAt).toLocaleTimeString('vi-VN')}`
                  : 'Chưa nộp bài'}
              </span>
              <div className="text-xs text-slate-400 mt-0.5 font-mono">
                {submission.wordCount?.total || 0} từ
              </div>
            </div>
          </div>
        </div>

        {/* 3 Questions & Answers 3-Column or Stacked Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1 items-stretch">
          {session.questions.map((q, idx) => {
            const answer = idx === 0 ? submission.answer1 : idx === 1 ? submission.answer2 : submission.answer3;
            const wordCount = idx === 0 ? submission.wordCount?.ans1 : idx === 1 ? submission.wordCount?.ans2 : submission.wordCount?.ans3;

            return (
              <div
                key={q.id}
                className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between shadow-xl transition-all hover:border-slate-700"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                    <span className="text-xs font-extrabold text-blue-400 tracking-wider uppercase">
                      CÂU HỎI {idx + 1}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {wordCount || 0} từ
                    </span>
                  </div>

                  <h3 className="text-sm md:text-base font-bold text-slate-200 mb-3 leading-snug">
                    {q.question}
                  </h3>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 min-h-[160px] text-slate-100 leading-relaxed text-sm md:text-base whitespace-pre-wrap break-words">
                    {answer ? (
                      answer
                    ) : (
                      <span className="text-slate-600 italic text-sm">
                        Nhóm chưa có câu trả lời cho câu hỏi này.
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-500 italic">
                  💡 {q.hint}
                </div>
              </div>
            );
          })}
        </div>

        {/* Teacher Feedback Banner (Toggleable) */}
        {showFeedback && feedback && (
          <div className="mt-6 p-5 rounded-2xl bg-amber-950/30 border border-amber-800/60 shadow-xl animate-fade-in">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-amber-900/40">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> NHẬN XÉT CỦA GIÁO VIÊN ({session.teacherName})
              </span>
              <span className="text-xs text-amber-300 font-medium">
                {feedback.isReviewed ? '✓ Đã hoàn tất đánh giá' : 'Bản nháp nhận xét'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs md:text-sm">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-amber-900/30">
                <span className="font-bold text-slate-300 block mb-1">Nhận xét chung:</span>
                <p className="text-slate-200">{feedback.generalComment || 'Chưa ghi'}</p>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-emerald-900/30">
                <span className="font-bold text-emerald-400 block mb-1">Điểm mạnh:</span>
                <p className="text-slate-200">{feedback.strengths || 'Chưa ghi'}</p>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-amber-900/30">
                <span className="font-bold text-amber-400 block mb-1">Cần bổ sung:</span>
                <p className="text-slate-200">{feedback.improvements || 'Chưa ghi'}</p>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-blue-900/30">
                <span className="font-bold text-blue-400 block mb-1">Đề xuất hoàn thiện:</span>
                <p className="text-slate-200">{feedback.suggestions || 'Chưa ghi'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Toolbar */}
        <div className="mt-6 flex items-center justify-between gap-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-semibold transition-colors shadow-md"
          >
            <ChevronLeft className="w-4 h-4" /> Nhóm trước (←)
          </button>

          <div className="flex items-center gap-1 overflow-x-auto py-1">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(n => {
              const st = submissions[n]?.status;
              const isCurr = n === currentGroupId;
              return (
                <button
                  key={n}
                  onClick={() => onSelectGroup(n)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    isCurr
                      ? 'bg-blue-600 text-white scale-110 shadow-md ring-2 ring-blue-400'
                      : st === 'reviewed'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80 hover:bg-emerald-900'
                      : st === 'submitted'
                      ? 'bg-blue-950 text-blue-300 border border-blue-800/80 hover:bg-blue-900'
                      : 'bg-slate-900 text-slate-500 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-semibold transition-colors shadow-md"
          >
            Nhóm tiếp theo (→) <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
};
