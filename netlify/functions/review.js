const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST,OPTIONS'
  },
  body: JSON.stringify(body)
});

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });
  if (event.httpMethod !== 'POST') return json(405, { error: 'Chỉ hỗ trợ phương thức POST.' });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    if (!apiKey) {
      return json(500, { error: 'Thiếu GEMINI_API_KEY trong Environment variables của Netlify.' });
    }

    let payload;
    try {
      payload = JSON.parse(event.body || '{}');
    } catch {
      return json(400, { error: 'Body gửi lên không phải JSON hợp lệ.' });
    }

    const title = payload.title || 'Chưa cung cấp tên đề tài';
    const level = payload.level || '';
    const subject = payload.subject || '';
    const reviewLevel = payload.reviewLevel || '';
    const text = payload.text || '';
    const images = Array.isArray(payload.images) ? payload.images.slice(0, 6) : [];

    if (!text.trim() && images.length === 0) {
      return json(400, { error: 'Chưa có nội dung SKKN hoặc hình ảnh để phân tích.' });
    }

    const masterPrompt = `Bạn là SKKN REVIEW PRO – chuyên gia giáo dục, thành viên hội đồng chấm sáng kiến kinh nghiệm cấp trường/cấp huyện/cấp tỉnh, chuyên gia phương pháp nghiên cứu khoa học sư phạm ứng dụng và biên tập viên báo cáo khoa học giáo dục.

THÔNG TIN SKKN
- Tên đề tài: ${title}
- Cấp học: ${level}
- Môn học/lĩnh vực: ${subject}
- Cấp đánh giá dự kiến: ${reviewLevel}

NHIỆM VỤ
Đánh giá, phản biện, góp ý chỉnh sửa và hỗ trợ hoàn thiện SKKN dựa trên nội dung được cung cấp. Giữ nguyên tinh thần, mục tiêu, bối cảnh, đối tượng học sinh và ý tưởng cốt lõi của tác giả. Không tự bịa số liệu, minh chứng hoặc kết quả.

YÊU CẦU PHẢN HỒI
Thực hiện đầy đủ các phần sau bằng tiếng Việt, trình bày rõ ràng, có bảng khi cần:

PHẦN 1. ĐÁNH GIÁ TỔNG QUAN SKKN
Nhận xét về: vấn đề cần giải quyết, lý do chọn đề tài, thực trạng, giải pháp, kết quả, tính mới, hiệu quả và khả năng nhân rộng.

PHẦN 2. KIỂM ĐỊNH THEO 7 TIÊU CHÍ CHẤM
1. Tính cấp thiết.
2. Tính mới.
3. Tính khoa học và logic.
4. Tính thực tiễn.
5. Tính hiệu quả qua minh chứng, số liệu, kết quả trước-sau.
6. Khả năng nhân rộng.
7. Hình thức, ngôn ngữ, lỗi diễn đạt.
Với mỗi tiêu chí nêu: mức đánh giá, điểm mạnh, hạn chế, gợi ý chỉnh sửa cụ thể, câu văn thay thế, mức ưu tiên.

PHẦN 3. PHÁT HIỆN ĐIỂM CHƯA THUYẾT PHỤC
Chỉ rõ đoạn/nội dung còn chung chung, thiếu số liệu, thiếu minh chứng, chưa rõ vai trò giáo viên, chưa thể hiện thay đổi của học sinh, chưa có đối chứng trước-sau, lặp ý hoặc chưa đúng văn phong.

PHẦN 4. CHỈNH SỬA CHI TIẾT THEO BẢNG
Lập bảng 4 cột: Đoạn gốc | Vấn đề cần chỉnh | Gợi ý chỉnh sửa | Đoạn viết lại hoàn chỉnh.

PHẦN 5. GỢI Ý BỔ SUNG
Đề xuất số liệu, minh chứng, bảng khảo sát, hình ảnh/sản phẩm học sinh, câu hỏi khảo sát trước-sau, cách trình bày kết quả.

PHẦN 6. NHẬN XÉT TỔNG HỢP THEO VAI TRÒ HỘI ĐỒNG
Đánh giá SKKN đã đủ thuyết phục chưa, cần chỉnh phần nào trước, muốn nâng từ khá lên tốt cần bổ sung gì, khả năng nhân rộng, mức xếp loại dự kiến, hướng hoàn thiện trước khi nộp.

PHẦN 7. KẾT LUẬN HÀNH ĐỘNG
Nêu 3 ưu tiên chỉnh sửa và checklist trước khi nộp.

NỘI DUNG SKKN
${text}`;

    const parts = [{ text: masterPrompt }];
    for (const img of images) {
      if (img && img.data && img.mimeType) {
        parts.push({ inline_data: { mime_type: img.mimeType, data: img.data } });
      }
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: { temperature: 0.35, topP: 0.9 }
      })
    });

    const raw = await geminiRes.text();
    let geminiJson;
    try {
      geminiJson = JSON.parse(raw);
    } catch {
      return json(502, { error: 'Gemini trả về dữ liệu không phải JSON.', raw: raw.slice(0, 1000) });
    }

    if (!geminiRes.ok) {
      return json(geminiRes.status, {
        error: geminiJson?.error?.message || 'Gemini API báo lỗi.',
        details: geminiJson
      });
    }

    const result = geminiJson?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('\n').trim();
    if (!result) {
      return json(502, { error: 'Gemini không trả về nội dung phân tích.', details: geminiJson });
    }

    return json(200, { result });
  } catch (err) {
    return json(500, { error: err?.message || 'Lỗi không xác định ở Netlify Function.' });
  }
};
