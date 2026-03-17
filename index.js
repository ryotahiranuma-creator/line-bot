const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const LINE_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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
s
