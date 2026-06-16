# SKKN REVIEW PRO - Netlify Static

Bản này không dùng Vite/React, không cần npm install khi deploy Netlify. Ứng dụng chạy bằng HTML/JS thuần + Netlify Functions.

## Deploy Netlify

1. Upload toàn bộ thư mục này lên GitHub repo.
2. Netlify tự đọc `netlify.toml`.
3. Build command: `echo 'Static build - no npm install needed'`
4. Publish directory: `.`
5. Functions directory: `netlify/functions`

## Environment variables cần thêm

- `GEMINI_API_KEY`: API key từ Google AI Studio
- `GEMINI_MODEL`: `gemini-2.5-flash`

## Tính năng

- Upload `.docx`
- Đọc văn bản trong `.docx`
- Trích xuất tối đa 6 ảnh trong `.docx`
- Dán ảnh bằng Ctrl+V
- Gửi văn bản + ảnh sang Gemini qua Netlify Function
- Xuất báo cáo `.docx` và `.txt`
