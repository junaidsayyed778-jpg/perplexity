// ✅ src/features/auth/components/AuthInitializer.jsx
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../authSlice.js";
import { useAuth } from "../hook/useAuth.js"

export const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { getMe } = useAuth();
  const { loading, isAuthenticated, user } = useSelector((state) => state.auth);
  
  // ✅ Use ref to track if we already fetched (prevents re-fetch on re-renders)
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const initializeAuth = async () => {
      // 🚫 Guard: Don't run if already fetched, already loading, or already have user
      if (hasFetchedRef.current || loading || user) {
        return;
      }

      // 🚫 Guard: Only fetch if we have token but no user in state
      const token = localStorage.getItem("token");
      if (!token || isAuthenticated) {
        hasFetchedRef.current = true;
        dispatch(setLoading(false));
        return;
      }

      try {
        console.log("🔄 Fetching user data...");
        await getMe();
        hasFetchedRef.current = true;
      } catch (err) {
        console.error("❌ Auth init failed:", err);
        hasFetchedRef.current = true;
      } finally {
        // ✅ Always stop loading after init attempt
        dispatch(setLoading(false));
      }
    };

    initializeAuth();
  }, [dispatch, getMe, loading, isAuthenticated, user]);

  // ✅ Show loading spinner ONLY during initial auth check
  if (loading && !hasFetchedRef.current) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0b0d]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Verifying session...</p>
        </div>
      </div>
    );
  }

  return children;
};