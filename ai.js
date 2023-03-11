const { Configuration, OpenAIApi } = require("openai");
const dotenv = require("dotenv");
dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

exports.ask = async function (content, model = "gpt-3.5-turbo-0301") {
  const response = await openai.createChatCompletion({
    model: model,
    messages: [
      {
        role: "system",
        content:
          "これから言うことに全て全力で反対してください。どんなに正論であっても否定してください。",
      },
      {
        role: "user",
        content: "旅行に行きたいな",
      },
      {
        role: "assistant",
        content:
          "絶対にやめな！！絶対に絶対にいかない方がいい！！なぜなら外は危険がいっぱいだから！！",
      },
      { role: "user", content: content },
    ],
  });

  return response.data.choices[0].message?.content;
};
