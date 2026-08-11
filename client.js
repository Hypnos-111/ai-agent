// 匯入 Node.js 內置嘅 Promise 版本 readline，用嚟等待 Terminal 輸入。
import readline from "node:readline/promises";

// 匯入 server 基本網址、port 同 Terminal 顯示嘅使用者名稱。
import { PORT, BASE_URL, MODEL, USERNAME } from "./src/config.js";

// 將基本網址同 port 組合成 Terminal client 發送 request 嘅完整網址。
const URL = `${BASE_URL}${PORT}`;

// 建立 Terminal 輸入及輸出介面。
const terminal = readline.createInterface({
  // 從目前 Terminal 接收鍵盤輸入。
  input: process.stdin,
  // 將提示文字及輸出顯示喺目前 Terminal。
  output: process.stdout,
});

// 保存 server 回傳嘅 sessionId，等之後嘅訊息可以延續同一段對話。
let sessionId;

while (true) {
  // 顯示使用者名稱，並等待使用者輸入一段文字。
  const message = await terminal.question(`${USERNAME}: `);

  // 使用者輸入 exit 時停止聊天循環。
  if (message === "exit") {
    break;
  }

  // 將使用者訊息同目前 sessionId 包裝成 server 要求嘅 request body。
  const requestBody = {
    message,
    sessionId,
  };

  // 將 request body 轉成 JSON，並發送到聊天 server。
  const response = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  // 解析 server 回傳嘅 JSON。
  const responseData = await response.json();

  console.log(`${MODEL}: ${responseData.reply}`);

  // 保存 server 回傳嘅 sessionId，供下一次 request 接續對話。
  sessionId = responseData.sessionId;
}

// 關閉 Terminal 輸入介面，令 client 正常結束。
terminal.close();