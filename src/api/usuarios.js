import axios from "./axios";

// GET → Traer usuarios por rol (Profesional, Asistente, etc.)
export const obtenerUsuarios = async (rol = "") => {
    const { data } = await axios.get("/usuarios", {
        params: { rol }
    });
    return data.usuarios || [];
};

// GET → Un usuario por ID
export const obtenerUsuarioPorId = async (id) => {
    const { data } = await axios.get(`/usuarios/${id}`);
    return data.usuario;
};
