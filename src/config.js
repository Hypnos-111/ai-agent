// 設定本機 HTTP server 嘅基本網址；實際 port 會由 client 另外組合。
export const BASE_URL = `http://localhost:`;

// 集中設定 HTTP server 使用嘅 port，方便日後只改一個地方。
export const PORT = 3000;

// 集中設定 Agent 使用嘅 OpenAI model，避免程式內出現多個不同 model 名稱。
export const MODEL = "gpt-5-nano";

// 設定 Terminal 顯示嘅使用者名稱。
export const USERNAME = "Hypnos";
