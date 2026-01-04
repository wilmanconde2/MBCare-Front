// src/api/auth.api.js

import axios from "./axios";

// Login
export const loginRequest = (data) => axios.post("/auth/login", data);

// Registrar Fundador
export const registerRequest = (data) => axios.post("/auth/register", data);

// Verificar token (mantener sesión)
export const verifyTokenRequest = () => axios.get("/auth/verify");

// Cambiar contraseña (primer ingreso o normal)
export const changePasswordRequest = (newPassword) =>
    axios.put("/auth/change-password", { newPassword });
