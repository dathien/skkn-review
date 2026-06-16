# SKKN Review Pro - Bản Netlify

Ứng dụng online phân tích sáng kiến kinh nghiệm bằng Gemini, triển khai được trên Netlify.

## Chức năng

- Upload file `.docx`
- Đọc văn bản trong Word
- Trích xuất hình ảnh trong `.docx`
- Cho phép dán ảnh bằng `Ctrl + V`
- Phân tích SKKN bằng Gemini qua Netlify Functions
- Xuất báo cáo `.docx`

## Chạy thử ở máy tính

```bash
npm install
npm run dev
```

Lưu ý: lệnh trên chỉ chạy giao diện. Để test API serverless giống Netlify, dùng:

```bash
npm install -g netlify-cli
netlify dev
```

Tạo file `.env` hoặc `.env.local`:

```env
GEMINI_API_KEY=API_KEY_CUA_THAY
GEMINI_MODEL=gemini-2.5-flash
```

## Deploy lên Netlify

1. Đưa project lên GitHub.
2. Vào Netlify → Add new site → Import from Git.
3. Chọn repository.
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
5. Vào Site configuration → Environment variables, thêm:

```env
GEMINI_API_KEY=API_KEY_CUA_THAY
GEMINI_MODEL=gemini-2.5-flash
```

6. Deploy lại site.

## Lưu ý

- API key nằm trên Netlify, giáo viên dùng website sẽ không thấy key.
- Nếu file Word có quá nhiều ảnh dung lượng lớn, hãy nén ảnh trước khi upload.
- Nếu lỗi quota, hãy đổi API key hoặc model.
- Endpoint AI của bản Netlify là: `/.netlify/functions/review`.
