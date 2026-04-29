import React, {
  createContext,
  useEffect,
  useState
} from "react";

import * as SecureStore
  from "expo-secure-store";

import { jwtDecode }
  from "jwt-decode";

export const AuthContext =
  createContext();

export function AuthProvider({
  children
}) {
  const [user, setUser] =
    useState(null);

  const [token, setToken] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadStorage();
  }, []);

  async function loadStorage() {
    try {
      const savedToken =
        await SecureStore.getItemAsync(
          "token"
        );

      if (!savedToken) {
        setLoading(false);
        return;
      }

      const decoded =
        jwtDecode(savedToken);

      setToken(savedToken);

      setUser({
        id: decoded.id,
        email: decoded.sub,
        role: decoded.role
      });

    } catch (error) {
      console.log(
        "Erro ao restaurar login:",
        error
      );

      await logout();

    } finally {
      setLoading(false);
    }
  }

  async function login(
    accessToken
  ) {
    try {
      const decoded =
        jwtDecode(accessToken);

      setToken(accessToken);

      setUser({
        id: decoded.id,
        email: decoded.sub,
        role: decoded.role
      });

      await SecureStore.setItemAsync(
        "token",
        accessToken
      );

    } catch (error) {
      console.log(
        "Erro no login:",
        error
      );
    }
  }

  async function logout() {
    setUser(null);
    setToken(null);

    await SecureStore.deleteItemAsync(
      "token"
    );
  }

  const isAuthenticated =
    !!user;

  const isMaster =
    user?.role === "MASTER";

  const isPractitioner =
    user?.role ===
    "PRACTITIONER";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated,
        isMaster,
        isPractitioner
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}