import { useEffect, useState } from "react";
import useUserStore from "../../../entity/user/user.store";
import useMessageStore, { Message } from "../../../entity/message/message.store";
import "./Sidebar.css";

const Sidebar = ({ activeChats, onSelectUser, selectedUser }: { activeChats: string[]; onSelectUser: (id: string) => void, selectedUser: string | null }) => {
    const [activeTab, setActiveTab] = useState<"chats" | "users">("chats");
    const { user, users } = useUserStore();
    const { messages } = useMessageStore();

    const formatTimestamp = (timestamp: string): string => {
        const now = new Date();
        const messageDate = new Date(timestamp);

        if (now.toDateString() === messageDate.toDateString()) {
            return messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } else if (
            new Date(now.setDate(now.getDate() - 1)).toDateString() ===
            messageDate.toDateString()
        ) {
            return "Вчера";
        } else {
            return messageDate.toLocaleDateString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        }
    };

    const getLastMessage = (userId: string): Message | null => {
        const filteredMessages = messages.filter(
            (msg) =>
                (msg.from === user?.id && msg.to === userId) ||
                (msg.from === userId && msg.to === user?.id)
        );
        return filteredMessages.length > 0 ? filteredMessages[filteredMessages.length - 1] : null;
    };

    return (
        <div className="sidebar">
            <div className="tabs">
                <button
                    className={activeTab === "chats" ? "active" : ""}
                    onClick={() => setActiveTab("chats")}
                >
                    Чаты
                </button>
                <button
                    className={activeTab === "users" ? "active" : ""}
                    onClick={() => setActiveTab("users")}
                >
                    Пользователи
                </button>
            </div>

            <div className="content">
                {activeTab === "chats" ? (
                    <div className="chat-list">
                        {activeChats.map((userId) => {
                            const lastMessage = getLastMessage(userId || "");
                            return (
                                <div
                                    key={userId}
                                    className={`chat-item ${selectedUser === userId ? "active-chat" : ""}`}
                                    onClick={() => onSelectUser(userId || "")}
                                >
                                    <div className="chat-info">
                                        <div className="user-name">{userId}</div>
                                        <div className="last-message">
                                            {lastMessage?.message || "Нет сообщений"}
                                        </div>
                                    </div>
                                    <div className="timestamp">
                                        {lastMessage ? formatTimestamp(lastMessage.timestamp) : ""}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="user-list">
                        <h2 className="user-list-header">Пользователи</h2>
                        {users.map((userItem) => (
                            <div
                                key={userItem.id}
                                className="user-item"
                                onClick={() => onSelectUser(userItem.id)}
                            >
                                <div className="user-info">
                                    <div className="user-name">{userItem.id}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="logout-container">
                <button className="logout-button" onClick={() => console.log("Logout")}>
                    Выйти
                </button>
            </div>
        </div>
    );
};

export default Sidebar;