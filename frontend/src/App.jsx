import { RouterProvider } from "react-router"
import AppRoutes  from "./AppRoutes"
import { useAuth } from "./features/auth/hook/useAuth"
import { useEffect } from "react"

function App() {

  const auth = useAuth()

  useEffect(() => {
    auth.getMe()
  }, [])
  return (
    <RouterProvider router={AppRoutes} />
  )
}

export default App
