import { useDispatch, useSelector } from "react-redux"
import { loginLoading, loginSuccess, setError, setLoading, setUser } from "../authSlice.js"
import { getMeApi, login, register } from "../service/authApi.js"

export function useAuth () {
    const dispatch = useDispatch()
  const { user, loading, isAuthenticated } = useSelector((state) => state.auth);

   async function handleRegister({ email, username, password }) {
    try {
      dispatch(setLoading(true));
      const data = await register({ email, username, password });
      dispatch(setUser(data.user));
      return data;
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Registration failed"));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }

  const handleLogin = async (credentials) => {
    dispatch(loginLoading());
    try {
      const res = await login(credentials);
      console.log("✅ Login API response:", res);
      dispatch(loginSuccess({ user: res.user, token: res.token }));
      return res;
    } catch (err) {
      console.error("❌ Login error:", err);
      dispatch(setError(err.message || "Login failed"));
      throw err;
    }
  };

    async function getMe() {
    // 🚫 Don't call if: already loading, already have user, or not authenticated
    if (loading || user || !isAuthenticated) {
      console.log("⏭️ Skipping getMe - already loaded or loading");
      return;
    }

    try {
      dispatch(setLoading(true));
      const data = await getMeApi();
      
      // ✅ Only dispatch if we got valid data
      if (data?.user) {
        dispatch(setUser(data.user));
        console.log("✅ User data fetched:", data.user);
      }
      return data;
    } catch (err) {
      // ✅ Handle 401/403 - token invalid, clear auth
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.log("⚠️ Token invalid, clearing auth");
        dispatch(setError("Session expired"));
        // Optional: auto-logout
        // dispatch(clearAuth());
      } else {
        dispatch(setError(err.response?.data?.message || "Failed to fetch user data"));
      }
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }

  return { handleRegister, handleLogin, getMe, loading, error: useSelector((s) => s.auth.error) };
}