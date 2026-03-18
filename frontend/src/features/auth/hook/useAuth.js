import { useDispatch } from "react-redux"
import { setError, setLoading } from "../authSlice"
import { register } from "../service/authApi"

export function useAuth () {
    const dispatch = useDispatch()

    async function handleRegister ({ email, username, password }){
        try{
            dispatch(setLoading(true))
            const data = await register({ email, username, password})

        }catch(err){
            dispatch(setError(err.response?.data?.message || "Registration failed"))
        }finally{
            dispatch(setLoading(false))
        }
    }
}