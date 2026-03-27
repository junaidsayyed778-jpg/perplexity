// ✅ src/features/auth/components/Protected.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const Protected = ({ children }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  // ✅ Show loading ONLY during initial auth verification
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0b0d]">
        <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ✅ Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ Render children if authenticated
  return children;
};

export default Protected;