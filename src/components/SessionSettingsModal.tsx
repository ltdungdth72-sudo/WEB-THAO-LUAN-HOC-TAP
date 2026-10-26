import React, { useState } from 'react';
import { ClassroomSession, TopicConfig, QuestionConfig } from '../types.ts';
import { X, Save, RefreshCw, Lock, Unlock, KeyRound, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SessionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ClassroomSession;
  teacherPin: string;
  onUpdateSession: (updatedSession: ClassroomSession) => void;
  onResetData: () => void;
}

export const SessionSettingsModal: React.FC<SessionSettingsModalProps> = ({
  isOpen,
  onClose,
  session,
  teacherPin,
  onUpdateSession,
  onResetData
}) => {
  const [className, setClassName] = useState(session.className);
  const [teacherName, setTeacherName] = useState(session.teacherName);
  const [schoolName, setSchoolName] = useState(session.schoolName);
  const [lessonName, setLessonName] = useState(session.lessonName);
  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(session.isSubmissionsOpen);
  const [newPin, setNewPin] = useState(teacherPin);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Editable questions
  const [questions, setQuestions] = useState<QuestionConfig[]>(session.questions);

  // Editable topics
  const [topics, setTopics] = useState<TopicConfig[]>(session.topics);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMsg('');

    try {
      const res = await fetch('/api/teacher/session-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-teacher-pin': teacherPin
        },
        body: JSON.stringify({
          className,
          teacherName,
          schoolName,
          lessonName,
          isSubmissionsOpen,
          teacherPin: newPin,
          questions,
          topics
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg('Đã lưu cấu hình buổi thảo luận thành công!');
        onUpdateSession(data.session);
        setTimeout(() => setStatusMsg(''), 3000);
      } else {
        setStatusMsg(data.error || 'Lỗi khi lưu cấu hình');
      }
    } catch {
      setStatusMsg('Lỗi kết nối máy chủ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecuteReset = async () => {
    try {
      const res = await fetch('/api/teacher/reset-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-teacher-pin': teacherPin
        }
      });
      if (res.ok) {
        onResetData();
        setShowResetConfirm(false);
        setStatusMsg('Đã đặt lại dữ liệu lớp học mới thành công!');
        setTimeout(() => setStatusMsg(''), 3000);
      }
    } catch {
      setStatusMsg('Lỗi kết nối máy chủ');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 text-slate-900 border border-slate-200 shadow-2xl my-6">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              QUẢN LÝ TIẾT HỌC & TÁI SỬ DỤNG
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Cài Đặt Buổi Thảo Luận
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 max-h-[68vh] overflow-y-auto pr-1">
          {/* Thông tin lớp & trường */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên lớp học</label>
              <input
                type="text"
                value={className}
                onChange={e => setClassName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên giáo viên</label>
              <input
                type="text"
                value={teacherName}
                onChange={e => setTeacherName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên trường học</label>
              <input
                type="text"
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mã PIN bảo mật giáo viên</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newPin}
                  onChange={e => setNewPin(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Toggle Tiếp nhận bài nộp */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Trạng thái tiếp nhận bài thảo luận</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Khi đóng, học sinh sẽ không thể gửi thêm bài mới hay chỉnh sửa bài đã nộp.
              </p>
            </div>
            <button
              onClick={() => setIsSubmissionsOpen(!isSubmissionsOpen)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                isSubmissionsOpen
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-rose-600 text-white hover:bg-rose-700'
              }`}
            >
              {isSubmissionsOpen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span>{isSubmissionsOpen ? 'ĐANG MỞ NHẬN BÀI' : 'ĐÃ ĐÓNG NHẬN BÀI'}</span>
            </button>
          </div>

          {/* 3 Câu hỏi thảo luận */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wide">
              Chỉnh Sửa 3 Câu Hỏi Thảo Luận
            </h4>
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div key={q.id} className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-blue-600 block mb-1">
                    CÂU HỎI {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={q.question}
                    onChange={e => {
                      const updated = [...questions];
                      updated[idx].question = e.target.value;
                      setQuestions(updated);
                    }}
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500 mb-2"
                  />
                  <input
                    type="text"
                    value={q.hint}
                    onChange={e => {
                      const updated = [...questions];
                      updated[idx].hint = e.target.value;
                      setQuestions(updated);
                    }}
                    placeholder="Gợi ý trả lời cho học sinh..."
                    className="w-full p-2 rounded-lg border border-slate-100 text-[11px] text-slate-600 bg-slate-50 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 4 Chủ đề thảo luận */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wide">
              Chỉnh Sửa 4 Tình Huống Chủ Đề
            </h4>
            <div className="space-y-3">
              {topics.map((t, idx) => (
                <div key={t.id} className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-bold text-slate-700">Chủ đề {idx + 1}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Nhóm {t.groupNumbers.join(', ')}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={t.title}
                    onChange={e => {
                      const updated = [...topics];
                      updated[idx].title = e.target.value;
                      setTopics(updated);
                    }}
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500 mb-2"
                  />
                  <textarea
                    rows={2}
                    value={t.situation}
                    onChange={e => {
                      const updated = [...topics];
                      updated[idx].situation = e.target.value;
                      setTopics(updated);
                    }}
                    className="w-full p-2 rounded-lg border border-slate-100 text-xs text-slate-600 bg-slate-50 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Đặt lại buổi học mới */}
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" /> Tạo Tiết Học Mới (Đặt Lại Dữ Liệu)
                </h4>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  Xóa tất cả câu trả lời và nhận xét hiện tại để bắt đầu cho một lớp học mới.
                </p>
              </div>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition-colors shrink-0 shadow-xs flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Đặt lại dữ liệu
              </button>
            </div>
          </div>
        </div>

        {statusMsg && (
          <div className="mt-4 p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="py-2.5 px-5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-md flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Đang lưu...' : 'LƯU TẤT CẢ THAY ĐỔI'}</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-slate-900 border border-slate-200 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-center">Xác Nhận Đặt Lại Dữ Liệu?</h3>
            <p className="text-xs text-slate-600 text-center mt-1 leading-relaxed">
              Thao tác này sẽ xóa toàn bộ câu trả lời của 12 nhóm và nhận xét của giáo viên để chuẩn bị cho tiết học mới. Hãy chắc chắn cô đã xuất kết quả ra file CSV trước khi xóa.
            </p>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleExecuteReset}
                className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-md transition-colors"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
