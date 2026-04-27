import { createContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";

const STORAGE_KEY = "food-platform-auth";

export const AuthContext = createContext(null);

const readStoredAuth = () => {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return { token: "", user: null };
  }

  try {
    return JSON.parse(stored);
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
    return { token: "", user: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(readStoredAuth);
  const [loading, setLoading] = useState(Boolean(readStoredAuth().token));

  const persistAuth = (nextState) => {
    setAuthState(nextState);

    if (nextState?.token) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const refreshUser = async () => {
    const { token } = readStoredAuth();

    if (!token) {
      return null;
    }

    const { data } = await api.get("/auth/me");
    const nextState = { token, user: data.user };
    persistAuth(nextState);
    return data.user;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      if (!authState.token) {
        setLoading(false);
        return;
      }

      try {
        await refreshUser();
      } catch (error) {
        persistAuth({ token: "", user: null });
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    persistAuth({ token: data.token, user: data.user });
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    return data;
  };

  const updateProfile = async (payload) => {
    const { data } = await api.patch("/users/me", payload);
    const current = readStoredAuth();
    const nextState = {
      token: current.token,
      user: {
        ...current.user,
        ...data.user,
      },
    };

    persistAuth(nextState);
    return data;
  };

  const logout = () => {
    persistAuth({ token: "", user: null });
  };

  const value = useMemo(
    () => ({
      token: authState.token,
      user: authState.user,
      loading,
      isAuthenticated: Boolean(authState.token),
      login,
      register,
      refreshUser,
      updateProfile,
      logout,
    }),
    [authState, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
