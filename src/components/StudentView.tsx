import React, { useState, useEffect, useRef } from 'react';
import { ClassroomSession, GroupSubmission, TeacherFeedback, TopicConfig } from '../types.ts';
import { playSubmitSuccessSound } from '../utils/sound.ts';
import { 
  BookOpen, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  Clock, 
  Send, 
  Save, 
  Edit3, 
  ShieldCheck, 
  Image as ImageIcon, 
  Music, 
  FileCheck2, 
  AlertCircle,
  ChevronLeft,
  MessageSquareQuote,
  Sparkles
} from 'lucide-react';

interface StudentViewProps {
  session: ClassroomSession;
  onBackToHome: () => void;
}

export const StudentView: React.FC<StudentViewProps> = ({ session, onBackToHome }) => {
  // Read saved group from localStorage if available
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('classroom_student_group_id');
      return saved ? Number(saved) : null;
    } catch {
      return null;
    }
  });

  const [submission, setSubmission] = useState<GroupSubmission | null>(null);
  const [answer1, setAnswer1] = useState('');
  const [answer2, setAnswer2] = useState('');
  const [answer3, setAnswer3] = useState('');
  const [answer4, setAnswer4] = useState('');
  const [teacherFeedback, setTeacherFeedback] = useState<TeacherFeedback | null>(null);

  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'offline' | 'error'>('synced');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const [submitSuccessNotice, setSubmitSuccessNotice] = useState<string>('');
  const [isEditingAfterSubmit, setIsEditingAfterSubmit] = useState(false);

  const autoSaveTimeoutRef = useRef<any>(null);
  const clientDeviceId = useRef<string>((() => {
    try {
      let id = localStorage.getItem('classroom_device_id');
      if (!id) {
        id = 'dev_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('classroom_device_id', id);
      }
      return id;
    } catch {
      return 'dev_anon';
    }
  })());

  // Calculate word & char counts
  const getWordCount = (text: string) => (text.trim() ? text.trim().split(/\s+/).length : 0);
  const count1 = getWordCount(answer1);
  const count2 = getWordCount(answer2);
  const count3 = getWordCount(answer3);
  const count4 = getWordCount(answer4);
  const totalWords = count1 + count2 + count3 + count4;

  // Selected group's topic
  const selectedTopic: TopicConfig | undefined = selectedGroupId
    ? session.topics.find(t => t.id === Math.ceil(selectedGroupId / 3))
    : undefined;

  // Load group submission on selection
  useEffect(() => {
    if (!selectedGroupId) return;

    try {
      localStorage.setItem('classroom_student_group_id', String(selectedGroupId));
    } catch {}

    // First check local backup
    const localDraftKey = `classroom_draft_group_${selectedGroupId}`;
    let localDraft: any = null;
    try {
      const draft = localStorage.getItem(localDraftKey);
      if (draft) localDraft = JSON.parse(draft);
    } catch {}

    // Fetch latest from server
    fetch(`/api/submissions/${selectedGroupId}`)
      .then(res => res.json())
      .then(data => {
        if (data.submission) {
          setSubmission(data.submission);
          // Prefer server if submitted, or prefer local if newer
          const serverAnswersExist = data.submission.answer1 || data.submission.answer2 || data.submission.answer3;
          if (serverAnswersExist || !localDraft) {
            setAnswer1(data.submission.answer1 || '');
            setAnswer2(data.submission.answer2 || '');
            setAnswer3(data.submission.answer3 || '');
          } else if (localDraft) {
            setAnswer1(localDraft.answer1 || '');
            setAnswer2(localDraft.answer2 || '');
            setAnswer3(localDraft.answer3 || '');
          }

          if (data.submission.status === 'submitted' || data.submission.status === 'reviewed') {
            setIsEditingAfterSubmit(false);
          }
        }
        if (data.feedback) {
          setTeacherFeedback(data.feedback);
        }
        setSyncStatus('synced');
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setSyncStatus('offline');
        if (localDraft) {
          setAnswer1(localDraft.answer1 || '');
          setAnswer2(localDraft.answer2 || '');
          setAnswer3(localDraft.answer3 || '');
        }
      });
  }, [selectedGroupId]);

  // Debounced Auto-save draft
  const triggerAutoSave = (ans1: string, ans2: string, ans3: string) => {
    if (!selectedGroupId) return;
    if (submission?.status === 'submitted' && !isEditingAfterSubmit) return;

    // Save to localStorage immediately
    try {
      localStorage.setItem(
        `classroom_draft_group_${selectedGroupId}`,
        JSON.stringify({ answer1: ans1, answer2: ans2, answer3: ans3, timestamp: Date.now() })
      );
    } catch {}

    setSyncStatus('saving');

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedGroupId,
          answer1: ans1,
          answer2: ans2,
          answer3: ans3,
          status: 'in_progress',
          clientDeviceId: clientDeviceId.current
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSyncStatus('synced');
            setLastSavedTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
          } else {
            setSyncStatus('offline');
          }
        })
        .catch(() => {
          setSyncStatus('offline');
        });
    }, 1500);
  };

  const handleAnswerChange = (qNum: 1 | 2 | 3, value: string) => {
    let a1 = answer1;
    let a2 = answer2;
    let a3 = answer3;
    if (qNum === 1) {
      setAnswer1(value);
      a1 = value;
    } else if (qNum === 2) {
      setAnswer2(value);
      a2 = value;
    } else {
      setAnswer3(value);
      a3 = value;
    }
    setValidationError('');
    triggerAutoSave(a1, a2, a3);
  };

  const handleManualSaveDraft = () => {
    if (!selectedGroupId) return;
    triggerAutoSave(answer1, answer2, answer3);
    setSubmitSuccessNotice('Đã lưu bản nháp an toàn!');
    setTimeout(() => setSubmitSuccessNotice(''), 3000);
  };

  const validateBeforeSubmit = (): boolean => {
    if (!answer1.trim()) {
      setValidationError('Vui lòng trả lời Câu hỏi 1 (Hành vi nào có vấn đề?).');
      return false;
    }
    if (!answer2.trim()) {
      setValidationError('Vui lòng trả lời Câu hỏi 2 (Quyền lợi của tác giả có thể bị ảnh hưởng như thế nào?).');
      return false;
    }
    if (!answer3.trim()) {
      setValidationError('Vui lòng trả lời Câu hỏi 3 (Cần làm gì để sử dụng nội dung phù hợp?).');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleOpenSubmitConfirm = () => {
    if (!validateBeforeSubmit()) return;
    setShowConfirmModal(true);
  };

  const executeSubmit = async () => {
    if (!selectedGroupId || isSubmitting) return;

    setIsSubmitting(true);
    setShowConfirmModal(false);

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedGroupId,
          answer1,
          answer2,
          answer3,
          status: 'submitted',
          clientDeviceId: clientDeviceId.current
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmission(data.submission);
        setIsEditingAfterSubmit(false);
        setSyncStatus('synced');
        playSubmitSuccessSound();
        setSubmitSuccessNotice('Chúc mừng! Nhóm đã gửi câu trả lời thành công lên màn hình giáo viên.');
      } else {
        setValidationError(data.error || 'Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.');
      }
    } catch {
      setSyncStatus('offline');
      setValidationError('Mất kết nối mạng! Bản nháp đã được lưu trên điện thoại. Hãy bấm thử lại khi có sóng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper icon for topic
  const getTopicIcon = (type: string) => {
    switch (type) {
      case 'software':
        return <ShieldCheck className="w-5 h-5 text-blue-600" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-emerald-600" />;
      case 'music':
        return <Music className="w-5 h-5 text-purple-600" />;
      case 'license':
        return <FileCheck2 className="w-5 h-5 text-amber-600" />;
      default:
        return <BookOpen className="w-5 h-5 text-blue-600" />;
    }
  };

  // View: Group Selection Screen
  if (!selectedGroupId) {
    return (
      <div className="max-w-xl mx-auto px-4 py-6">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Quay lại trang chủ
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 mb-2 shadow-xs">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Chọn Nhóm Thảo Luận</h1>
          <p className="text-sm text-slate-600 mt-1">
            {session.className} – GV: <span className="font-semibold">{session.teacherName}</span>
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{session.schoolName}</p>
        </div>

        <div className="space-y-4">
          {session.topics.map((topic, idx) => (
            <div
              key={topic.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                {getTopicIcon(topic.icon)}
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">{topic.title}</h2>
              </div>
              <p className="text-xs text-slate-600 mb-3 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                &ldquo;{topic.situation}&rdquo;
              </p>

              <div className="grid grid-cols-3 gap-2">
                {topic.groupNumbers.map(gNum => (
                  <button
                    key={gNum}
                    onClick={() => setSelectedGroupId(gNum)}
                    className="py-3 px-2 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 active:scale-95 transition-all text-center flex flex-col items-center justify-center group"
                  >
                    <span className="text-base font-extrabold text-slate-900 group-hover:text-blue-600">
                      Nhóm {gNum}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5">Vào thảo luận</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // View: Main Student Workspace for Selected Group
  const isSubmitted = submission?.status === 'submitted' || submission?.status === 'reviewed';
  const isReadOnly = isSubmitted && !isEditingAfterSubmit;

  return (
    <div className="max-w-xl mx-auto px-4 py-4 pb-24">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs mb-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedGroupId(null)}
              className="p-1.5 -ml-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
              title="Đổi nhóm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-extrabold text-sm tracking-tight shadow-xs">
                Nhóm {selectedGroupId}
              </span>
              <span className="text-xs font-semibold text-slate-700">{session.className}</span>
            </div>
          </div>

          {/* Sync Status Badge */}
          <div className="flex items-center gap-1 text-xs">
            {syncStatus === 'synced' && (
              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                <Wifi className="w-3.5 h-3.5" />
                <span className="text-[11px]">{lastSavedTime ? `Đã lưu ${lastSavedTime}` : 'Đã kết nối'}</span>
              </span>
            )}
            {syncStatus === 'saving' && (
              <span className="inline-flex items-center gap-1 text-amber-600 font-medium animate-pulse">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-[11px]">Đang lưu nháp...</span>
              </span>
            )}
            {syncStatus === 'offline' && (
              <span className="inline-flex items-center gap-1 text-rose-600 font-medium bg-rose-50 px-2 py-0.5 rounded-md">
                <WifiOff className="w-3.5 h-3.5" />
                <span className="text-[11px]">Đã lưu tạm trên máy</span>
              </span>
            )}
          </div>
        </div>

        {/* Topic Title & Situation */}
        {selectedTopic && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-1.5 text-slate-900 font-bold text-sm">
              {getTopicIcon(selectedTopic.icon)}
              <span>{selectedTopic.title}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
              <span className="font-semibold text-slate-900">Tình huống thảo luận: </span>
              {selectedTopic.situation}
            </div>
          </div>
        )}
      </div>

      {/* Submission Status Alert */}
      {isSubmitted && !isEditingAfterSubmit && (
        <div className="mb-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-xs">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-sm">Nhóm đã gửi câu trả lời thành công!</h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                Thời gian nộp:{' '}
                {submission?.submittedAt
                  ? new Date(submission.submittedAt).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })
                  : 'Vừa xong'}
                . Màn hình giáo viên đã cập nhật bài làm của nhóm.
              </p>

              {session.allowEditAfterSubmit && (
                <button
                  onClick={() => setIsEditingAfterSubmit(true)}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-300 hover:bg-emerald-100 transition-colors shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Chỉnh sửa bổ sung câu trả lời</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Banner */}
      {submitSuccessNotice && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{submitSuccessNotice}</span>
        </div>
      )}

      {/* Validation Error Banner */}
      {validationError && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* 3 Questions Container */}
      <div className="space-y-4">
        {session.questions.map((q, idx) => {
          const val = idx === 0 ? answer1 : idx === 1 ? answer2 : answer3;
          const wordCount = getWordCount(val);
          const charCount = val.length;

          return (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs transition-shadow focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                  CÂU HỎI {idx + 1}
                </span>
                <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                  {wordCount} từ · {charCount} ký tự
                </span>
              </div>

              <h2 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
                {q.question}
              </h2>

              <p className="text-[11px] text-slate-500 mb-2.5 italic">
                💡 Gợi ý: {q.hint}
              </p>

              <textarea
                value={val}
                onChange={e => handleAnswerChange((idx + 1) as 1 | 2 | 3, e.target.value)}
                disabled={isReadOnly}
                placeholder={`Nhập câu trả lời chi tiết của Nhóm ${selectedGroupId}...`}
                rows={4}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 bg-slate-50/50 disabled:bg-slate-100 disabled:text-slate-600 resize-y transition-colors"
              />
            </div>
          );
        })}
      </div>

      {/* Teacher Feedback Card (if reviewed and published) */}
      {teacherFeedback && teacherFeedback.isPublishedToStudent && (
        <div className="mt-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-slate-900 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquareQuote className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-bold text-amber-950">
              Nhận Xét & Đánh Giá Của Giáo Viên ({session.teacherName})
            </h3>
          </div>

          {teacherFeedback.generalComment && (
            <div className="mb-2 text-xs">
              <span className="font-semibold text-amber-900">Nhận xét chung: </span>
              <p className="mt-0.5 text-slate-800 leading-relaxed">{teacherFeedback.generalComment}</p>
            </div>
          )}

          {teacherFeedback.strengths && (
            <div className="mb-2 text-xs">
              <span className="font-semibold text-emerald-800">Điểm mạnh: </span>
              <p className="mt-0.5 text-slate-800 leading-relaxed">{teacherFeedback.strengths}</p>
            </div>
          )}

          {teacherFeedback.improvements && (
            <div className="mb-2 text-xs">
              <span className="font-semibold text-amber-800">Cần bổ sung: </span>
              <p className="mt-0.5 text-slate-800 leading-relaxed">{teacherFeedback.improvements}</p>
            </div>
          )}

          {teacherFeedback.suggestions && (
            <div className="text-xs">
              <span className="font-semibold text-blue-800">Đề xuất hướng hoàn thiện: </span>
              <p className="mt-0.5 text-slate-800 leading-relaxed">{teacherFeedback.suggestions}</p>
            </div>
          )}
        </div>
      )}

      {/* Bottom Sticky Action Bar (Optimized for Mobile Thumb Reach) */}
      {!isReadOnly && (
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg z-40">
          <div className="max-w-xl mx-auto flex items-center gap-2">
            <button
              onClick={handleManualSaveDraft}
              className="py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs shrink-0 min-h-[48px]"
            >
              <Save className="w-4 h-4 text-slate-500" />
              <span>Lưu nháp</span>
            </button>

            <button
              onClick={handleOpenSubmitConfirm}
              disabled={isSubmitting || !session.isSubmissionsOpen}
              className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20 disabled:bg-slate-300 disabled:shadow-none min-h-[48px]"
            >
              <Send className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Đang gửi...'
                  : isEditingAfterSubmit
                  ? 'Cập nhật câu trả lời'
                  : 'GỬI BÀI THẢO LUẬN'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-slate-900 border border-slate-200 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-center tracking-tight">Xác Nhận Nộp Bài</h3>
            <p className="text-xs text-slate-600 text-center mt-1 leading-relaxed">
              Bạn có chắc chắn muốn nộp câu trả lời của <span className="font-bold text-blue-600">Nhóm {selectedGroupId}</span>?
              Nội dung sẽ được hiển thị ngay trên màn hình máy chiếu của cô giáo.
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-700 border border-slate-100">
              <div className="flex justify-between">
                <span>Tổng số từ bài làm:</span>
                <span className="font-mono font-bold text-blue-600">{totalWords} từ</span>
              </div>
              <div className="flex justify-between">
                <span>Chủ đề:</span>
                <span className="font-medium truncate max-w-[180px]">{selectedTopic?.title}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
              >
                Kiểm tra lại
              </button>
              <button
                onClick={executeSubmit}
                className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-md transition-colors"
              >
                Xác nhận gửi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
