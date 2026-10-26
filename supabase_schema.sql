-- ==============================================================================
-- HỆ THỐNG PHÒNG THẢO LUẬN SỐ - BẢN QUYỀN NỘI DUNG SỐ (TIN HỌC 10)
-- GIÁO VIÊN: LÊ THỊ DUNG - THPT ĐINH TIÊN HOÀNG
-- SCHEMA CHO SUPABASE POSTGRESQL & REALTIME
-- ==============================================================================

-- 1. BẬT TIỆN ÍCH MỞ RỘNG CẦN THIẾT
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. BẢNG 1: QUẢN LÝ TIẾT HỌC / BUỔI THẢO LUẬN (classroom_sessions)
CREATE TABLE IF NOT EXISTS public.classroom_sessions (
    session_id TEXT PRIMARY KEY,
    class_name TEXT NOT NULL DEFAULT 'Tin học 10',
    teacher_name TEXT NOT NULL DEFAULT 'Lê Thị Dung',
    school_name TEXT NOT NULL DEFAULT 'THPT Đinh Tiên Hoàng',
    subject TEXT NOT NULL DEFAULT 'Tin học 10',
    lesson_name TEXT NOT NULL DEFAULT 'Bản quyền nội dung số, quyền lợi của tác giả và cách sử dụng nội dung số phù hợp',
    is_submissions_open BOOLEAN NOT NULL DEFAULT TRUE,
    allow_edit_after_submit BOOLEAN NOT NULL DEFAULT TRUE,
    teacher_pin TEXT NOT NULL DEFAULT '1010',
    topics JSONB NOT NULL DEFAULT '[]'::jsonb,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. BẢNG 2: BÀI NỘP VÀ CÂU TRẢ LỜI CỦA 12 NHÓM (submissions)
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL REFERENCES public.classroom_sessions(session_id) ON DELETE CASCADE,
    group_id INTEGER NOT NULL CHECK (group_id >= 1 AND group_id <= 12),
    group_number INTEGER NOT NULL CHECK (group_number >= 1 AND group_number <= 12),
    topic_id INTEGER NOT NULL CHECK (topic_id >= 1 AND topic_id <= 4),
    answer1 TEXT NOT NULL DEFAULT '',
    answer2 TEXT NOT NULL DEFAULT '',
    answer3 TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'submitted', 'reviewed')),
    word_count JSONB NOT NULL DEFAULT '{"ans1": 0, "ans2": 0, "ans3": 0, "total": 0}'::jsonb,
    submitted_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    client_device_id TEXT,
    CONSTRAINT unique_session_group UNIQUE (session_id, group_id)
);

-- 4. BẢNG 3: NHẬN XÉT VÀ ĐÁNH GIÁ 4 TIÊU CHÍ CỦA GIÁO VIÊN (teacher_feedback)
CREATE TABLE IF NOT EXISTS public.teacher_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL REFERENCES public.classroom_sessions(session_id) ON DELETE CASCADE,
    group_id INTEGER NOT NULL CHECK (group_id >= 1 AND group_id <= 12),
    general_comment TEXT NOT NULL DEFAULT '',
    strengths TEXT NOT NULL DEFAULT '',
    improvements TEXT NOT NULL DEFAULT '',
    suggestions TEXT NOT NULL DEFAULT '',
    is_reviewed BOOLEAN NOT NULL DEFAULT FALSE,
    is_published_to_student BOOLEAN NOT NULL DEFAULT FALSE,
    reviewed_at TIMESTAMPTZ,
    reviewed_by TEXT DEFAULT 'Lê Thị Dung',
    CONSTRAINT unique_session_feedback_group UNIQUE (session_id, group_id)
);

-- 5. KÍCH HOẠT REALTIME CHO SUPABASE (Đồng bộ tức thì lên máy chiếu)
ALTER PUBLICATION supabase_realtime ADD TABLE public.classroom_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teacher_feedback;

-- 6. THIẾT LẬP ROW LEVEL SECURITY (RLS) PHÙ HỢP VỚI LỚP HỌC
ALTER TABLE public.classroom_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_feedback ENABLE ROW LEVEL SECURITY;

-- Cho phép đọc công khai thông tin buổi học & bài nộp
CREATE POLICY "Cho phép đọc dữ liệu buổi học" 
    ON public.classroom_sessions FOR SELECT 
    USING (true);

CREATE POLICY "Cho phép cập nhật buổi học" 
    ON public.classroom_sessions FOR UPDATE 
    USING (true);

CREATE POLICY "Cho phép đọc bài nộp của nhóm" 
    ON public.submissions FOR SELECT 
    USING (true);

CREATE POLICY "Cho phép học sinh tạo và cập nhật bài nộp" 
    ON public.submissions FOR ALL 
    USING (true);

CREATE POLICY "Cho phép đọc nhận xét công khai" 
    ON public.teacher_feedback FOR SELECT 
    USING (true);

CREATE POLICY "Cho phép cập nhật nhận xét giáo viên" 
    ON public.teacher_feedback FOR ALL 
    USING (true);

-- 7. CHÈN DỮ LIỆU BAN ĐẦU CHUẨN (SEED DATA)
INSERT INTO public.classroom_sessions (
    session_id,
    class_name,
    teacher_name,
    school_name,
    subject,
    lesson_name,
    is_submissions_open,
    allow_edit_after_submit,
    teacher_pin,
    topics,
    questions
) VALUES (
    'tin-hoc-10-ban-quyen-dth',
    'Tin học 10',
    'Lê Thị Dung',
    'THPT Đinh Tiên Hoàng',
    'Tin học 10',
    'Bản quyền nội dung số, quyền lợi của tác giả và cách sử dụng nội dung số phù hợp',
    TRUE,
    TRUE,
    '1010',
    '[
      {
        "id": 1,
        "title": "Chủ đề 1: Phần mềm trả phí và bản quyền",
        "situation": "Một học sinh tải phần mềm trả phí từ nguồn không chính thức và dùng bản đã bẻ khóa.",
        "groupNumbers": [1, 2, 3],
        "icon": "software",
        "colorTag": "blue"
      },
      {
        "id": 2,
        "title": "Chủ đề 2: Sử dụng hình ảnh trên Internet",
        "situation": "Lấy ảnh trên Internet đưa vào bài trình chiếu, không ghi nguồn và không kiểm tra điều kiện sử dụng.",
        "groupNumbers": [4, 5, 6],
        "icon": "image",
        "colorTag": "emerald"
      },
      {
        "id": 3,
        "title": "Chủ đề 3: Sử dụng bài hát làm nhạc nền",
        "situation": "Dùng một bài hát nổi tiếng làm nhạc nền cho video của lớp rồi đăng công khai lên mạng xã hội.",
        "groupNumbers": [7, 8, 9],
        "icon": "music",
        "colorTag": "purple"
      },
      {
        "id": 4,
        "title": "Chủ đề 4: Sử dụng hình ảnh có giấy phép",
        "situation": "Tải một hình ảnh có giấy phép sử dụng, nhưng chưa đọc điều kiện giấy phép trước khi chỉnh sửa và đăng lại.",
        "groupNumbers": [10, 11, 12],
        "icon": "license",
        "colorTag": "amber"
      }
    ]'::jsonb,
    '[
      {
        "id": 1,
        "question": "Hành vi nào có vấn đề?",
        "hint": "Chỉ ra cụ thể hành động trong tình huống chưa phù hợp hoặc có dấu hiệu vi phạm quyền tác giả/bản quyền nội dung số."
      },
      {
        "id": 2,
        "question": "Quyền lợi của tác giả có thể bị ảnh hưởng như thế nào?",
        "hint": "Phân tích tác động đến quyền tài sản (thu nhập, chi phí sáng tạo) và quyền nhân thân (tên tuổi, uy tín, quyền toàn vẹn tác phẩm)."
      },
      {
        "id": 3,
        "question": "Cần làm gì để sử dụng nội dung phù hợp?",
        "hint": "Đề xuất các bước và giải pháp văn minh, đúng pháp luật: mua bản quyền, xin phép tác giả, kiểm tra giấy phép mở (Creative Commons), ghi nguồn trích dẫn đúng quy cách..."
      }
    ]'::jsonb
) ON CONFLICT (session_id) DO NOTHING;

-- Khởi tạo sẵn 12 nhóm học sinh
INSERT INTO public.submissions (session_id, group_id, group_number, topic_id, answer1, answer2, answer3, status)
SELECT 
    'tin-hoc-10-ban-quyen-dth',
    g,
    g,
    CASE 
        WHEN g <= 3 THEN 1
        WHEN g <= 6 THEN 2
        WHEN g <= 9 THEN 3
        ELSE 4
    END,
    '',
    '',
    '',
    'not_started'
FROM generate_series(1, 12) AS g
ON CONFLICT (session_id, group_id) DO NOTHING;

-- Khởi tạo sẵn 12 bản ghi nhận xét
INSERT INTO public.teacher_feedback (session_id, group_id, general_comment, strengths, improvements, suggestions, is_reviewed, is_published_to_student)
SELECT 
    'tin-hoc-10-ban-quyen-dth',
    g,
    '',
    '',
    '',
    '',
    FALSE,
    FALSE
FROM generate_series(1, 12) AS g
ON CONFLICT (session_id, group_id) DO NOTHING;
