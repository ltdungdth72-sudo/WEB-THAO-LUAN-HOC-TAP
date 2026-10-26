import { ClassroomSession, GroupSubmission, TeacherFeedback, TopicConfig, QuestionConfig } from './types.ts';

export const DEFAULT_QUESTIONS: QuestionConfig[] = [
  {
    id: 1,
    question: "Hành vi nào có vấn đề?",
    hint: "Chỉ ra cụ thể hành động trong tình huống chưa phù hợp hoặc có dấu hiệu vi phạm quyền tác giả/bản quyền nội dung số."
  },
  {
    id: 2,
    question: "Quyền lợi của tác giả có thể bị ảnh hưởng như thế nào?",
    hint: "Phân tích tác động đến quyền tài sản (thu nhập, chi phí sáng tạo) và quyền nhân thân (tên tuổi, uy tín, quyền toàn vẹn tác phẩm)."
  },
  {
    id: 3,
    question: "Cần làm gì để sử dụng nội dung phù hợp?",
    hint: "Đề xuất các bước và giải pháp văn minh, đúng pháp luật: mua bản quyền, xin phép tác giả, kiểm tra giấy phép mở (Creative Commons), ghi nguồn trích dẫn đúng quy cách..."
  }
];

export const DEFAULT_TOPICS: TopicConfig[] = [
  {
    id: 1,
    title: "Chủ đề 1: Phần mềm trả phí và bản quyền",
    situation: "Một học sinh tải phần mềm trả phí từ nguồn không chính thức và dùng bản đã bẻ khóa.",
    groupNumbers: [1, 2, 3],
    icon: "software",
    colorTag: "blue"
  },
  {
    id: 2,
    title: "Chủ đề 2: Sử dụng hình ảnh trên Internet",
    situation: "Lấy ảnh trên Internet đưa vào bài trình chiếu, không ghi nguồn và không kiểm tra điều kiện sử dụng.",
    groupNumbers: [4, 5, 6],
    icon: "image",
    colorTag: "emerald"
  },
  {
    id: 3,
    title: "Chủ đề 3: Sử dụng bài hát làm nhạc nền",
    situation: "Dùng một bài hát nổi tiếng làm nhạc nền cho video của lớp rồi đăng công khai lên mạng xã hội.",
    groupNumbers: [7, 8, 9],
    icon: "music",
    colorTag: "purple"
  },
  {
    id: 4,
    title: "Chủ đề 4: Sử dụng hình ảnh có giấy phép",
    situation: "Tải một hình ảnh có giấy phép sử dụng, nhưng chưa đọc điều kiện giấy phép trước khi chỉnh sửa và đăng lại.",
    groupNumbers: [10, 11, 12],
    icon: "license",
    colorTag: "amber"
  }
];

export const DEFAULT_SESSION: ClassroomSession = {
  sessionId: "tin-hoc-10-ban-quyen-dth",
  className: "Tin học 10",
  teacherName: "Lê Thị Dung",
  schoolName: "THPT Đinh Tiên Hoàng",
  subject: "Tin học 10",
  lessonName: "Bản quyền nội dung số, quyền lợi của tác giả và cách sử dụng nội dung số phù hợp",
  isSubmissionsOpen: true,
  allowEditAfterSubmit: true,
  teacherPin: "1010",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  topics: DEFAULT_TOPICS,
  questions: DEFAULT_QUESTIONS
};

export function createInitialSubmissions(): Record<number, GroupSubmission> {
  const submissions: Record<number, GroupSubmission> = {};
  for (let i = 1; i <= 12; i++) {
    const topicId = Math.ceil(i / 3);
    submissions[i] = {
      groupId: i,
      groupNumber: i,
      topicId: topicId,
      answer1: "",
      answer2: "",
      answer3: "",
      status: "not_started",
      updatedAt: new Date().toISOString(),
      wordCount: { ans1: 0, ans2: 0, ans3: 0, total: 0 }
    };
  }
  return submissions;
}

export function createInitialFeedbacks(): Record<number, TeacherFeedback> {
  const feedbacks: Record<number, TeacherFeedback> = {};
  for (let i = 1; i <= 12; i++) {
    feedbacks[i] = {
      groupId: i,
      generalComment: "",
      strengths: "",
      improvements: "",
      suggestions: "",
      isReviewed: false,
      isPublishedToStudent: false
    };
  }
  return feedbacks;
}
