# SKKN REVIEW PRO - Netlify Client Gemini Fix

Bản này sửa lỗi Inactivity Timeout bằng cách gọi Gemini trực tiếp từ trình duyệt, không dùng Netlify Function khi phân tích.

## Cách dùng
1. Deploy lên Netlify như website tĩnh.
2. Mở app, nhập Gemini API Key vào ô trên giao diện.
3. Upload file .docx và bấm Phân tích SKKN.

Lưu ý: API key được lưu trong localStorage của trình duyệt người dùng. Nếu dùng chung cho nhiều giáo viên, nên dùng tài khoản/API riêng hoặc chuyển sang Vercel/Railway backend.
