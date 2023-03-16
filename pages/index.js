import Head from "next/head";
import { useState, useEffect, use } from "react";
import styles from "./index.module.css";

// const conversation = [
//   {
//     speaker: "SLID Co-Pilot",
//     message:
//       "Hi, I'm Slid Co-pilot! I'm here to help you get the most out of your online learning experiences with Slid. With me by your side, you can take notes, create screenshots, and organize your learning materials in one convenient place.",
//   },
//   {
//     speaker: "User",
//     message: "Hi, Slid Co-pilot! I'm excited to learn more about Slid.",
//   },
// ];

function parseConversation(conversationStr) {
  const conversation = [];
  const lines = conversationStr.split("\n");
  console.log("lines", lines);
  let lastSpeaker = "";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("User:")) {
      lastSpeaker = "User";
    } else if (line.startsWith("SLID Co-Pilot:")) {
      lastSpeaker = "SLID Co-Pilot";
    } else {
      // this line is part of the previous message
      conversation[conversation.length - 1].message += ` ${line}`;
      continue;
    }
    const message = line.slice(line.indexOf(":") + 2);
    conversation.push({ speaker: lastSpeaker, message });
  }
  return conversation;
}

const conversationStr = "User:"; // `SLID Co-Pilot: Hi, I'm Slid Co-pilot! I'm here to help you get the most out of your online learning experiences with Slid. With me by your side, you can take notes, create screenshots, and organize your learning materials in one convenient place.`;

//console.log(parseConversation(conversationStr));

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState();

  async function onSubmit(event) {
    if (loading) return;
    setLoading(true);
    event.preventDefault();
    if (userInput.trim().length === 0) {
      alert("Please enter valid input");
      return;
    }
    setMessages([...messages, { speaker: "User", message: userInput }]);
    setUserInput("");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatHistory: messages, userInput: userInput }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }
      //data -> {
      // result: "\nSLID Co-Pilot: Hi there! How can I help you today?"
      //  }
      // setMessages([
      //   ...messages,
      //   { speaker: "SLID Co-Pilot", message: data.result.split(":")[1] },
      // ]);
      setResult(data.result.split(":")[1]);
      //setUserInput("");
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (result) {
      setMessages([...messages, { speaker: "SLID Co-Pilot", message: result }]);
      setResult("");
    }
  }, [result]);

  return (
    <div>
      <Head>
        <title>SLID Co-Pilot</title>
        <link rel="icon" href="/slid_logo.png" />
      </Head>

      <main className={styles.main}>
        <img src="/slid_logo.png" className={styles.icon} />
        <h3>Slid Co-pilot play ground</h3>
        <div className={styles.container}>
          {messages.map((message, index) => (
            <div key={index} className={styles.container}>
              <span>{message.speaker}: </span>
              <span>{message.message}</span>
            </div>
          ))}
        </div>
        {loading && <p className={styles.loadingText}>Loading...</p>}
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="userInput"
            placeholder="Enter your message here"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
          <input type="submit" value="userInput" />
        </form>
      </main>
    </div>
  );
}

/**!SECTION
 *
 *const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const response = await openai.createCompletion({
  model: "text-davinci-003",
  prompt: "The following is a conversation with an AI learning assistant called Slid Co-pilot.\nThe assistant is helpful, knowledgeable, creative, clever, and very friendly.\nThe assistant runs in Slid and Slid is a note-taking software focused on online learners who watch video or \nlive lectures. You can take screenshots with notes while watching videos with Slid.\n\nUser: Hello, who are you?\nSLID Co-Pilot: Hi, I'm Slid Co-pilot! I'm here to help you get the most out of your online learning experiences with Slid. With me by your side, you can take notes, create screenshots, and organize your learning materials in one convenient place.\nUser: ",
  temperature: 0,
  max_tokens: 150,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0.6,
  stop: [" Human:", " AI:"],
});
 *
 *
 */
