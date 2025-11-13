// npm install openai fs
const fs = require('fs');
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function aiRecoverMissingData(data) {
  const prompt = `Please help recover missing email and crypto wallet data for these records: ${JSON.stringify(data)}. Fill missing or corrupted fields with best guess.`;
  const completion = await openai.chat.completions.create({
    messages: [{role: "user", content: prompt}],
    model: "gpt-4", // ใช้ GPT-4 หรือ 3.5 ก็ได้
    max_tokens: 400,
  });
  // สมมติ model ตอบเป็น JSON
  return JSON.parse(completion.choices[0].message.content);
}

async function main() {
  const oldData = JSON.parse(fs.readFileSync('./oldUserData.json', 'utf8'));
  const recovered = await aiRecoverMissingData(oldData);
  fs.writeFileSync('./recoveredUserData.json', JSON.stringify(recovered, null, 2));
  console.log("Done, see recoveredUserData.json");
}

main();
