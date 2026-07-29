# Quiz Platform API

Phiên bản 2.0 của backend quiz, tập trung vào bảo mật, tính nhất quán dữ liệu và trải nghiệm tích hợp frontend.

## Nâng cấp nổi bật

- Mật khẩu được hash bằng bcrypt; JWT hết hạn và không cho client tự cấp quyền admin.
- Helmet, CORS, rate limit đăng nhập, giới hạn body và structured logging có che dữ liệu nhạy cảm.
- Validation tập trung bằng Zod với lỗi `422` chi tiết.
- Quiz có category, difficulty, trạng thái publish, giới hạn thời gian và điểm số từng câu.
- Danh sách quiz/user/question có phân trang; quiz hỗ trợ search/filter.
- Đáp án đúng không bị lộ ở API public. Endpoint submit trả điểm, phần trăm và giải thích.
- Thao tác nhiều collection sử dụng MongoDB transaction.
- OpenAPI UI tại `/docs`, JSON spec tại `/openapi.json`, health check tại `/health`.
- Graceful shutdown và test tự động bằng Node test runner.

## Khởi chạy

Yêu cầu Node.js 20+ và MongoDB (transaction cần replica set, kể cả replica set một node).

```bash
copy .env.example .env
npm install
npm test
npm run dev
```

API mới có prefix `/api/v1`; các đường dẫn cũ vẫn được giữ làm alias để frontend hiện tại không hỏng ngay.

## Luồng sử dụng nhanh

1. `POST /api/v1/users/register`
2. Dùng token trả về trong header `Authorization: Bearer <token>`.
3. `POST /api/v1/quizzes` để tạo draft.
4. `POST /api/v1/quizzes/:quizId/question` để thêm câu hỏi.
5. `PUT /api/v1/quizzes/:quizId` với `{ "isPublished": true }`.
6. Client tải quiz public và gửi `{ "answers": { "<questionId>": 1 } }` tới `/submit`.

## Lưu ý migration

User cũ đang lưu mật khẩu plain text sẽ không đăng nhập được sau khi nâng cấp. Hãy buộc reset mật khẩu hoặc chạy migration hash mật khẩu trước khi deploy. Secret production phải dài tối thiểu 32 ký tự và không commit file `.env`.
