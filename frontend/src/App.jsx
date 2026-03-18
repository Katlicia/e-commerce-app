import { useState } from "react";
import "./App.css";
import axios from "axios";
import { useEffect } from "react";
import Home from "./components/Home.jsx";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/message");
        setMessage(response.data.message);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessage();
  }, []);

  console.log(message);

  return (
    <div>
      <h1>App</h1>
      <p>{message}</p>
      <Home />
    </div>
  );
}

export default App;
