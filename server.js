// 匯入 Node.js 內置嘅 HTTP 模組，用嚟建立 web server。
import http from "node:http";

// 匯入集中管理嘅 server port 同 AI model 名稱。
import { MODEL, PORT } from "./src/config.js";

// 匯入專門處理 POST /chat request 嘅函式。
import { handleChat } from "./src/chat.js";

// 匯入統一回傳 JSON response 嘅工具函式。
import { sendJson } from "./src/http.js";

// 建立 HTTP server，並為每個 request 執行以下 async callback。
const server = http.createServer(async (request, response) => {
  // 檢查 request 係咪 POST /chat。
  if (request.method === "POST" && request.url === "/") {
    // 將 chat request 交畀 chat 模組處理。
    await handleChat(request, response);
    return;
  }

  // 任何未定義嘅 route 都回傳 HTTP 404。
  sendJson(response, 404, {
    // 提供簡單而唔會洩漏 server 資料嘅錯誤訊息。
    error: "Not found",
  });
});

// 開始監聽 config.js 指定嘅 port。
server.listen(PORT, () => {
  // 通知開發者 server 已經成功啟動。
  console.log(`Server running at http://localhost:${PORT}`);

  // 顯示目前 Agent 實際使用緊嘅 model。
  console.log(`Model: ${MODEL}`);
});
