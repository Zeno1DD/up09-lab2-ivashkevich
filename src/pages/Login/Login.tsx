import React, { useState } from "react";
import axios from "axios";
import useUserStore from "../../entity/user/user.store";
import { useNavigate } from "react-router-dom";
import { URLs } from "../../app/router/router.scheme";

const Login: React.FC = () => {
  const { setUser } = useUserStore();
  const [userId, setUserId] = useState<string>("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // Авторизация пользователя
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/login`, { id: userId });
      const userData = response.data;

      // Сохраняем пользователя в store
      setUser(userData);

      // Сохраняем ID пользователя в localStorage
      localStorage.setItem("userId", userId);

      // Переход на страницу чатов
      navigate(URLs.CHAT);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter your ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;