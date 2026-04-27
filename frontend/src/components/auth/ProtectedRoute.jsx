import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getDefaultRoute } from "../../utils/routeHelpers";
import LoadingSpinner from "../common/LoadingSpinner";

const ProtectedRoute = ({ roles, children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner label="Checking session..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to={getDefaultRoute(user.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
