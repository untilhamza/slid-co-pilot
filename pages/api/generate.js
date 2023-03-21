import { Configuration, OpenAIApi } from "openai";
import NextCors from "nextjs-cors";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  // Run the cors middleware
  // nextjs-cors uses the cors package, so we invite you to check the documentation https://github.com/expressjs/cors
  await NextCors(req, res, {
    // Options
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: "*",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message:
          "OpenAI API key not configured, please follow instructions in README.md",
      },
    });
    return;
  }

  const userInput = req.body.userInput || "";
  if (userInput.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter valid input",
      },
    });
    return;
  }

  const previousMessages = req.body.chatHistory || [];

  //chatHistory = [{speaker: "User", message: "Hello"}, {speaker: "SLID GPT", message: "Hi there! How can I help you today?"}]

  //chat history to be used as prompt extension
  function chatHistoryToPromptExtension(chatHistory) {
    let promptExtension = "";
    chatHistory.forEach((message) => {
      promptExtension += `${message.speaker}: ${message.message}
    `;
    });
    return promptExtension;
  }

  const promptExtension = chatHistoryToPromptExtension(previousMessages);

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(userInput, promptExtension),
      temperature: 0,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
      stop: [" SLID GPT:", " User: "],
    });
    res.status(200).json({ result: completion.data.choices[0].text });
  } catch (error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
}

function generatePrompt(userInput, promptExtension) {
  const formattedUserInput =
    userInput[0].toUpperCase() + userInput.slice(1).toLowerCase();

  return `The following is a conversation with an AI learning assistant called Slid GPT.\nThe assistant is helpful, knowledgeable, creative, clever, and very friendly.\nThe assistant runs in Slid and Slid is a note-taking software focused on online learners who watch video or \nlive lectures. You can take screenshots with notes while watching videos with Slid.\nUser: Hello, who are you?\nSLID GPT: Hi, I'm Slid GPT! I'm here to help you get the most out of your online learning experiences with Slid. With me by your side, you can take notes, create screenshots, and organize your learning materials in one convenient place. ${promptExtension} \nUser: ${formattedUserInput}}.\nSLID GPT:`;
}
