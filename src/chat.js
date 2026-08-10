// 匯入 Zod，用嚟驗證 client 傳入嘅 JSON 資料格式。
import { z } from "zod";

// 匯入專門執行 AI Agent 嘅函式。
import { runChatAgent } from "./agent.js";

// 匯入建立新 Session 或接續舊 Session 嘅函式。
import { createConversationSession } from "./session.js";

// 匯入讀取 request body 同回傳 JSON 嘅 HTTP 工具。
import { readJsonBody, sendJson } from "./http.js";


// 定義 POST /chat request body 必須符合嘅資料格式。
const chatRequestSchema = z.object({
  // message 必須係最少包含一個字元嘅字串。
  message: z.string().min(1),

  // sessionId 可以不提供；如果提供，就必須係非空字串。
  sessionId: z.string().min(1).optional(),
});

// 匯出處理 POST /chat request 嘅主要函式。
// 整體流程係：讀取 JSON、驗證資料、建立或接續 Session、執行 Agent，最後回傳答案同 sessionId。
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

  // 執行到呢度只代表 request body 係有效 JSON，未代表內容符合 /chat 要求。
  // 使用 Zod 驗證 message 同 optional sessionId，而且唔會因驗證失敗而 throw error。
  const result = chatRequestSchema.safeParse(json);

  // 驗證失敗代表 message 或 sessionId 至少有一項唔符合上面定義嘅 schema。
  if (!result.success) {
    // 資料格式錯誤時回傳 HTTP 400。
    sendJson(response, 400, {
      // 通知 client message 欄位嘅正確要求。
      error: "message must be a non-empty string",
    });

    // 錯誤 response 已經完成，所以停止執行函式。
    return;
  }

  // 資料格式已經確認正確，以下流程先會接觸 Session 同 OpenAI Agent。
  // 將 Session、Agent 執行同 sessionId 讀取放喺同一個 try，任何一步失敗都會進入下面嘅 catch。
  try {
    // 冇 sessionId 代表開始新對話；有 sessionId 就重新連接 OpenAI 已保存嘅舊對話。
    const session = createConversationSession(result.data.sessionId);

    // 將使用者訊息同 Session 一齊交畀 Agent，並等待最終答案。
    // Agents SDK 會先載入舊對話，再保存今次嘅使用者訊息同 Agent 答案。
    const reply = await runChatAgent(result.data.message, session);

    // Agent 執行完成後，新對話亦已經取得持久 ID，所以而家可以安全讀取 sessionId。
    const sessionId = await session.getSessionId();

    // 將答案同 sessionId 一齊回傳；client 下次必須傳回同一個 sessionId 先可以延續對話。
    sendJson(response, 200, {
      // 將 Agent 答案放入 reply 欄位。
      reply,
      // 將 sessionId 交畀 client，等下一次 request 可以接續同一段對話。
      sessionId,
    });
  } catch (error) {
    // Session、OpenAI Agent 或 sessionId 讀取失敗時，將完整錯誤寫入 server terminal 方便除錯。
    console.error("Agent run failed:", error);

    // 其他未預計嘅 Agent 錯誤統一回傳 HTTP 500。
    sendJson(response, 500, {
      // 對 client 隱藏內部技術細節，只提供安全嘅通用訊息。
      error: "Agent failed to produce a response",
    });
  }
}
