import axios from "./axios";

// GET → Listar citas
export const obtenerCitas = async () => {
    const { data } = await axios.get("/citas");
    return data;
};

// POST → Crear cita
export const crearCita = async (formData) => {
    const { data } = await axios.post("/citas", formData);
    return data;
};

// PUT → Editar cita
export const actualizarCita = async (id, formData) => {
    const { data } = await axios.put(`/citas/${id}`, formData);
    return data;
};

// PUT → Cancelar cita
export const cancelarCita = async (id, notas = "") => {
    const { data } = await axios.put(`/citas/cancelar/${id}`, { notas });
    return data;
};

// GET → Exportar citas
export const exportarCitas = async (params) => {
    const { data } = await axios.get("/citas/exportar", { params });
    return data;
};
