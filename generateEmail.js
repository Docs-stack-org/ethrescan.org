// npm install openai fs
const fs = require('fs');
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function aiFillEmail(data) {
  const prompt = `
  จากข้อมูลผู้ใช้ที่มีช่อง email ว่างเปล่า กรุณาเดาและสร้าง email ที่สมเหตุสมผลให้แต่ละ user โดยอาจดูจากชื่อ, wallet address หรือสร้างแบบทั่วไปก็ได้ เช่น user123@example.com ส่งออกเป็น JSON array ที่แต่ละแถวมี email กับ wallet:
  ${JSON.stringify(data)}
  `;
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4",
    max_tokens: 400,
    temperature: 0.2
  });
  return JSON.parse(completion.choices[0].message.content);
}

async function main() {
  const userData = JSON.parse(fs.readFileSync('./oldUserData.json', 'utf8'));
  const filled = await aiFillEmail(userData);
  fs.writeFileSync('./filledUserData.json', JSON.stringify(filled, null, 2));
  console.log("สร้าง email ให้อัตโนมัติสำเร็จ ดูผลได้ที่ filledUserData.json");
}

main();
