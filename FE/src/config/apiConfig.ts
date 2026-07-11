// ==========================================
// ⚠️ LƯU Ý QUAN TRỌNG VỀ ĐƯỜNG DẪN API ⚠️
// ==========================================
// VITE_API_BASE_URL sẽ được tự động load từ các file .env tương ứng:
// - Môi trường Dev (chạy 'npm run dev'): tự lấy từ .env.development (thường là localhost)
// - Môi trường Prod (build hoặc chạy trên server): tự lấy từ .env.production (thường là Azure)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5096";
