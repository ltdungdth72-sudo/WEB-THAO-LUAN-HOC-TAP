/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ClassroomSession, GroupSubmission, TeacherFeedback } from './types.ts';
import { DEFAULT_SESSION, createInitialFeedbacks, createInitialSubmissions } from './defaultData.ts';
import { StudentView } from './components/StudentView.tsx';
import { TeacherDashboard } from './components/TeacherDashboard.tsx';
import { TeacherAuthModal } from './components/TeacherAuthModal.tsx';
import { TeacherDetailModal } from './components/TeacherDetailModal.tsx';
import { FeedbackModal } from './components/FeedbackModal.tsx';
import { ProjectorPresentationView } from './components/ProjectorPresentationView.tsx';
import { OverviewMatrixModal } from './components/OverviewMatrixModal.tsx';
import { SessionSettingsModal } from './components/SessionSettingsModal.tsx';
import { QRCodeModal } from './components/QRCodeModal.tsx';
import { playNewSubmissionSound } from './utils/sound.ts';
import { 
  BookOpen, 
  Smartphone, 
  Monitor, 
  QrCode, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Sparkles,
  Users,
  CheckCircle2,
  Share2
} from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<ClassroomSession>(DEFAULT_SESSION);
  const [submissions, setSubmissions] = useState<Record<number, GroupSubmission>>(createInitialSubmissions());
  const [feedbacks, setFeedbacks] = useState<Record<number, TeacherFeedback>>(createInitialFeedbacks());

  // Role navigation: 'welcome' | 'student' | 'teacher'
  const [currentView, setCurrentView] = useState<'welcome' | 'student' | 'teacher'>('welcome');

  // Teacher Authentication state
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('classroom_teacher_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [teacherPin, setTeacherPin] = useState<string>(() => {
    try {
      return sessionStorage.getItem('classroom_teacher_pin') || '1010';
    } catch {
      return '1010';
    }
  });

  // Modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isOverviewMatrixOpen, setIsOverviewMatrixOpen] = useState(false);

  // Selected Group for detail, presentation, feedback
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);

  // Parse URL parameters on first load (?view=student or ?view=teacher)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      if (viewParam === 'student') {
        setCurrentView('student');
      } else if (viewParam === 'teacher') {
        if (isTeacherAuthenticated) {
          setCurrentView('teacher');
        } else {
          setIsAuthModalOpen(true);
        }
      }
    } catch {}
  }, [isTeacherAuthenticated]);

  // Load Initial Public Session data
  useEffect(() => {
    fetch('/api/session')
      .then(res => res.json())
      .then(data => {
        if (data.session) {
          setSession(prev => ({ ...prev, ...data.session }));
        }
      })
      .catch(err => console.error('Failed to load initial session', err));
  }, []);

  // Fetch full teacher data if authenticated
  const fetchTeacherData = useCallback(async (pin: string) => {
    try {
      const res = await fetch('/api/teacher/full-data', {
        headers: { 'x-teacher-pin': pin }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.session) setSession(data.session);
        if (data.submissions) setSubmissions(data.submissions);
        if (data.feedbacks) setFeedbacks(data.feedbacks);
      }
    } catch (err) {
      console.error('Failed to fetch full teacher data', err);
    }
  }, []);

  useEffect(() => {
    if (isTeacherAuthenticated && teacherPin) {
      fetchTeacherData(teacherPin);
    }
  }, [isTeacherAuthenticated, teacherPin, fetchTeacherData]);

  // Connect to SSE for Real-time sync across all phones & projector
  useEffect(() => {
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource('/api/stream');

      eventSource.addEventListener('init', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.data?.session) {
            setSession(prev => ({ ...prev, ...payload.data.session }));
          }
          if (payload.data?.submissions) {
            setSubmissions(payload.data.submissions);
          }
        } catch (err) {
          console.error('Error handling init SSE event', err);
        }
      });

      eventSource.addEventListener('submission_updated', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          const { groupId, submission } = payload.data || {};
          if (groupId && submission) {
            setSubmissions(prev => ({
              ...prev,
              [groupId]: submission
            }));

            // Play sound if teacher dashboard is open and group just submitted
            if (currentView === 'teacher' && submission.status === 'submitted') {
              playNewSubmissionSound();
            }
          }
        } catch (err) {
          console.error('Error handling submission_updated event', err);
        }
      });

      eventSource.addEventListener('feedback_updated', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          const { groupId, feedback, submission } = payload.data || {};
          if (groupId) {
            if (feedback) {
              setFeedbacks(prev => ({ ...prev, [groupId]: feedback }));
            }
            if (submission) {
              setSubmissions(prev => ({ ...prev, [groupId]: submission }));
            }
          }
        } catch (err) {
          console.error('Error handling feedback_updated event', err);
        }
      });

      eventSource.addEventListener('session_updated', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.data) {
            setSession(prev => ({ ...prev, ...payload.data }));
          }
        } catch (err) {
          console.error('Error handling session_updated event', err);
        }
      });

      eventSource.addEventListener('data_reset', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.data) {
            setSubmissions(payload.data.submissions);
            setFeedbacks(payload.data.feedbacks);
          }
        } catch (err) {
          console.error('Error handling data_reset event', err);
        }
      });
    } catch (err) {
      console.error('SSE initialization error', err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [currentView]);

  // Handle Teacher PIN Authentication Success
  const handleTeacherAuthSuccess = (pin: string) => {
    setIsTeacherAuthenticated(true);
    setTeacherPin(pin);
    try {
      sessionStorage.setItem('classroom_teacher_auth', 'true');
      sessionStorage.setItem('classroom_teacher_pin', pin);
    } catch {}
    setIsAuthModalOpen(false);
    setCurrentView('teacher');
    fetchTeacherData(pin);
  };

  const handleTeacherLogout = () => {
    setIsTeacherAuthenticated(false);
    try {
      sessionStorage.removeItem('classroom_teacher_auth');
      sessionStorage.removeItem('classroom_teacher_pin');
    } catch {}
    setCurrentView('welcome');
  };

  const handleToggleSubmissions = async () => {
    const nextState = !session.isSubmissionsOpen;
    try {
      const res = await fetch('/api/teacher/session-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-teacher-pin': teacherPin
        },
        body: JSON.stringify({ isSubmissionsOpen: nextState })
      });
      if (res.ok) {
        const data = await res.json();
        setSession(data.session);
      }
    } catch (err) {
      console.error('Failed to toggle submissions', err);
    }
  };

  // Helper callbacks for modals
  const handleOpenDetail = (groupId: number) => {
    setSelectedGroupId(groupId);
    setIsDetailModalOpen(true);
  };

  const handleOpenPresentation = (groupId: number) => {
    setSelectedGroupId(groupId);
    setIsPresentationOpen(true);
  };

  const handleOpenFeedback = (groupId: number) => {
    setSelectedGroupId(groupId);
    setIsFeedbackModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-blue-100 selection:text-blue-900">
      {/* Top Application Navbar */}
      <header className="no-print bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div
            onClick={() => setCurrentView('welcome')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                PHÒNG THẢO LUẬN SỐ
              </span>
              <span className="hidden sm:block text-[11px] text-slate-500 font-medium">
                {session.className} · {session.schoolName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentView !== 'welcome' && (
              <button
                onClick={() => setCurrentView('welcome')}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Trang chủ
              </button>
            )}

            <button
              onClick={() => setIsQRCodeModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-colors border border-blue-200 shadow-2xs"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mã QR</span>
            </button>

            {currentView === 'student' ? (
              <button
                onClick={() => {
                  if (isTeacherAuthenticated) {
                    setCurrentView('teacher');
                  } else {
                    setIsAuthModalOpen(true);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-2xs"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Màn hình giáo viên</span>
              </button>
            ) : currentView === 'teacher' ? (
              <button
                onClick={() => setCurrentView('student')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-2xs"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Chế độ học sinh</span>
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {/* Main Content Router */}
      <main className="flex-1">
        {currentView === 'welcome' && (
          <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
            {/* Hero Welcome Banner */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-4 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Tiết Học Tương Tác Thời Gian Thực</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                PHÒNG THẢO LUẬN SỐ
              </h1>
              <p className="text-lg md:text-xl font-bold text-blue-700 mt-2">
                12 NHÓM – 4 CHỦ ĐỀ – CÙNG HỌC VỀ BẢN QUYỀN
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-slate-600 font-medium mt-3">
                <span>Môn: <strong className="text-slate-800">{session.subject}</strong></span>
                <span>·</span>
                <span>Trường: <strong className="text-slate-800">{session.schoolName}</strong></span>
                <span>·</span>
                <span>Giáo viên: <strong className="text-slate-800">{session.teacherName}</strong></span>
              </div>
              <p className="text-xs text-slate-500 mt-2 max-w-xl mx-auto">
                Chủ đề trọng tâm: &ldquo;{session.lessonName}&rdquo;
              </p>
            </div>

            {/* 2 Primary Choice Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {/* Option 1: Student Workspace */}
              <div
                onClick={() => setCurrentView('student')}
                className="group relative bg-white rounded-3xl border-2 border-blue-200 hover:border-blue-500 p-8 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-5 shadow-md group-hover:scale-105 transition-transform">
                    <Smartphone className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
                    DÀNH CHO HỌC SINH
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                    VÀO KHÔNG GIAN HỌC SINH
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    Học sinh sử dụng điện thoại để chọn nhóm, đọc tình huống thực tế, thảo luận và gửi câu trả lời cho 3 câu hỏi bản quyền.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    12 nhóm · Tự động lưu nháp
                  </span>
                  <div className="flex items-center gap-1 text-sm font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                    <span>Tham gia ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Option 2: Teacher Dashboard */}
              <div
                onClick={() => {
                  if (isTeacherAuthenticated) {
                    setCurrentView('teacher');
                  } else {
                    setIsAuthModalOpen(true);
                  }
                }}
                className="group relative bg-white rounded-3xl border-2 border-slate-200 hover:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-5 shadow-md group-hover:scale-105 transition-transform">
                    <Monitor className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    DÀNH CHO GIÁO VIÊN
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-slate-800 transition-colors">
                    MÀN HÌNH GIÁO VIÊN
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    Bảng điều khiển kết nối máy chiếu: theo dõi trạng thái 12 nhóm theo thời gian thực, trình chiếu bài làm toàn màn hình 16:9 và đánh giá nhận xét.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-slate-400" /> Bảo vệ bằng mã PIN
                  </span>
                  <div className="flex items-center gap-1 text-sm font-bold text-slate-900 group-hover:translate-x-1 transition-transform">
                    <span>Mở bảng quản lý</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick QR & Overview Strip */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Chiếu mã QR cho học sinh quét</h3>
                  <p className="text-xs text-slate-500">
                    Hiển thị mã QR lên máy chiếu để cả lớp quét bằng camera điện thoại và vào thảo luận ngay lập tức.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsQRCodeModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shrink-0 shadow-sm flex items-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                <span>Mở mã QR máy chiếu</span>
              </button>
            </div>
          </div>
        )}

        {currentView === 'student' && (
          <StudentView
            session={session}
            onBackToHome={() => setCurrentView('welcome')}
          />
        )}

        {currentView === 'teacher' && isTeacherAuthenticated && (
          <TeacherDashboard
            session={session}
            submissions={submissions}
            feedbacks={feedbacks}
            teacherPin={teacherPin}
            onOpenQRCode={() => setIsQRCodeModalOpen(true)}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onOpenOverviewMatrix={() => setIsOverviewMatrixOpen(true)}
            onSelectGroupForDetail={handleOpenDetail}
            onSelectGroupForPresentation={handleOpenPresentation}
            onSelectGroupForFeedback={handleOpenFeedback}
            onToggleSubmissions={handleToggleSubmissions}
            onLogout={handleTeacherLogout}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Hệ thống Phòng Thảo Luận Số · Môn Tin học 10 · THPT Đinh Tiên Hoàng
          </span>
          <span>
            Giáo viên phụ trách: <strong>Lê Thị Dung</strong>
          </span>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <TeacherAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleTeacherAuthSuccess}
      />

      <QRCodeModal
        isOpen={isQRCodeModalOpen}
        onClose={() => setIsQRCodeModalOpen(false)}
        classNameTitle={session.className}
      />

      {selectedGroupId && (
        <>
          <TeacherDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            groupId={selectedGroupId}
            session={session}
            submission={submissions[selectedGroupId]}
            feedback={feedbacks[selectedGroupId]}
            topic={session.topics.find(t => t.id === Math.ceil(selectedGroupId / 3))}
            onOpenPresentation={handleOpenPresentation}
            onOpenFeedback={handleOpenFeedback}
          />

          <FeedbackModal
            isOpen={isFeedbackModalOpen}
            onClose={() => setIsFeedbackModalOpen(false)}
            groupId={selectedGroupId}
            submission={submissions[selectedGroupId]}
            feedback={feedbacks[selectedGroupId]}
            topic={session.topics.find(t => t.id === Math.ceil(selectedGroupId / 3))}
            teacherPin={teacherPin}
            onSaveFeedbackSuccess={(updatedFeedback, updatedSubmission) => {
              setFeedbacks(prev => ({ ...prev, [selectedGroupId]: updatedFeedback }));
              if (updatedSubmission) {
                setSubmissions(prev => ({ ...prev, [selectedGroupId]: updatedSubmission }));
              }
            }}
          />
        </>
      )}

      {/* Full-Screen Projector Presentation View */}
      {isPresentationOpen && selectedGroupId && (
        <ProjectorPresentationView
          currentGroupId={selectedGroupId}
          session={session}
          submissions={submissions}
          feedbacks={feedbacks}
          onClose={() => setIsPresentationOpen(false)}
          onSelectGroup={groupId => setSelectedGroupId(groupId)}
          onOpenFeedback={handleOpenFeedback}
        />
      )}

      {/* Overview Matrix Modal */}
      <OverviewMatrixModal
        isOpen={isOverviewMatrixOpen}
        onClose={() => setIsOverviewMatrixOpen(false)}
        session={session}
        submissions={submissions}
        feedbacks={feedbacks}
        onSelectGroupForDetail={handleOpenDetail}
        onSelectGroupForPresentation={handleOpenPresentation}
      />

      {/* Session Settings Modal */}
      <SessionSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        session={session}
        teacherPin={teacherPin}
        onUpdateSession={updatedSession => setSession(updatedSession)}
        onResetData={() => {
          setSubmissions(createInitialSubmissions());
          setFeedbacks(createInitialFeedbacks());
        }}
      />
    </div>
  );
}
