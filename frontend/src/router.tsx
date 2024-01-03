import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Guest from "./pages/Guest";
import Protected from "./pages/Protected";

const router = createBrowserRouter([
    {
        path: '/',
        element: <Guest />,
        children: [
            {
                path: '/',
                element: <Home />
            }
        ]
    },
    {
        path: '/',
        element: <Protected />,
        children: [
            {
                path: '/login',
                element: <Login />
            }
        ]
    }
])


export default router;