import React, { useState } from 'react';
import { ClassroomSession, GroupSubmission, TeacherFeedback, TopicConfig } from '../types.ts';
import { exportClassroomToCSV } from '../utils/exportCsv.ts';
import { getSoundEnabled, setSoundEnabled } from '../utils/sound.ts';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Image as ImageIcon, 
  Music, 
  FileCheck2, 
  Eye, 
  Maximize2, 
  MessageSquare, 
  QrCode, 
  Download, 
  Printer, 
  Settings, 
  Volume2, 
  VolumeX, 
  LogOut, 
  Unlock, 
  Lock,
  Grid,
  Radio
} from 'lucide-react';

interface TeacherDashboardProps {
  session: ClassroomSession;
  submissions: Record<number, GroupSubmission>;
  feedbacks: Record<number, TeacherFeedback>;
  teacherPin: string;
  onOpenQRCode: () => void;
  onOpenSettings: () => void;
  onOpenOverviewMatrix: () => void;
  onSelectGroupForDetail: (groupId: number) => void;
  onSelectGroupForPresentation: (groupId: number) => void;
  onSelectGroupForFeedback: (groupId: number) => void;
  onToggleSubmissions: () => void;
  onLogout: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  session,
  submissions,
  feedbacks,
  teacherPin,
  onOpenQRCode,
  onOpenSettings,
  onOpenOverviewMatrix,
  onSelectGroupForDetail,
  onSelectGroupForPresentation,
  onSelectGroupForFeedback,
  onToggleSubmissions,
  onLogout
}) => {
  const [soundOn, setSoundOn] = useState(() => getSoundEnabled());

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  const handleExportCSV = () => {
    exportClassroomToCSV({
      session,
      submissions,
      feedbacks
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // Compute 4 KPI stats
  const totalGroups = 12;
  const submittedCount = Object.values(submissions).filter(
    s => s.status === 'submitted' || s.status === 'reviewed'
  ).length;
  const inProgressOrNotStartedCount = totalGroups - submittedCount;
  const reviewedCount = Object.values(feedbacks).filter(f => f.isReviewed).length;

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
        return <Users className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusBadge = (sub: GroupSubmission | undefined) => {
    const status = sub?.status || 'not_started';

    switch (status) {
      case 'reviewed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã nhận xét
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3.5 h-3.5" /> Đã gửi bài
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Radio className="w-3.5 h-3.5 animate-pulse text-amber-600" /> Đang làm bài
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Chưa bắt đầu
          </span>
        );
    }
  };

  const getCardBorderClass = (sub: GroupSubmission | undefined) => {
    const status = sub?.status || 'not_started';
    switch (status) {
      case 'reviewed':
        return 'border-emerald-300 hover:border-emerald-400 bg-emerald-50/20';
      case 'submitted':
        return 'border-blue-300 hover:border-blue-400 bg-blue-50/20';
      case 'in_progress':
        return 'border-amber-300 hover:border-amber-400 bg-amber-50/20';
      default:
        return 'border-slate-200 hover:border-slate-300 bg-white';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner & Navigation */}
      <header className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white font-extrabold text-xs tracking-wider uppercase">
                BẢNG ĐIỀU KHIỂN GIÁO VIÊN
              </span>
              <span className="text-xs text-slate-500 font-medium">· Kết nối trực tiếp</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Phòng Thảo Luận Số – Bản Quyền Nội Dung Số
            </h1>
            <p className="text-sm font-semibold text-slate-600 mt-1">
              Giáo viên: <span className="text-blue-700">{session.teacherName}</span> – Môn: {session.subject} – Trường: {session.schoolName}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenQRCode}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-colors border border-blue-200 shadow-xs"
            >
              <QrCode className="w-4 h-4" />
              <span>Mã QR tham gia</span>
            </button>

            <button
              onClick={onOpenOverviewMatrix}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Grid className="w-4 h-4 text-blue-400" />
              <span>TRÌNH CHIẾU TỔNG HỢP</span>
            </button>

            <button
              onClick={onToggleSubmissions}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs transition-colors shadow-xs ${
                session.isSubmissionsOpen
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
              title="Đóng hoặc Mở tiếp nhận bài nộp của học sinh"
            >
              {session.isSubmissionsOpen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span>{session.isSubmissionsOpen ? 'Đang mở nhận bài' : 'Đã khóa nhận bài'}</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              title="Cài đặt buổi thảo luận"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={handleToggleSound}
              className={`p-2 rounded-xl border transition-colors ${
                soundOn
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-slate-400 border-slate-200 hover:text-slate-700'
              }`}
              title={soundOn ? 'Âm thanh: Bật' : 'Âm thanh: Tắt'}
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={handleExportCSV}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              title="Xuất kết quả ra file CSV / Excel"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              title="In báo cáo tổng hợp"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 transition-colors"
              title="Đăng xuất giáo viên"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Overview KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                Tổng số nhóm
              </span>
              <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                {totalGroups}
              </div>
            </div>
          </div>

          <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wide">
                Đã gửi câu trả lời
              </span>
              <div className="text-2xl font-black text-blue-700 font-mono tabular-nums">
                {submittedCount} <span className="text-xs text-blue-600 font-sans font-medium">/ 12 nhóm</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                Đang làm / Chưa nộp
              </span>
              <div className="text-2xl font-black text-amber-700 font-mono tabular-nums">
                {inProgressOrNotStartedCount} <span className="text-xs text-amber-600 font-sans font-medium">nhóm</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                Đã được nhận xét
              </span>
              <div className="text-2xl font-black text-emerald-700 font-mono tabular-nums">
                {reviewedCount} <span className="text-xs text-emerald-600 font-sans font-medium">/ 12 nhóm</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 4 Topic Zones Grid */}
      <div className="space-y-8">
        {session.topics.map(topic => {
          return (
            <section key={topic.id} className="space-y-3">
              {/* Topic Zone Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    {getTopicIcon(topic.icon)}
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                      {topic.title}
                    </h2>
                    <p className="text-xs text-slate-500 line-clamp-1 max-w-2xl">
                      Tình huống: &ldquo;{topic.situation}&rdquo;
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-500 self-start sm:self-center">
                  Phân công: Nhóm {topic.groupNumbers.join(', ')}
                </span>
              </div>

              {/* 3 Group Cards for this topic */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topic.groupNumbers.map(gNum => {
                  const sub = submissions[gNum];
                  const fb = feedbacks[gNum];
                  const hasAnswer = Boolean(sub?.answer1 || sub?.answer2 || sub?.answer3);

                  return (
                    <div
                      key={gNum}
                      className={`rounded-2xl border p-5 transition-all shadow-xs flex flex-col justify-between ${getCardBorderClass(
                        sub
                      )}`}
                    >
                      <div>
                        {/* Card Top: Group Num & Status */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-9 h-9 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center shadow-xs">
                              {gNum}
                            </span>
                            <span className="font-extrabold text-slate-900 text-base">
                              Nhóm {gNum}
                            </span>
                          </div>
                          {getStatusBadge(sub)}
                        </div>

                        {/* Submission Time & Word Count */}
                        <div className="p-3 bg-white/80 rounded-xl border border-slate-200/60 mb-4 text-xs text-slate-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Thời gian gửi:</span>
                            <span className="font-mono font-medium text-slate-800">
                              {sub?.submittedAt
                                ? new Date(sub.submittedAt).toLocaleTimeString('vi-VN')
                                : 'Chưa nộp'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Độ dài câu trả lời:</span>
                            <span className="font-mono font-medium text-slate-800">
                              {sub?.wordCount?.total || 0} từ
                            </span>
                          </div>
                          {fb?.generalComment && (
                            <div className="pt-1.5 border-t border-slate-100 text-[11px] text-slate-700 truncate">
                              <span className="font-semibold text-blue-700">GV: </span>
                              {fb.generalComment}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Action Buttons (3 Buttons Required) */}
                      <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => onSelectGroupForDetail(gNum)}
                          className="py-2 px-1 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Xem bài</span>
                        </button>

                        <button
                          onClick={() => onSelectGroupForPresentation(gNum)}
                          className="py-2 px-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors shadow-2xs"
                          title="Trình chiếu toàn màn hình cho lớp xem"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Trình chiếu</span>
                        </button>

                        <button
                          onClick={() => onSelectGroupForFeedback(gNum)}
                          className={`py-2 px-1 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-colors shadow-2xs border ${
                            fb?.isReviewed
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                          <span>Nhận xét</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
