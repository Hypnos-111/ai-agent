// 匯入由 OpenAI Conversations API 保存歷史嘅 Session。
import { OpenAIConversationsSession } from "@openai/agents";

// 建立新對話，或者按 sessionId 接續之前嘅對話。
export function createConversationSession(sessionId) {
  // 如果 client 傳入 sessionId，就接續現有對話。
  if (sessionId) {
    // conversationId 係 SDK 內部使用嘅名稱。
    return new OpenAIConversationsSession({
      // 將我哋嘅 sessionId 當成 OpenAI conversationId 使用。
      conversationId: sessionId,
    });
  }

  // 冇 sessionId 代表使用者想開始一段新對話。
  return new OpenAIConversationsSession();
}