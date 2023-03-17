import Head from "next/head";
import { useState, useEffect, use } from "react";
import styles from "./index.module.css";

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

      setResult(data.result);
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
      setMessages([
        ...messages,
        {
          speaker: "SLID Co-Pilot",
          message: result,
        },
      ]);
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
              <pre>{message.message.trim()}</pre>
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
