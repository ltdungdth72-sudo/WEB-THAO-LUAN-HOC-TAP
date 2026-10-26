import { FullClassroomData } from '../types.ts';

/**
 * Xuất dữ liệu 12 nhóm thảo luận ra định dạng CSV hỗ trợ mở bằng Microsoft Excel tiếng Việt (UTF-8 BOM)
 */
export function exportClassroomToCSV(data: FullClassroomData) {
  const { session, submissions, feedbacks } = data;

  const sanitize = (text: string | undefined): string => {
    if (!text) return '""';
    const escaped = text.replace(/"/g, '""').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    return `"${escaped}"`;
  };

  const headers = [
    'Số nhóm',
    'Chủ đề',
    'Tình huống thảo luận',
    'Trạng thái bài nộp',
    'Thời gian nộp',
    'Câu 1: Hành vi nào có vấn đề?',
    'Số từ Câu 1',
    'Câu 2: Quyền lợi tác giả bị ảnh hưởng?',
    'Số từ Câu 2',
    'Câu 3: Cách sử dụng nội dung phù hợp?',
    'Số từ Câu 3',
    'Tổng số từ',
    'Nhận xét chung của GV',
    'Điểm mạnh',
    'Nội dung cần bổ sung',
    'Đề xuất hoàn thiện',
    'Đã đánh giá'
  ];

  const rows: string[] = [];
  rows.push(headers.join(','));

  for (let i = 1; i <= 12; i++) {
    const sub = submissions[i] || {
      groupId: i,
      groupNumber: i,
      topicId: Math.ceil(i / 3),
      answer1: '',
      answer2: '',
      answer3: '',
      status: 'not_started'
    };

    const topic = session.topics.find(t => t.id === sub.topicId) || session.topics[0];
    const fb = feedbacks[i] || {
      generalComment: '',
      strengths: '',
      improvements: '',
      suggestions: '',
      isReviewed: false
    };

    const statusText = {
      not_started: 'Chưa bắt đầu',
      in_progress: 'Đang làm bài',
      submitted: 'Đã gửi bài',
      reviewed: 'Đã nhận xét'
    }[sub.status] || sub.status;

    const row = [
      `"Nhóm ${i}"`,
      sanitize(topic?.title),
      sanitize(topic?.situation),
      `"${statusText}"`,
      sub.submittedAt ? `"${new Date(sub.submittedAt).toLocaleString('vi-VN')}"` : '""',
      sanitize(sub.answer1),
      sub.wordCount?.ans1 || 0,
      sanitize(sub.answer2),
      sub.wordCount?.ans2 || 0,
      sanitize(sub.answer3),
      sub.wordCount?.ans3 || 0,
      sub.wordCount?.total || 0,
      sanitize(fb.generalComment),
      sanitize(fb.strengths),
      sanitize(fb.improvements),
      sanitize(fb.suggestions),
      fb.isReviewed ? '"Đã nhận xét"' : '"Chưa nhận xét"'
    ];

    rows.push(row.join(','));
  }

  const csvContent = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  const filename = `Ket_qua_thao_luan_${session.className.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
