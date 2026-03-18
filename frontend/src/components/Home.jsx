import axios from "axios";
import { useState } from "react";

const BASE_URL = "http://localhost:5000";

function Home() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  const sendData = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/api/message`, {
        text: input,
      });
      setResponse(res.data.message);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <h1>Home</h1>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type text"
      />
      <button onClick={sendData}>Send</button>
      <p>{response}</p>
    </div>
  );
}

export default Home;
