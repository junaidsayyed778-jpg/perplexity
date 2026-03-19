import { useDispatch } from "react-redux"
import { setError, setLoading, setUser } from "../authSlice"
import { getMeApi, login, register } from "../service/authApi"

export function useAuth () {
    const dispatch = useDispatch()

    async function handleRegister ({ email, username, password }){
        try{
            dispatch(setLoading(true))
            const data = await register({ email, username, password})
            dispatch(setUser(data.user))
        }catch(err){
            dispatch(setError(err.response?.data?.message || "Registration failed"))
        }finally{
            dispatch(setLoading(false))
        }
    }

    async function handleLogin({ email, password }){
        try{
            dispatch(setLoading(true))
            const data = await  login({ email, password })
            dispatch(setUser(data.user))
        }catch(err){
            dispatch(setError(err.response?.data?.message || "Login failed"))
        }finally{
            dispatch(setLoading(false))
        }
    }

    async function getMe(){
        try{
            dispatch(setLoading(true))
            const data = await getMeApi()
            dispatch(setUser(data.user))
        }catch(err){
            dispatch(setError(err.response?.data?.message || "Failed to fetch user data"))
        }finally{
            dispatch(setLoading(false))
        }
    }

    return { handleRegister, handleLogin, getMe}
}