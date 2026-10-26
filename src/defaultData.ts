import type { ClassroomSession, GroupSubmission, TeacherFeedback, TopicConfig, QuestionConfig } from './types.ts';

export const DEFAULT_QUESTIONS: QuestionConfig[] = [
  {
    id: 1,
    question: "1. Ai là người trực tiếp sáng tạo ra sản phẩm?",
    hint: "Xác định rõ cá nhân/tác giả đã trực tiếp bỏ công sức, trí tuệ để sáng tạo ra sản phẩm (áp phích) trong tình huống."
  },
  {
    id: 2,
    question: "2. Việc xóa tên tác giả và đăng lại sản phẩm có phù hợp không? Vì sao?",
    hint: "Đánh giá về tính pháp lý (Luật Sở hữu trí tuệ), đạo đức số và quyền nhân thân của tác giả khi bị xóa tên."
  },
  {
    id: 3,
    question: "3. Quyền tác giả trong tình huống này liên quan đến những quyền nào?",
    hint: "Phân tích quyền nhân thân (đứng tên, bảo vệ sự toàn vẹn tác phẩm) và quyền tài sản (phân phối, sử dụng tác phẩm)."
  },
  {
    id: 4,
    question: "4. Nếu muốn sử dụng áp phích của An, em nên làm gì?",
    hint: "Nêu các bước văn minh, đúng pháp luật: liên hệ xin phép tác giả An, ghi rõ nguồn và tên tác giả, tôn trọng sự toàn vẹn tác phẩm..."
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
      answer4: "",
      status: "not_started",
      updatedAt: new Date().toISOString(),
      wordCount: { ans1: 0, ans2: 0, ans3: 0, ans4: 0, total: 0 }
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
