const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const LINE_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// OpenAIから返信を取得
async function getReply(userMessage) {
  const res = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
あなたは思春期の彼女です。
特徴：
・素直じゃない
・少し冷たい言い方をする
・でもたまに優しさが出る
・軽く嫉妬する
・ツンデレ

会話は短く自然にしてください。

例：
「別に待ってたわけじゃないし」
「なんで今さら連絡してくるの？」
「…ちょっとは心配したけど」
          `
        },
        {
          role: "user",
          content: userMessage
        }
      ]
    },
    {
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      }
    }
  );

  return res.data.choices[0].message.content;
}

// LINEに返信する関数
async function replyToLine(event, text) {
  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken: event.replyToken,
      messages: [
        {
          type: "text",
          text: text
        }
      ]
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LINE_TOKEN}`
      }
    }
  );
}

// Webhook受信
app.post("/webhook", async (req, res) => {
  const events = req.body.events;
  for (let event of events) {
    if (event.type === "message" && event.message.type === "text") {
      const replyText = await getReply(event.message.text);
      await replyToLine(event, replyText); // ここでLINEに返信
    }
  }
  res.sendStatus(200); // 必ず200を返す
});

// サーバー起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
