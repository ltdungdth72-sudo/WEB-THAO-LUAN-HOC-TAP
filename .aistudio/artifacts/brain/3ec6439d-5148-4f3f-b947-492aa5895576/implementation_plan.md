# Kế Hoạch Triển Khai: Phòng Thảo Luận Số – Bản Quyền Nội Dung Số (Tin Học 10)

Ứng dụng web tương tác cộng tác thời gian thực phục vụ tiết học Tin học 10 tại trường THPT Đinh Tiên Hoàng của cô giáo **Lê Thị Dung**. Hệ thống cho phép 12 nhóm học sinh thảo luận và trả lời trên điện thoại cá nhân theo 4 chủ đề bản quyền, đồng thời đồng bộ tức thì lên màn hình máy chiếu của giáo viên với chế độ trình chiếu toàn màn hình chuyên nghiệp, nhận xét chi tiết và xuất báo cáo.

---

> [!IMPORTANT]
> **Quyết định kiến trúc & Xác nhận mặc định đã đề xuất:**
> 1. **Kiến trúc đồng bộ thời gian thực**: Sử dụng Full-Stack API tích hợp sẵn với Server-Sent Events (SSE) và REST endpoints lưu trữ trạng thái máy chủ (server-authoritative persistence) tại `/api/session`, `/api/submissions`, `/api/feedback`. Đảm bảo hoạt động tức thì 100% trên cả điện thoại học sinh và máy tính máy chiếu của giáo viên mà không yêu cầu cấu hình tài khoản đám mây hay thẻ tín dụng phức tạp.
> 2. **Bảo mật truy cập giáo viên**: Màn hình quản trị & chấm bài được bảo vệ bằng mã PIN xác thực giáo viên (mặc định cấu hình `1010` hoặc mật mã tùy chọn của cô Dung), lưu phiên an toàn qua HTTP headers/session token.
> 3. **Lưu bản nháp & Chống mất dữ liệu học sinh**: Hệ thống kết hợp lưu nháp cục bộ (Offline LocalStorage buffer) và tự động đồng bộ lên máy chủ khi có kết nối, cảnh báo trạng thái mạng trực quan, chống nộp đúp lặp bản ghi.

---

## 1. Tổng Quan & Trải Nghiệm Cốt Lõi

- **Môn học**: Tin học 10 – Chủ đề: *Bản quyền nội dung số, quyền lợi của tác giả và cách sử dụng nội dung số phù hợp*.
- **Giáo viên**: Lê Thị Dung – Trường THPT Đinh Tiên Hoàng.
- **Đối tượng**: Học sinh lớp 10 tham gia thảo luận nhóm trực tiếp bằng điện thoại; giáo viên điều hành và trình chiếu trên máy chiếu 16:9.
- **Giá trị cốt lõi**:
  - Không cần cài đặt ứng dụng: Học sinh quét mã QR hoặc truy cập đường dẫn là vào làm bài ngay.
  - Phân quyền rõ ràng: Học sinh chỉ chỉnh sửa bài của nhóm mình; giáo viên toàn quyền quản lý, điều phối, nhận xét và trình chiếu.
  - Tự động cập nhật thời gian thực (Zero-refresh): Khi nhóm gửi bài, bảng điều khiển giáo viên tự đổi màu trạng thái và tăng bộ đếm tức thì.

---

## 2. Trải Nghiệm Người Dùng & Thiết Kế Giao Diện

### A. Luồng Trải Nghiệm (User Flows)

1. **Màn hình Chào mừng (Role Selection)**:
   - Banner chào mừng trang trọng với biểu tượng tri thức & công nghệ số.
   - Hai lựa chọn lớn: **VÀO KHÔNG GIAN HỌC SINH** & **MÀN HÌNH GIÁO VIÊN (CÓ MẬT MÃ BẢO VỆ)**.
   - Hiển thị QR Code và đường dẫn rút gọn để học sinh quét ngay từ màn hình chiếu.

2. **Giao diện Học sinh (Mobile-First Touch Ergonomics)**:
   - **Chọn nhóm**: Danh sách 12 nhóm chia theo 4 chủ đề. Khi chọn nhóm, hệ thống lưu định danh nhóm trên thiết bị và khóa chỉnh sửa sang nhóm khác.
   - **Đầu trang**: Logo sách & công nghệ, tên phòng, tên nhóm, tên chủ đề, chỉ báo kết nối mạng và trạng thái đồng bộ (`Đã đồng bộ` / `Đang lưu nháp` / `Mất kết nối`).
   - **Thẻ Tình huống**: Trình bày rõ ràng tình huống thực tế của chủ đề được giao.
   - **3 Thẻ Câu hỏi & Ô nhập bài**:
     - *Câu 1: Hành vi nào có vấn đề?* (Gợi ý: Chỉ ra hành động vi phạm bản quyền trong tình huống).
     - *Câu 2: Quyền lợi của tác giả có thể bị ảnh hưởng như thế nào?* (Gợi ý: Tổn hại về mặt kinh tế, quyền tác quyền, uy tín...).
     - *Câu 3: Cần làm gì để sử dụng nội dung phù hợp?* (Gợi ý: Mua bản quyền, xin phép, ghi nguồn, đọc kỹ giấy phép...).
     - Bộ đếm số từ và số ký tự sống động ở mỗi ô.
   - **Thao tác gửi bài**: Nút **LƯU BẢN NHÁP** và **GỬI BÀI THẢO LUẬN**. Hộp thoại xác nhận trước khi gửi, âm thanh chúc mừng nhẹ nhàng khi gửi thành công, cho phép sửa bài nếu giáo viên đang mở phòng.

3. **Giao diện Giáo viên (Dashboard & Projector)**:
   - **Xác thực**: Nhập mã PIN bảo vệ để vào không gian điều khiển.
   - **Bảng Thống kê 4 KPI**: Tổng số nhóm (12) · Đã gửi bài · Đang làm bài · Đã nhận xét.
   - **Lưới 12 Thẻ Nhóm (4 Phân Vùng Chủ Đề)**:
     - Khu vực 1 (Xanh dương - Nhóm 1, 2, 3): Phần mềm trả phí & bản quyền.
     - Khu vực 2 (Xanh lục ngọc - Nhóm 4, 5, 6): Sử dụng hình ảnh trên Internet.
     - Khu vực 3 (Tím hoa cà - Nhóm 7, 8, 9): Sử dụng bài hát làm nhạc nền.
     - Khu vực 4 (Hổ phách - Nhóm 10, 11, 12): Sử dụng hình ảnh có giấy phép.
     - Trạng thái 5 màu chuẩn: Xám (Chưa bắt đầu), Vàng (Đang làm), Xanh dương (Đã gửi), Xanh lá (Đã nhận xét), Đỏ nhạt (Cần kiểm tra).
   - **Chế độ Trình chiếu Toàn Màn hình (Full-Screen Projector Mode)**:
     - Tối ưu 16:9, chữ to rõ ràng, tự động xuống dòng không bị cắt chữ.
     - Phân chia 3 câu hỏi trực quan với câu trả lời của nhóm.
     - Nút chuyển nhanh nhóm tiếp/trước (hỗ trợ phím mũi tên `←` / `→`).
     - Tùy chọn ẩn/hiển thị nhận xét của giáo viên.
   - **Chế độ Trình chiếu Tổng hợp (Overview Matrix)**:
     - Ma trận bao quát toàn bộ 12 nhóm và 4 chủ đề trên 1 màn hình lớn.
   - **Biểu mẫu Đánh giá & Nhận xét**:
     - Nhận xét chung, Điểm mạnh, Nội dung cần bổ sung, Đề xuất hoàn thiện.
     - Nút Lưu nhận xét, Đánh dấu hoàn thành, Công bố/Ẩn với học sinh.
   - **Quản lý Tiết học**:
     - Đóng/Mở nhận bài, chỉnh sửa thông tin lớp/trường/giáo viên, xuất file CSV/Excel, in báo cáo tổng kết.

### B. Ngôn Ngữ Thiết Kế & Bảng Màu (60-30-10)

- **Phông chữ**: `Plus Jakarta Sans` cho tiêu đề và nội dung, `IBM Plex Mono` / `tabular-nums` cho bộ đếm số nhóm và thời gian.
- **Bảng màu**:
  - 60% Nền: Trắng ngà dịu mắt (`#F8FAFC` & `#FFFFFF`), nền tối chế độ chiếu rạp sang trọng (`#0F172A`).
  - 30% Bề mặt cấu trúc: Thẻ bo tròn 16px, viền mảnh tinh tế (`border-slate-200`), đổ bóng nhẹ `shadow-sm`.
  - 10% Điểm nhấn: Xanh lam Indigo giáo dục (`#2563EB`), Xanh ngọc lục bảo (`#059669`), Hổ phách (`#D97706`), Tím hoàng gia (`#7C3AED`).

---

## 3. Kiến Trúc Kỹ Thuật & Luồng Dữ Liệu

### Sơ Đồ Hệ Thống

```
┌────────────────────────────────────────────────────────┐
│                   HỌC SINH (Smartphones)               │
│  - Quét QR / Chọn nhóm 1..12                           │
│  - Nhập 3 câu hỏi + Tự động lưu nháp cục bộ (Offline)   │
│  - Gửi bài qua POST /api/submissions                  │
└───────────────────────────┬────────────────────────────┘
                            │ REST / SSE
                            ▼
┌────────────────────────────────────────────────────────┐
│           MÁY CHỦ FULL-STACK (Vite + Express)          │
│  - GET /api/session (Thông tin lớp, 4 chủ đề, trạng thái)│
│  - POST /api/submissions (Lưu bài nộp, chống trùng lặp)│
│  - GET /api/stream (SSE Broadcast sự kiện thời gian thực)│
│  - POST /api/feedback (Lưu nhận xét giáo viên có PIN)   │
│  - Persistent JSON Storage (data/session-state.json)   │
└───────────────────────────┬────────────────────────────┘
                            │ SSE Broadcast (Zero-refresh)
                            ▼
┌────────────────────────────────────────────────────────┐
│             MÀN HÌNH GIÁO VIÊN & MÁY CHIẾU             │
│  - Bảng điều khiển 12 nhóm tự động nhảy màu khi có bài │
│  - Xem chi tiết + Nhận xét 4 tiêu chí                  │
│  - Trình chiếu toàn màn hình 16:9 + Phím tắt ← / →    │
│  - Xuất bảng kết quả CSV / In tổng kết                 │
└────────────────────────────────────────────────────────┘
```

### Cấu Trúc Dữ Liệu Cốt Lõi (Data Models)

1. **Session Config (`session.json`)**:
   ```typescript
   interface ClassSession {
     sessionId: string;
     className: string;         // "10A1"
     teacherName: string;       // "Lê Thị Dung"
     schoolName: string;        // "THPT Đinh Tiên Hoàng"
     subject: string;           // "Tin học 10"
     topicTitle: string;        // "Bản quyền nội dung số..."
     isSubmissionsOpen: boolean;// true/false
     teacherPin: string;        // "1010"
     topics: TopicConfig[];     // 4 chủ đề
   }
   ```
2. **Submissions (`submissions.json`)**:
   ```typescript
   interface GroupSubmission {
     groupId: number;           // 1 to 12
     topicId: number;           // 1 to 4
     answer1: string;           // Hành vi nào có vấn đề?
     answer2: string;           // Quyền lợi tác giả bị ảnh hưởng?
     answer3: string;           // Cách sử dụng phù hợp?
     status: 'draft' | 'submitted' | 'reviewed';
     submittedAt?: string;
     updatedAt: string;
     clientDeviceId?: string;
   }
   ```
3. **Teacher Feedback (`feedback.json`)**:
   ```typescript
   interface TeacherFeedback {
     groupId: number;
     generalComment: string;
     strengths: string;
     improvements: string;
     suggestions: string;
     isReviewed: boolean;
     isPublishedToStudent: boolean;
     reviewedAt: string;
   }
   ```

---

## 4. Kế Hoạch Các Bước Thực Hiện Chi Tiết

1. **Bước 1: Cấu hình Dự án & Dữ liệu Nền tảng**
   - Cập nhật `metadata.json` và `index.html` với tiêu đề chuẩn: *Phòng Thảo Luận Số – Bản Quyền Nội Dung Số | Cô Lê Thị Dung – THPT Đinh Tiên Hoàng*.
   - Xây dựng mô-đun lưu trữ dữ liệu thời gian thực trên máy chủ (Express router + Vite middleware) hỗ trợ đầy đủ Server-Sent Events (SSE) để truyền dữ liệu tức thì đến màn hình giáo viên.
   - Định nghĩa bộ dữ liệu mẫu chuẩn cho 4 chủ đề và 12 nhóm theo đề bài.

2. **Bước 2: Xây Dựng Giao Diện Học Sinh Trên Điện Thoại**
   - Thiết kế màn hình chọn nhóm với phân nhóm trực quan.
   - Trình bày thẻ tình huống chủ đề tương ứng.
   - Form trả lời 3 câu hỏi với gợi ý thực tiễn, bộ đếm ký tự/từ.
   - Cơ chế lưu nháp tự động vào LocalStorage + gửi lên server khi có mạng; nút xác nhận gửi bài và thông báo thành công.

3. **Bước 3: Xây Dựng Bảng Điều Khiển Giáo Viên (Teacher Dashboard)**
   - Màn hình nhập mã PIN bảo mật giáo viên.
   - Thước đo 4 chỉ số tổng quan (12 nhóm, số đã nộp, đang làm, đã nhận xét).
   - Lưới 12 thẻ phân theo 4 khu vực màu sắc với biểu tượng tương ứng (khiên/phần mềm, ảnh/nguồn, nhạc/video, giấy phép).
   - Cơ chế tự động lắng nghe SSE cập nhật tức thì màu thẻ và thời gian nộp mà không cần F5.

4. **Bước 4: Chế Độ Trình Chiếu Toàn Màn Hình & Trình Chiếu Tổng Hợp**
   - Trình chiếu chi tiết từng nhóm tỉ lệ 16:9 với chữ lớn, tương phản cao, hỗ trợ chuyển nhóm bằng phím mũi tên hoặc nút bấm.
   - Trình chiếu ma trận tổng hợp cả 12 nhóm để cô Dung bao quát hoạt động.
   - Bảng biểu nhận xét của giáo viên (4 ô: chung, điểm mạnh, cần bổ sung, đề xuất).

5. **Bước 5: Quản Lý Buổi Học, Xuất Báo Cáo & Âm Thanh**
   - Xuất dữ liệu thảo luận ra file CSV/Excel cho giáo viên lưu trữ hồ sơ.
   - Tùy chọn In phiếu tổng kết bài làm các nhóm.
   - Nút bật/tắt âm thanh hiệu ứng nhẹ nhàng (Web Audio API không cần file ngoài).
   - Modal cài đặt quản lý buổi học: Đổi tên lớp, khóa/mở nhận bài, đặt lại dữ liệu.

6. **Bước 6: Kiểm Thử & Tinh Chỉnh Hoàn Thiện**
   - Kiểm tra tương thích màn hình di động học sinh và màn chiếu giáo viên.
   - Kiểm tra chống trùng bài khi bấm gửi nhiều lần, phục hồi bản nháp khi mất mạng.
   - Chạy lệnh kiểm tra biên dịch `compile_applet`.

---

## 5. Kế Hoạch Xác Minh (Verification Plan)

- **Mô phỏng 12 nhóm**: Gửi bài thử nghiệm từ thiết bị học sinh và xác nhận thẻ trên màn hình giáo viên cập nhật màu xanh tức thì.
- **Trình chiếu máy chiếu**: Thử nghiệm chế độ toàn màn hình, kiểm tra phím mũi tên `←` / `→` và ngắt dòng nội dung dài.
- **Xác thực giáo viên**: Thử nghiệm nhập sai PIN, đăng nhập đúng PIN, lưu nhận xét và xuất file CSV.
- **Bền vững kết nối**: Kiểm tra tải lại trang (F5) cả phía học sinh và giáo viên, dữ liệu bài nộp vẫn được bảo toàn nguyên vẹn.
