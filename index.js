// index.js

const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// 環境変数から取得
const LINE_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// LINEに返信する関数
async function replyToLine(event, replyText) {
  try {
    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken: event.replyToken,
        messages: [
          {
            type: "text",
            text: replyText
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
    console.log("Reply:", replyText);
  } catch (error) {
    console.error("LINE reply error:", error.response?.data || error.message);
  }
}

// OpenAIで返信を作る関数
async function getReply(userMessage) {
  try {
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
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    return res.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenAI error:", error.response?.data || error.message);
    return "ごめん、今ちょっと返せない…";
  }
}

// Webhookエンドポイント
app.post("/webhook", async (req, res) => {
  try {
    const events = req.body.events;

    for (let event of events) {
      if (event.type === "message" && event.message.type === "text") {
        const replyText = await getReply(event.message.text);
        await replyToLine(event, replyText);
      }
    }

    res.sendStatus(200); // 必ず返す
  } catch (error) {
    console.error("Webhook error:", error);
    res.sendStatus(200); // エラーでもLINEに返す
  }
});

// サーバー起動
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
