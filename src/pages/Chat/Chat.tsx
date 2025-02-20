import React, { useEffect, useState } from "react";
import Sidebar from "../../shared/ui/Sidebar/Sidebar.tsx";
import useUserStore from "../../entity/user/user.store";
import useMessageStore from "../../entity/message/message.store";
import axios from "axios";
import io from "socket.io-client";
import "./Chat.css";

const socket = io(`${import.meta.env.VITE_WS_URL}`);

const Chat = () => {
  const { user } = useUserStore();
  const { messages, addMessage, setMessages } = useMessageStore();
  const [message, setMessage] = useState<string>("");
  const [recipientId, setRecipientId] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [activeChats, setActiveChats] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Состояние загрузки
  const [isMobileView, setIsMobileView] = useState<boolean>(window.innerWidth <= 768);
  const [isChatVisible, setIsChatVisible] = useState<boolean>(false);
  const [isSidebarHidden, setIsSidebarHidden] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (user) {
      socket.emit("register", user.id);
      socket.on("private_message", (data) => {
        addMessage(data);
        if (data.from && data.from !== user.id && !activeChats.includes(data.from)) {
          setActiveChats((prevChats) => [...prevChats, data.from]);
        }
      });

      const fetchAndLoadMessages = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/messages/${user.id}`);
          setMessages(response.data);
        } catch (error) {
          console.error("Error fetching message history:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchAndLoadMessages();
      return () => {
        socket.off("private_message");
      };
    }
  }, [user]);

  useEffect(() => {
    if (user && !loading) {
      const newActiveChats = Array.from(
        new Set(
          messages
            .flatMap((msg) => [msg.from, msg.to])
            .filter((id) => id && id !== user.id)
        )
      );
      setActiveChats(newActiveChats);
    }
  }, [messages, user, loading]);

  useEffect(() => {
    if (selectedUser) {
      setIsChatVisible(true);
      setIsSidebarHidden(true);
    } else {
      setIsChatVisible(false);
      setIsSidebarHidden(false);
    }
  }, [selectedUser]);

  const handleSendMessage = () => {
    if (recipientId && message) {
      const timestamp = new Date().toISOString();
      socket.emit("private_message", { to: recipientId, message, timestamp, from: user?.id });
      addMessage({ from: user?.id || "me", to: recipientId, message, timestamp });
      if (!activeChats.includes(recipientId)) {
        setActiveChats((prevChats) => [...prevChats, recipientId]);
      }
      setMessage("");
    }
  };

  const handleSelectUser = (id: string) => {
    setSelectedUser(id);
    setRecipientId(id);
    fetchMessageHistory(user?.id || "");
  };

  const fetchMessageHistory = async (id: string) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/messages/${id}`);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching message history:", error);
    }
  };

  const handleBackClick = () => {
    setIsChatVisible(false);
    setTimeout(() => {
      setSelectedUser(null);
      setIsSidebarHidden(false);
    }, 500); // Задержка для завершения анимации
  };

  const filteredMessages = messages.filter(
    (msg) =>
      (msg.from === user?.id && msg.to === selectedUser) ||
      (msg.from === selectedUser && msg.to === user?.id)
  );

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="chat-container">
      {!selectedUser || !isMobileView ? (
        <Sidebar
          activeChats={activeChats}
          onSelectUser={handleSelectUser}
          className={isSidebarHidden ? 'sidebar-hidden' : ''}
        />
      ) : null}

      <div className="chat-content">
        {selectedUser && (
          <div className={`chat-box ${isChatVisible ? 'slide-in-right' : ''}`}>
            <div className="chat-header">
              {isMobileView && (
                <button className="back-button" onClick={handleBackClick}>
                  ← Назад
                </button>
              )}
              <span>{selectedUser}</span>
            </div>
            <div className="chat-messages">
              {filteredMessages.map((msg, index) => (
                <div key={index} className={msg.from === user?.id ? "message message-sent" : "message message-received"}>
                  <span>{msg.message}</span>
                  <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
            <div className="chat-input">
              <input
                type="text"
                placeholder="Сообщение..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button onClick={handleSendMessage}>Отправить</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;