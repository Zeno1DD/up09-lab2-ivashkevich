import { create } from "zustand";
import axios from "axios";
import io from "socket.io-client";

const socket = io(`${import.meta.env.VITE_WS_URL}`, {
  withCredentials: true,
  transports: ["websocket", "polling"],
});

// Define the interface for the Zustand store
interface User {
  id: string;
}

interface UserStoreState {
  user: User | null;
  users: User[];
  setUser: (user: User | null) => void;
  setUsers: (users: User[]) => void;
  fetchUsers: () => void;
}

// Zustand store for user state
const useUserStore = create<UserStoreState>((set) => ({
  user: null,
  users: [],
  setUser: (user) => set({ user }),
  setUsers: (users) => set({ users }),
  fetchUsers: async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_WS_URL}/users`);
      set({ users: response.data });
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  },
}));

const initializeUserStore = () => {
  const savedUserId = localStorage.getItem("userId");
  if (savedUserId) {
    useUserStore.setState({ user: { id: savedUserId } }); 
  }
};

initializeUserStore();

// Listen for WebSocket events
socket.on("users", (users: User[]) => {
  useUserStore.getState().setUsers(users);
});

export default useUserStore;