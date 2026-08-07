// 匯入 Zod，用嚟驗證 client 傳入嘅 JSON 資料格式。
import { z } from "zod";

// 匯入專門執行 AI Agent 嘅函式。
import { runChatAgent } from "./agent.js";

// 匯入讀取 request body 同回傳 JSON 嘅 HTTP 工具。
import { readJsonBody, sendJson } from "./http.js";

// 定義 POST /chat request body 必須符合嘅資料格式。
const chatRequestSchema = z.object({
  // message 必須係最少包含一個字元嘅字串。
  message: z.string().min(1),
});

// 匯出處理 POST /chat request 嘅主要函式。
export async function handleChat(request, response) {
  // 先宣告一個變數，準備儲存解析後嘅 JSON。
  let json;

  // 嘗試讀取及解析 client 傳入嘅 JSON request body。
  try {
    // 等待完整 request body，然後將結果存入 json。
    json = await readJsonBody(request);
  } catch {
    // JSON 語法錯誤時回傳 HTTP 400。
    sendJson(response, 400, {
      // 清楚通知 client request body 必須係有效 JSON。
      error: "Request body must be valid JSON",
    });

    // 錯誤 response 已經完成，所以停止執行函式。
    return;
  }

  // 使用 Zod 安全驗證解析後嘅 JSON，而且唔會因驗證失敗而 throw error。
  const result = chatRequestSchema.safeParse(json);

  // 驗證失敗代表 message 唔存在、唔係字串或者係空字串。
  if (!result.success) {
    // 資料格式錯誤時回傳 HTTP 400。
    sendJson(response, 400, {
      // 通知 client message 欄位嘅正確要求。
      error: "message must be a non-empty string",
    });

    // 錯誤 response 已經完成，所以停止執行函式。
    return;
  }

  // 嘗試將已驗證嘅 message 交畀 AI Agent。
  try {
    // 等待 Agent 完成，並取得最終文字答案。
    const reply = await runChatAgent(result.data.message);

    // Agent 成功時回傳 HTTP 200。
    sendJson(response, 200, {
      // 將 Agent 答案放入 reply 欄位。
      reply,
    });
  } catch (error) {
    // 將完整錯誤寫入 server terminal，方便開發者除錯。
    console.error("Agent run failed:", error);

    // 其他未預計嘅 Agent 錯誤統一回傳 HTTP 500。
    sendJson(response, 500, {
      // 對 client 隱藏內部技術細節，只提供安全嘅通用訊息。
      error: "Agent failed to produce a response",
    });
  }
}
