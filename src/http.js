// 匯出統一產生 JSON response 嘅工具函式。
export function sendJson(response, statusCode, data) {
  // 設定 HTTP status code 同 response header。
  response.writeHead(statusCode, {
    // 通知 client response body 係 UTF-8 JSON。
    "Content-Type": "application/json; charset=utf-8",
  });

  // 將 JavaScript data 轉成 JSON 字串，然後結束 response。
  response.end(JSON.stringify(data));
}

// 匯出讀取及解析 JSON request body 嘅工具函式。
export async function readJsonBody(request) {
  // 將收到嘅 request body chunks 轉成 UTF-8 字串。
  request.setEncoding("utf8");

  // 建立空字串，用嚟逐步儲存完整 request body。
  let body = "";

  // 逐個讀取 client 傳入嘅 request body chunk。
  for await (const chunk of request) {
    // 將目前 chunk 加到完整 request body 後面。
    body += chunk;
  }

  // 將完整 JSON 字串解析成 JavaScript value 並回傳。
  return JSON.parse(body);
}
