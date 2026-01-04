// src/api/auth.api.js

import axios from "./axios";

// Login
export const loginRequest = (data) => axios.post("/auth/login", data);

// Registrar Fundador
export const registerRequest = (data) => axios.post("/auth/register", data);

// Verificar token (mantener sesión)
export const verifyTokenRequest = () => axios.get("/auth/verify");

// Cambiar contraseña (ahora PATCH + requiere currentPassword y newPassword)
export const changePasswordRequest = ({ currentPassword, newPassword, confirmPassword }) =>
    axios.patch("/auth/change-password", {
        currentPassword,
        newPassword,
        ...(confirmPassword !== undefined ? { confirmPassword } : {}),
    });
