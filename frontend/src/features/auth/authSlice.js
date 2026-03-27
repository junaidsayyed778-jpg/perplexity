import { createSlice } from "@reduxjs/toolkit";

const getInitialState = () => {
  // ✅ Try to get user and token from localStorage
  try {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      return {
        user: JSON.parse(user),
        token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    }
  } catch (err) {
    console.error("Error parsing auth data from localStorage", err);
  }

  return {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  }
};
const initialState = getInitialState();
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      // ✅ Persist to localStorage
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    loginLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      // ✅ Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
      restoreAuth: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    authInitComplete: (state) => {
        state.loading = false
    },
  },
});

export const {
  setUser,
  setLoading,
  setError,
  loginLoading,
  clearAuth,
  restoreAuth,
  loginSuccess,
  authInitComplete
} = authSlice.actions;
export default authSlice.reducer;
