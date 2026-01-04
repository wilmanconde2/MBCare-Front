// src/context/AuthContext.jsx

import { createContext, useContext, useEffect, useState } from 'react';
import { loginRequest, registerRequest, verifyTokenRequest } from '../api/auth.api';
import axios from '../api/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =====================================================
     1. Mantener sesión al recargar página
  ===================================================== */
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await verifyTokenRequest();
        const profile = res.data.user;

        setUser({
          id: profile._id,
          nombre: profile.nombre,
          email: profile.email,
          rol: profile.rol,
          debeCambiarPassword: profile.debeCambiarPassword,
        });

        if (profile.organizacion) {
          setOrg({
            id: profile.organizacion._id,
            nombre: profile.organizacion.nombre,
            industria: profile.organizacion.industria,
          });
        }
      } catch {
        setUser(null);
        setOrg(null);
      }

      setLoading(false);
    }

    loadUser();
  }, []);

  /* =====================================================
     2. LOGIN
  ===================================================== */
  async function login(data) {
    try {
      const res = await loginRequest(data);
      const profile = res.data.user;

      setUser({
        id: profile.id,
        nombre: profile.nombre,
        email: profile.email,
        rol: profile.rol,
        debeCambiarPassword: profile.debeCambiarPassword,
      });

      if (profile.organizacion) {
        setOrg({
          id: profile.organizacion.id,
          nombre: profile.organizacion.nombre,
          industria: profile.organizacion.industria,
        });
      }

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
        message: error.response?.data?.message,
      };
    }
  }

  /* =====================================================
     4. LOGOUT
  ===================================================== */
  async function logout() {
    await axios.post('/auth/logout').catch(() => {});
    setUser(null);
    window.location.href = '/login';
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
