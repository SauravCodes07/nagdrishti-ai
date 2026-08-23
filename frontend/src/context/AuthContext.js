"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { supabase, signOutSupabase } from "../lib/supabaseClient";
import { API_BASE, getApiBase } from "../lib/api";

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: false,
  authChecking: false,
  setUser: () => {},
  refreshSession: async () => {},
  logout: async () => {},
});

// Fast synchronous reader for cached localStorage session (0ms delay)
function getInitialLocalSession() {
  if (typeof window === "undefined") {
    return { user: null, token: null, isAuthenticated: false, isAdmin: false };
  }
  try {
    const token = localStorage.getItem("nagdrishti_token");
    const adminToken = localStorage.getItem("admin_token");
    const rawUser = localStorage.getItem("nagdrishti_user");
    
    if (token) {
      let parsedUser = null;
      if (rawUser) {
        try {
          parsedUser = JSON.parse(rawUser);
        } catch (_) {}
      }
      
      const isAdmin = Boolean(adminToken) || parsedUser?.role === "admin" || parsedUser?.is_staff;
      const fallbackUser = parsedUser || {
        id: "cached_user",
        name: isAdmin ? "Officer" : "Citizen",
        username: isAdmin ? "officer" : "citizen",
        role: isAdmin ? "admin" : "citizen",
        is_staff: isAdmin,
        isPreloaded: true,
      };

      return {
        user: fallbackUser,
        token: token,
        isAuthenticated: true,
        isAdmin: isAdmin,
      };
    }
  } catch (err) {
    console.warn("[AuthContext] Local session cache read warning:", err);
  }
  return { user: null, token: null, isAuthenticated: false, isAdmin: false };
}

export function AuthProvider({ children }) {
  const initialSession = useMemo(() => getInitialLocalSession(), []);
  
  const [user, setUser] = useState(initialSession.user);
  const [token, setToken] = useState(initialSession.token);
  const [isAuthenticated, setIsAuthenticated] = useState(initialSession.isAuthenticated);
  const [isAdmin, setIsAdmin] = useState(initialSession.isAdmin);
  // If we had a cached local session, we don't block the UI shell
  const [authChecking, setAuthChecking] = useState(!initialSession.isAuthenticated);

  // Sync user state and cache to localStorage
  const saveSession = useCallback((userData, tokenValue) => {
    if (typeof window === "undefined") return;
    try {
      if (userData && tokenValue) {
        const adminFlag = Boolean(userData.role === "admin" || userData.is_staff || userData.is_superuser);
        localStorage.setItem("nagdrishti_token", tokenValue);
        localStorage.setItem("nagdrishti_user", JSON.stringify(userData));
        if (adminFlag) {
          localStorage.setItem("admin_token", tokenValue);
        }
        setUser(userData);
        setToken(tokenValue);
        setIsAuthenticated(true);
        setIsAdmin(adminFlag);
      } else {
        localStorage.removeItem("nagdrishti_token");
        localStorage.removeItem("nagdrishti_user");
        localStorage.removeItem("admin_token");
        sessionStorage.removeItem("nagdrishti_csrf");
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    } catch (err) {
      console.warn("[AuthContext] Save session error:", err);
    }
  }, []);

  // Background verification of session (never blocks page navigation)
  const verifySession = useCallback(async (isInitialMount = false) => {
    try {
      // 1. Check Supabase active session first (fastest local check)
      if (supabase) {
        try {
          const { data, error } = await Promise.race([
            supabase.auth.getSession(),
            new Promise((resolve) => setTimeout(() => resolve({ data: { session: null }, error: new Error("timeout") }), 2000)),
          ]);

          if (data?.session?.user) {
            const sbUser = data.session.user;
            const tokenValue = data.session.access_token || `sb_${sbUser.id}`;
            const isOfficer = typeof window !== "undefined" && Boolean(localStorage.getItem("admin_token"));
            const userName =
              sbUser.user_metadata?.full_name ||
              sbUser.user_metadata?.name ||
              sbUser.email?.split("@")[0] ||
              (isOfficer ? "Officer" : "Citizen");

            const formattedUser = {
              id: sbUser.id,
              username: sbUser.email?.split("@")[0] || sbUser.id,
              email: sbUser.email || "",
              name: userName,
              picture: sbUser.user_metadata?.avatar_url || sbUser.user_metadata?.picture || "",
              is_staff: isOfficer,
              is_superuser: isOfficer,
              role: isOfficer ? "admin" : "citizen",
            };

            saveSession(formattedUser, tokenValue);
            setAuthChecking(false);
            return { authenticated: true, user: formattedUser, token: tokenValue };
          }
        } catch (sbErr) {
          // Supabase session check error or timeout
        }
      }

      // 2. Check Django backend token if stored
      if (typeof window !== "undefined") {
        const localToken = localStorage.getItem("nagdrishti_token");
        if (localToken && !localToken.startsWith("sb_")) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2500);
            const res = await fetch(`${getApiBase()}/api/auth/me/`, {
              headers: {
                "Authorization": `Token ${localToken}`,
                "Content-Type": "application/json",
              },
              signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (res.ok) {
              const resData = await res.json();
              if (resData?.authenticated && resData?.user) {
                saveSession(resData.user, localToken);
                setAuthChecking(false);
                return { authenticated: true, user: resData.user, token: localToken };
              }
            }
          } catch (apiErr) {
            // Backend unavailable or slow: if we already have local session, keep it
            if (user) {
              setAuthChecking(false);
              return { authenticated: true, user, token: localToken };
            }
          }
        }
      }

      // If user had a cached local session and backend is just waking up, preserve it
      if (typeof window !== "undefined" && localStorage.getItem("nagdrishti_token")) {
        setAuthChecking(false);
        return { authenticated: true, user, token };
      }

      // Truly unauthenticated
      if (!isInitialMount || !localStorage.getItem("nagdrishti_token")) {
        saveSession(null, null);
      }
      setAuthChecking(false);
      return { authenticated: false, user: null, token: null };
    } catch (err) {
      console.warn("[AuthContext] verifySession warning:", err);
      setAuthChecking(false);
      return { authenticated: Boolean(user), user, token };
    }
  }, [saveSession, user, token]);

  // Single root listener for Supabase auth state changes
  useEffect(() => {
    let isMounted = true;

    // Verify on mount in background
    verifySession(true).then(() => {
      if (isMounted) setAuthChecking(false);
    });

    // Safety timeout: never let authChecking remain true for >2s under any network condition
    const safetyTimer = setTimeout(() => {
      if (isMounted) setAuthChecking(false);
    }, 2000);

    let authSubscription = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (session?.user) {
            const sbUser = session.user;
            const tokenValue = session.access_token || `sb_${sbUser.id}`;
            const isOfficer = typeof window !== "undefined" && Boolean(localStorage.getItem("admin_token"));
            const userName =
              sbUser.user_metadata?.full_name ||
              sbUser.user_metadata?.name ||
              sbUser.email?.split("@")[0] ||
              (isOfficer ? "Officer" : "Citizen");

            const formattedUser = {
              id: sbUser.id,
              username: sbUser.email?.split("@")[0] || sbUser.id,
              email: sbUser.email || "",
              name: userName,
              picture: sbUser.user_metadata?.avatar_url || sbUser.user_metadata?.picture || "",
              is_staff: isOfficer,
              is_superuser: isOfficer,
              role: isOfficer ? "admin" : "citizen",
            };
            saveSession(formattedUser, tokenValue);
            setAuthChecking(false);
          }
        } else if (event === "SIGNED_OUT") {
          saveSession(null, null);
          setAuthChecking(false);
        }
      });
      authSubscription = data?.subscription;
    }

    const handleSessionExpired = () => {
      saveSession(null, null);
      setAuthChecking(false);
    };
    window.addEventListener("nagdrishti:session-expired", handleSessionExpired);

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      if (authSubscription) authSubscription.unsubscribe();
      window.removeEventListener("nagdrishti:session-expired", handleSessionExpired);
    };
  }, [saveSession, verifySession]);

  const logout = useCallback(async () => {
    saveSession(null, null);
    try {
      await signOutSupabase();
    } catch (_) {}
  }, [saveSession]);

  const contextValue = useMemo(() => ({
    user,
    token,
    isAuthenticated,
    isAdmin,
    loading: authChecking,
    authChecking,
    setUser: (u) => saveSession(u, token),
    saveSession,
    refreshSession: () => verifySession(false),
    logout,
  }), [user, token, isAuthenticated, isAdmin, authChecking, saveSession, verifySession, logout]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
