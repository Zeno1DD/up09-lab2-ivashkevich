import { createBrowserRouter } from "react-router-dom"
import AuthWrapper from "../auth/AuthWrapper"
import Chat from "../../pages/Chat/Chat"
import Login from "../../pages/Login/Login"

const router = createBrowserRouter([
    {
        path: "",
        element: <AuthWrapper />,
        children: [{ path: "", element: <Chat /> }],
    },
    { path: "/login", element: <Login /> },
])

export default router
