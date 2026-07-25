const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

export async function callDeepSeek(systemPrompt: string, userContent: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY is not set in the environment.");

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "deepseek-v4-flash",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userContent }],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) throw new Error(`DeepSeek API error (${response.status}): ${await response.text()}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

export function parseModelJson<T>(raw: string): T {
  const cleaned = raw.replace(/```json\s*|```\s*/g, "").trim();
  return JSON.parse(cleaned) as T;
}