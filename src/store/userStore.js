import { create } from "zustand";
import { loginRequest, registerRequest, verifyTokenRequest } from "../api/auth.api";

export const useUserStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,

  login: async (data) => {
    set({ loading: true });
    try {
      const res = await loginRequest(data);
      console.log("LOGIN RESPONSE:", res.data); // ← IMPORTANTE
      set({ user: res.data.user, isAuthenticated: true });
      return { ok: true };
    } catch (error) {
      console.log("LOGIN ERROR:", error.response?.data);
      return { ok: false, message: error.response?.data?.message };
    } finally {
      set({ loading: false });
    }
  },


  register: async (data) => {
    try {
      const res = await registerRequest(data);
      return { ok: true, user: res.data.user };
    } catch (error) {
      return { ok: false, message: error.response?.data?.message };
    }
  },

  verifyToken: async () => {
    try {
      const res = await verifyTokenRequest();
      set({ user: res.data.user, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
    }
  }
}));
