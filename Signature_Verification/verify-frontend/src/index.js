import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, Link, RouterProvider } from "react-router-dom";
import CreateUser from "./CreateUser";
import Login from "./Login/Login";
import Signup from "./Login/Signup";
import Form from "./components/Form";
import Navbar from "./components/Navbar";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Login />,
        errorElement: (
            <div className="flex flex-col gap-2 text-xl m-10">
                404 Not Found.
                <Link to="/" className="text-blue-700 font-bold">
                    Go back home
                </Link>
            </div>
        ),
    },
    { 
        path: "/signup", 
        element: <Signup /> 
    },
    { 
        path: "/form", 
        element: (
            <>
                <Navbar />
                <Form />
            </>
        )
    },
    { 
        path: "/createUser", 
        element: <CreateUser /> 
    },      
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);

reportWebVitals();