// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { loginRequest, registerRequest, verifyTokenRequest, logoutRequest } from '../api/auth.api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);

  function setUserFromProfile(profile) {
    if (!profile) {
      setUser(null);
      setOrg(null);
      return;
    }

    setUser({
      id: profile.id || profile._id, // login usa id, verify usa _id
      nombre: profile.nombre,
      email: profile.email,
      rol: profile.rol,
      debeCambiarPassword: profile.debeCambiarPassword,
    });

    const o = profile.organizacion;
    if (o) {
      setOrg({
        id: o.id || o._id,
        nombre: o.nombre,
        industria: o.industria,
      });
    } else {
      setOrg(null);
    }
  }

  async function refreshSession() {
    const res = await verifyTokenRequest();
    const profile = res.data?.user;
    setUserFromProfile(profile);
    return profile;
  }

  /* =====================================================
     1. Mantener sesión al recargar página
  ===================================================== */
  useEffect(() => {
    async function loadUser() {
      try {
        await refreshSession();
      } catch {
        setUser(null);
        setOrg(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =====================================================
     2. LOGIN
  ===================================================== */
  async function login(data) {
    try {
      const res = await loginRequest(data);
      const profile = res.data?.user;

      setUserFromProfile(profile);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: error.response?.data?.message || 'Error de login',
      };
    }
  }

  /* =====================================================
     3. REGISTER
  ===================================================== */
  async function register(data) {
    try {
      const res = await registerRequest(data);
      return { ok: true, user: res.data.user };
    } catch (error) {
      return {
        ok: false,
        message: error.response?.data?.message || 'Error de registro',
      };
    }
  }

  /* =====================================================
     4. LOGOUT
  ===================================================== */
  async function logout() {
    await logoutRequest().catch(() => {});
    setUser(null);
    setOrg(null);
    window.location.href = '/login';
  }

  /* =====================================================
     Helpers para actualizar UI sin recargar
  ===================================================== */
  function updateUserNombreLocal(nombre) {
    setUser((prev) => (prev ? { ...prev, nombre } : prev));
  }

  function updateOrgNombreLocal(nombre) {
    setOrg((prev) => (prev ? { ...prev, nombre } : prev));
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        org,
        loading,
        isAuth: !!user,
        login,
        register,
        logout,
        refreshSession,
        updateUserNombreLocal,
        updateOrgNombreLocal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
