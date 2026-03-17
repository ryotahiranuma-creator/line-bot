// index.js

const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// 環境変数から取得
const LINE_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// OpenAI で返信を作る関数
async function getReply(userMessage) {
  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini
