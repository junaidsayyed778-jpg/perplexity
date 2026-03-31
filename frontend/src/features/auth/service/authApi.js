import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/auth",
    withCredentials: true
})

export async function register({ email, username, password}){
    const response = await api.post("/register", {
        email,
        username,
        password
    })
    return response.data
}

export async function login({ email, password}) {
    const response = await api.post("/login", {
        email,
        password
    })

    return response.data
}

export async function getMeApi(){
    const response = await api.get("/get-me")

    return response.data
}

export async function logout(){
    const res = await api.post("/logout", {},{

    })
    return res.data
}