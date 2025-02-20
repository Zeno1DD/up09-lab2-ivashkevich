import React, { useEffect, useState } from "react";
import { create } from "zustand";
import axios from "axios";
import io from "socket.io-client";

// Define the interface for the Zustand store
interface User {
  id: string;
}

interface StoreState {
  user: User | null;
  setUser: (user: User) => void;
}

// Zustand store for user state
const useStore = create<StoreState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

const socket = io(import.meta.env.VITE_WS_URL);
const VITE_API = import.meta.env.VITE_API_URL;

const App: React.FC = () => {
  const { user, setUser } = useStore();
  const [message, setMessage] = useState<string>("");
  const [recipientId, setRecipientId] = useState<string>("");
  const [messages, setMessages] = useState<Array<{ from: string; message: string }>>([]);

  useEffect(() => {
    if (user) {
      socket.emit("register", user.id);
      fetchMessageHistory(user.id);
    }

    socket.on("private_message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      socket.off("private_message");
    };
  }, [user]);

  const fetchMessageHistory = async (id: string) => {
    try {
      const response = await axios.get(`${VITE_API}/messages/${id}`);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching message history:", error);
    }
    
  };

  const handleLogin = async (id: string) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/login`, { id });
      setUser(response.data);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleSendMessage = () => {
    if (recipientId && message) {
      socket.emit("private_message", { to: recipientId, message });
      setMessages((prevMessages) => [...prevMessages, { from: "me", message }]);
      setMessage("");
    }
  };

  return (
    <div>
      {!user ? (
        <div>
          <input
            type="text"
            placeholder="Enter your ID"
            onBlur={(e) => handleLogin(e.target.value)}
          />
        </div>
      ) : (
        <div>
          <div>
            <input
              type="text"
              placeholder="Recipient ID"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
            />
            <input
              type="text"
              placeholder="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
          <div>
            <h2>Messages</h2>
            <ul>
              {messages.map((msg, index) => (
                <li key={index}>
                  {msg.from}: {msg.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
