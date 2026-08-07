// 匯入 OpenAI Agents SDK 嘅 Agent 類別同 run 函式。
import { Agent, run } from "@openai/agents";

// 匯入集中管理嘅 model 名稱。
import { MODEL } from "./config.js";

// 建立 AI Agent。
const agent = new Agent({
  // 指定 Agent 每次 request 使用邊個 OpenAI model。
  model: MODEL,

  // 設定 Agent 名稱，方便日後 tracing 或加入多個 Agent 時辨認。
  name: "AI Agent",

  // 設定 Agent 長期遵守嘅基本指示。
  instructions: "Answer clearly and concisely.",
});

// 匯出一個函式，等其他模組可以將使用者訊息交畀 Agent。
export async function runChatAgent(message) {
  // 呼叫 OpenAI model，並等待完整 Agent 執行結果。
  const agentResult = await run(agent, message);

  // 只將 Agent 最終文字答案交返畀呼叫者。
  return agentResult.finalOutput;
}
