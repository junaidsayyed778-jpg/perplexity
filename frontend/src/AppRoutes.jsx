import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './features/auth/pages/login';
import Register from './features/auth/pages/Register';
import Protected from './features/auth/components/Protected';
import Dashboard from './features/chat/pages/Dashboard';


const AppRoutes = createBrowserRouter([
   {
    path: "/",
    element: (
      <Protected>
        <Dashboard />
      </Protected>
    ),
  },
    {
        path: "/login",
        element: <Login/>
    },
    {
        path: "/register",
        element: <Register />
    },
    // ✅ Catch-all for unknown routes
  {
    path: "*",
    element: <Login />
  }
])

export default AppRoutes;
