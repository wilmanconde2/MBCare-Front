import axios from "./axios";

// Login
export const loginRequest = (data) =>
    axios.post("/auth/login", data);

// Registrar Fundador
export const registerRequest = (data) =>
    axios.post("/auth/register", data);

// Verificar token (mantener sesión)
export const verifyTokenRequest = () =>
    axios.get("/auth/verify");
