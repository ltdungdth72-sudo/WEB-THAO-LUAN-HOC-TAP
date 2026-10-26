import React from 'react';
import { ClassroomSession, GroupSubmission, TeacherFeedback } from '../types.ts';
import { X, CheckCircle2, Clock, Eye, MessageSquare, Maximize2 } from 'lucide-react';

interface OverviewMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ClassroomSession;
  submissions: Record<number, GroupSubmission>;
  feedbacks: Record<number, TeacherFeedback>;
  onSelectGroupForDetail: (groupId: number) => void;
  onSelectGroupForPresentation: (groupId: number) => void;
}

export const OverviewMatrixModal: React.FC<OverviewMatrixModalProps> = ({
  isOpen,
  onClose,
  session,
  submissions,
  feedbacks,
  onSelectGroupForDetail,
  onSelectGroupForPresentation
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-3xl max-w-6xl w-full p-6 md:p-8 border border-slate-800 shadow-2xl my-6">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              TOÀN CẢNH LỚP HỌC TIN HỌC 10
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight mt-0.5">
              Ma Trận Tổng Hợp 12 Nhóm – 4 Chủ Đề Bản Quyền
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Giáo viên: <span className="text-slate-200 font-semibold">{session.teacherName}</span> · Trường: {session.schoolName}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            aria-label="Đóng"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 4 Topic Zones Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {session.topics.map(topic => (
            <div
              key={topic.id}
              className="bg-slate-950/70 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
                  <h3 className="font-bold text-sm text-slate-100">{topic.title}</h3>
                  <span className="text-xs text-blue-400 font-medium">3 Nhóm</span>
                </div>
                <p className="text-xs text-slate-400 italic mb-4 leading-relaxed line-clamp-2">
                  &ldquo;{topic.situation}&rdquo;
                </p>

                {/* 3 Group Rows */}
                <div className="space-y-3">
                  {topic.groupNumbers.map(gNum => {
                    const sub = submissions[gNum];
                    const fb = feedbacks[gNum];
                    const isSubmitted = sub?.status === 'submitted' || sub?.status === 'reviewed';
                    const isReviewed = sub?.status === 'reviewed';

                    return (
                      <div
                        key={gNum}
                        className="bg-slate-900 rounded-xl border border-slate-800/90 p-3 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-300 font-extrabold text-xs flex items-center justify-center border border-blue-500/30">
                            N{gNum}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-slate-200">
                              Nhóm {gNum}
                            </span>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {sub?.submittedAt ? (
                                <span className="text-slate-300">
                                  {new Date(sub.submittedAt).toLocaleTimeString('vi-VN')} · {sub.wordCount?.total || 0} từ
                                </span>
                              ) : (
                                <span>Chưa gửi bài</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status Badge & Actions */}
                        <div className="flex items-center gap-2">
                          {isReviewed ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 text-[11px] font-semibold border border-emerald-800/80 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Đã nhận xét
                            </span>
                          ) : isSubmitted ? (
                            <span className="px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 text-[11px] font-semibold border border-blue-800/80 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Đã gửi bài
                            </span>
                          ) : sub?.status === 'in_progress' ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 text-[11px] font-semibold border border-amber-800/80">
                              Đang làm
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[11px]">
                              Chưa làm
                            </span>
                          )}

                          <button
                            onClick={() => {
                              onClose();
                              onSelectGroupForPresentation(gNum);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Trình chiếu nhóm này"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              onClose();
                              onSelectGroupForDetail(gNum);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Xem chi tiết & nhận xét"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            Đóng bảng tổng hợp
          </button>
        </div>
      </div>
    </div>
  );
};
