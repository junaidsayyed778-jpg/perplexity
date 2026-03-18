import React from 'react'
import { createBrowserRouter } from 'react-router'
import Login from './features/auth/pages/login';
import Register from './features/auth/pages/Register';


const AppRoutes = createBrowserRouter([
   {
    path: "/",
    element: <div>Home</div>
   },
    {
        path: "/login",
        element: <Login/>
    },
    {
        path: "/register",
        element: <Register />
    }
])

export default AppRoutes;
