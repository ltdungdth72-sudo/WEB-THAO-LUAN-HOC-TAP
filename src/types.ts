/**
 * Định nghĩa kiểu dữ liệu cho hệ thống Phòng Thảo Luận Số
 * Môn: Tin học 10 - THPT Đinh Tiên Hoàng - GV: Lê Thị Dung
 */

export type SubmissionStatus = 'not_started' | 'in_progress' | 'submitted' | 'reviewed';

export interface QuestionConfig {
  id: number;
  question: string;
  hint: string;
}

export interface TopicConfig {
  id: number;
  title: string;
  situation: string;
  groupNumbers: number[];
  icon: 'software' | 'image' | 'music' | 'license';
  colorTag: 'blue' | 'emerald' | 'purple' | 'amber';
}

export interface GroupSubmission {
  groupId: number;
  groupNumber: number;
  topicId: number;
  answer1: string;
  answer2: string;
  answer3: string;
  answer4?: string;
  status: SubmissionStatus;
  submittedAt?: string;
  updatedAt: string;
  clientDeviceId?: string;
  wordCount?: {
    ans1: number;
    ans2: number;
    ans3: number;
    ans4?: number;
    total: number;
  };
}

export interface TeacherFeedback {
  groupId: number;
  generalComment: string;
  strengths: string;
  improvements: string;
  suggestions: string;
  isReviewed: boolean;
  isPublishedToStudent: boolean;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface ClassroomSession {
  sessionId: string;
  className: string;
  teacherName: string;
  schoolName: string;
  subject: string;
  lessonName: string;
  isSubmissionsOpen: boolean;
  allowEditAfterSubmit: boolean;
  teacherPin: string;
  createdAt: string;
  updatedAt: string;
  topics: TopicConfig[];
  questions: QuestionConfig[];
}

export interface FullClassroomData {
  session: ClassroomSession;
  submissions: Record<number, GroupSubmission>;
  feedbacks: Record<number, TeacherFeedback>;
}

export interface PublicClassroomData {
  session: Omit<ClassroomSession, 'teacherPin'>;
  groupsSummary: {
    groupId: number;
    topicId: number;
    status: SubmissionStatus;
    submittedAt?: string;
    hasFeedback: boolean;
  }[];
}
