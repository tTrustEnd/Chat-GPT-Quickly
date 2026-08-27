# Chat-GPT-Quickly

Extension Chrome/Edge hien thi khung chat noi tren moi trang web.

Ma nguon duoc tach thanh `content.js` (bootstrap), `chat-widget.js` (logic widget) va `chat-widget.css` (giao dien). Icon dung file `extension_icon.png`.

## Ket noi Gemini that

Extension goi truc tiep Gemini API (`generateContent`) voi model `gemini-3.6-flash` thong qua `background.js`, khong can localhost.

1. Tao Gemini API key tai https://aistudio.google.com/apikey (khong dung OAuth token hoac key Vertex AI).
2. Mo extension tren mot trang web va gui tin nhan dau tien.
3. Nhap API key khi extension yeu cau. Key duoc luu trong `chrome.storage.local` tren may nay.
4. Reload extension sau khi cap nhat code.

API key co quyen truy cap Gemini, khong chia se key va khong commit key vao repository.

## Cai dat local

1. Mo `chrome://extensions` (hoac `edge://extensions`).
2. Bat **Developer mode**.
3. Chon **Load unpacked** va chon thu muc nay.

Nut chat nam co dinh cach phai 30px, cach duoi 30px. Khung chat co kich thuoc 420x600px tren man hinh desktop va tu thu gon tren mobile.