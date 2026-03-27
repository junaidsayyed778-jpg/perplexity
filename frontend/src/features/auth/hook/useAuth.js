import { useDispatch, useSelector } from "react-redux"
import { authInitComplete, clearAuth, loginLoading, loginSuccess, setError, setLoading, setUser } from "../authSlice.js"
import { getMeApi, login, logout, register } from "../service/authApi.js"

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

  async function handleLogout() {
    try {
      // 1. Call logout API (non-blocking)
      await logout().catch(err => console.warn("⚠️ Logout API error:", err?.message));
    } catch (err) {
      console.warn("⚠️ Logout API failed:", err?.message);
    }

    // 2. Clear Redux state
    dispatch(clearAuth());

    // 3. Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("chatHistory");

    // 4. Clear sessionStorage
    sessionStorage.clear();

    // 5. ✅ Clear ALL cookies
    clearAllCookies();

    // 6. Mark auth init complete
    dispatch(authInitComplete());

    console.log("✅ Logout complete - all auth data cleared");
  }

  // ✅✅✅ Helper: Clear All Cookies ✅✅✅
  function clearAllCookies() {
    try {
      // Get all cookies
      const cookies = document.cookie.split(";");
      
      // Clear each cookie
      cookies.forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        
        // Clear with different path/domain combinations
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
        
        // Also try clearing with common secure flags
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
      });

      console.log("✅ All cookies cleared");
    } catch (err) {
      console.error("❌ Failed to clear cookies:", err);
    }
  }

  return { handleRegister, handleLogin, getMe, handleLogout, clearAllCookies, loading: useSelector((s) => s.auth.loading), error: useSelector((s) => s.auth.error) };
}