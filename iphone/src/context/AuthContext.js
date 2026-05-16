import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'agentsmatch_token';
export const AGENT_NAME_KEY = 'agentsmatch_agent_name';

async function loadToken() {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function saveToken(token) {
  try {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch {}
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await loadToken();
      if (!stored) {
        setLoading(false);
        return;
      }
      try {
        const me = await api.getMe(stored);
        setToken(stored);
        setUser(me);
      } catch {
        await saveToken(null);
      }
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.login(email, password);
    await saveToken(data.access_token);
    setToken(data.access_token);
    const me = await api.getMe(data.access_token);
    setUser(me);
    return me;
  }, []);

  const signup = useCallback(async (email, password) => {
    const data = await api.signup(email, password);
    await saveToken(data.access_token);
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

  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    await saveToken(null);
    try {
      await AsyncStorage.removeItem(AGENT_NAME_KEY);
    } catch {}
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
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
