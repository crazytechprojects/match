import { createContext, useContext, useState, useCallback, useEffect } from "react";
import * as api from "../api";

const AuthContext = createContext(null);

const TOKEN_KEY = "matchwise_token";

function loadToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function saveToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(loadToken);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!loadToken());

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api.getMe(token)
      .then(setUser)
      .catch(() => {
        saveToken(null);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.login(email, password);
    saveToken(data.access_token);
    setToken(data.access_token);
    const me = await api.getMe(data.access_token);
    setUser(me);
    return me;
  }, []);

  const signup = useCallback(async (email, password) => {
    const data = await api.signup(email, password);
    saveToken(data.access_token);
    setToken(data.access_token);
    const me = await api.getMe(data.access_token);
    setUser(me);
    return me;
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    const payload = {
      name: profileData.name,
      gender: profileData.gender,
      match_gender: profileData.matchGender,
      date_of_birth: profileData.dateOfBirth || undefined,
      age_range_min: profileData.ageRange?.[0],
      age_range_max: profileData.ageRange?.[1],
      self_description: profileData.selfDescription,
      match_description: profileData.matchDescription,
    };
    const updated = await api.updateProfile(token, payload);
    setUser(updated);
    return updated;
  }, [token]);

  const updateUser = useCallback(async (data) => {
    if (data.name !== undefined) {
      const updated = await api.updateProfile(token, { name: data.name });
      setUser(updated);
      return updated;
    }
  }, [token]);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    const me = await api.getMe(token);
    setUser(me);
    return me;
  }, [token]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    saveToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, signup, updateProfile, updateUser, refreshUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
