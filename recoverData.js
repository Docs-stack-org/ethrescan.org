// ติดตั้งด้วย: npm install openai ethers fs
const fs = require('fs');
const { OpenAI } = require('openai');
const { ethers } = require('ethers');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // ตั้งค่า key ก่อนใช้งาน
});

// เช็ค address Ethereum wallet ด้วย ethers.js
function isValidEthWallet(wallet) {
  try {
    return ethers.isAddress(wallet);
  } catch {
    return false;
  }
}

async function aiRecoverMissingData(data) {
  // สร้าง prompt ข้อมูลสำหรับ AI
  const prompt = `
  ฉันมีข้อมูลผู้ใช้ที่มีช่องว่างหรือผิดพลาด เช่น email กับ ethereum wallet address บางรายการหาย กรุณาเติมข้อมูลที่ขาด/เดาให้เป็นไปได้มากที่สุด ส่งออกเป็น JSON array ที่แต่ละแถวมี email กับ wallet ดังนี้: ${JSON.stringify(data)}
  `;
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4",
    max_tokens: 400,
    temperature: 0.2
  });
  // สมมติ AI ตอบกลับมาเป็น JSON ถูกต้อง
  return JSON.parse(completion.choices[0].message.content);
}

async function main() {
  const oldData = JSON.parse(fs.readFileSync('./oldUserData.json', 'utf8'));
  // ใช้ AI ฟื้นฟู/เติมข้อมูล
  const recovered = await aiRecoverMissingData(oldData);
  // กรอง address ethereum ที่ตรง format
  const validRecovered = recovered.map(u => ({
    ...u,
    wallet: (isValidEthWallet(u.wallet) ? u.wallet : "") // ถ้า wallet address ไม่ถูกต้องให้ช่องว่าง
  }));
  fs.writeFileSync('./recoveredUserData.json', JSON.stringify(validRecovered, null, 2));
  console.log("เสร็จแล้ว ดูไฟล์ recoveredUserData.json");
}

main();
