# HƯỚNG DẪN CẤU HÌNH VÀ SỬ DỤNG PHÒNG THẢO LUẬN SỐ
### Dành cho Cô Lê Thị Dung – Giáo viên Tin học 10 – THPT Đinh Tiên Hoàng

---

## I. TỔNG QUAN HỆ THỐNG
**Phòng Thảo Luận Số** là ứng dụng web tương tác thời gian thực (Real-time Full-Stack) được xây dựng chuyên biệt cho tiết học Tin học 10 với nội dung: **"Bản quyền nội dung số, quyền lợi của tác giả và cách sử dụng nội dung số phù hợp"**.

### Các thành phần chính:
1. **Không gian Học sinh**: Giao diện tối ưu cho điện thoại di động (Mobile-First), học sinh quét mã QR hoặc truy cập đường link để chọn nhóm (1 trong 12 nhóm), đọc tình huống của chủ đề được giao và trả lời 3 câu hỏi. Tự động lưu nháp liên tục, có bản sao lưu ngoại tuyến (Offline Buffer) chống mất dữ liệu khi mạng chập chờn.
2. **Màn hình Giáo viên**: Bảng điều khiển tối ưu cho máy tính kết nối máy chiếu (16:9), tự động cập nhật thời gian thực (Zero-refresh qua Server-Sent Events) khi có học sinh nộp bài.
3. **Chế độ Trình chiếu Máy chiếu**: Trình chiếu toàn màn hình câu trả lời của từng nhóm với cỡ chữ lớn, rõ ràng, hỗ trợ điều khiển bằng phím mũi tên `←` / `→` trên bàn phím hoặc bút trình chiếu.
4. **Hệ thống Đánh giá 4 Tiêu chí**: Nhận xét chung, Điểm mạnh, Nội dung cần bổ sung, Đề xuất hoàn thiện; có tùy chọn công khai cho học sinh hoặc lưu nội bộ.
5. **Xuất báo cáo**: Xuất toàn bộ kết quả thảo luận ra file Excel / CSV (hỗ trợ tiếng Việt UTF-8 chuẩn).

---

## II. 4 CHỦ ĐỀ VÀ PHÂN CÔNG 12 NHÓM

| Phân khu | Chủ đề | Tình huống thực tế | Phân công | Biểu tượng |
| :--- | :--- | :--- | :--- | :--- |
| **Khu vực 1** | **Chủ đề 1: Phần mềm trả phí và bản quyền** | Một học sinh tải phần mềm trả phí từ nguồn không chính thức và dùng bản đã bẻ khóa. | **Nhóm 1, Nhóm 2, Nhóm 3** | Phần mềm & Khiên bảo vệ |
| **Khu vực 2** | **Chủ đề 2: Sử dụng hình ảnh trên Internet** | Lấy ảnh trên Internet đưa vào bài trình chiếu, không ghi nguồn và không kiểm tra điều kiện sử dụng. | **Nhóm 4, Nhóm 5, Nhóm 6** | Hình ảnh & Trích dẫn |
| **Khu vực 3** | **Chủ đề 3: Sử dụng bài hát làm nhạc nền** | Dùng một bài hát nổi tiếng làm nhạc nền cho video của lớp rồi đăng công khai lên mạng xã hội. | **Nhóm 7, Nhóm 8, Nhóm 9** | Âm nhạc & Video |
| **Khu vực 4** | **Chủ đề 4: Sử dụng hình ảnh có giấy phép** | Tải một hình ảnh có giấy phép sử dụng, nhưng chưa đọc điều kiện giấy phép trước khi chỉnh sửa và đăng lại. | **Nhóm 10, Nhóm 11, Nhóm 12** | Giấy phép & Tài liệu |

### 3 Câu hỏi bắt buộc cho mỗi nhóm:
1. **Câu hỏi 1**: *Hành vi nào có vấn đề?*
2. **Câu hỏi 2**: *Quyền lợi của tác giả có thể bị ảnh hưởng như thế nào?*
3. **Câu hỏi 3**: *Cần làm gì để sử dụng nội dung phù hợp?*

---

## III. QUY TRÌNH TỔ CHỨC TIẾT HỌC TRÊN LỚP (10 BƯỚC)

- **Bước 1**: Giáo viên mở ứng dụng trên máy tính kết nối máy chiếu, bấm **Màn hình giáo viên** và nhập mã PIN bảo mật (**Mặc định: `1010`**).
- **Bước 2**: Giáo viên bấm nút **Mã QR** trên thanh công cụ. Màn hình máy chiếu sẽ phóng to mã QR và đường link tham gia lớp học.
- **Bước 3**: Học sinh dùng camera điện thoại (hoặc Zalo/trình duyệt) quét mã QR để vào phòng.
- **Bước 4**: Học sinh chọn đúng số nhóm mà cô Dung đã phân công (Nhóm 1 đến Nhóm 12).
- **Bước 5**: Điện thoại học sinh lập tức hiển thị chủ đề và tình huống tương ứng. Các em cùng thảo luận nhóm và nhập câu trả lời vào 3 ô câu hỏi.
- **Bước 6**: Hệ thống tự động lưu bản nháp theo thời gian thực (học sinh cũng có thể chủ động bấm **Lưu nháp**).
- **Bước 7**: Sau khi thống nhất câu trả lời, đại diện nhóm bấm **GỬI BÀI THẢO LUẬN** và xác nhận trên hộp thoại.
- **Bước 8**: Màn hình máy chiếu của cô Dung lập tức đổi màu thẻ nhóm sang **Xanh dương (Đã gửi bài)** và phát âm thanh chuông nhẹ báo hiệu có bài mới mà cô không cần tải lại trang.
- **Bước 9**: Khi hết thời gian thảo luận, cô Dung bấm nút **Đóng nhận bài** để chốt kết quả, sau đó bấm **TRÌNH CHIẾU** trên thẻ nhóm để cùng cả lớp phân tích, nhận xét và ghi chú đánh giá.
- **Bước 10**: Cuối tiết học, cô Dung bấm nút **Xuất CSV** để lưu file kết quả làm việc của 12 nhóm vào máy tính phục vụ lưu trữ học bạ điện tử hoặc in phiếu tổng kết.

---

## IV. BẢO MẬT & PHÂN QUYỀN

1. **Bảo vệ màn hình quản trị**: Màn hình giáo viên được bảo vệ bằng mã PIN máy chủ (`x-teacher-pin`). Học sinh không thể tự tiện truy cập hay can thiệp điểm số/nhận xét của giáo viên.
2. **Bảo vệ bài làm giữa các nhóm**: Khi học sinh chọn Nhóm trên điện thoại, thiết bị sẽ gắn mã định danh thiết bị (`clientDeviceId`) và khóa quyền chỉnh sửa câu trả lời của các nhóm khác.
3. **Cơ chế lưu nháp chống mất kết nối**: Nếu mạng WiFi của trường bị gián đoạn, ứng dụng chuyển sang chế độ **Đã lưu tạm trên máy** (LocalStorage) và hiện thông báo rõ ràng cho học sinh. Khi có mạng trở lại, học sinh có thể gửi bài an toàn mà không bị mất chữ hay gửi trùng lặp.
4. **Nhận xét nội bộ vs Công khai**: Cô Dung có thể linh hoạt chọn **Chỉ lưu nội bộ** (chỉ giáo viên thấy trên máy chiếu) hoặc **Công khai nhận xét** (học sinh mở điện thoại sẽ xem được lời nhận xét của cô).

---

## V. TÁI SỬ DỤNG CHO CÁC TIẾT HỌC HOẶC LỚP KHÁC

Trong bảng điều khiển giáo viên, cô Dung bấm vào biểu tượng **Cài đặt (Bánh răng)** để:
- Thay đổi tên lớp học (ví dụ: `10A1`, `10A2`, `10A3`...).
- Thay đổi tên trường, tên giáo viên.
- Thay đổi nội dung 4 tình huống hoặc 3 câu hỏi cho các chủ đề học tập khác (ví dụ: An toàn trên không gian mạng, Đạo đức trong môi trường số...).
- Đổi mã PIN bảo mật giáo viên mới.
- Bấm **Đặt lại dữ liệu** để xóa sạch bài nộp cũ và sẵn sàng cho tiết học tiếp theo của lớp mới.
