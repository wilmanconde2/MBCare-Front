import api from "./axios";

// =========================
//  GET: Listar todos
// =========================
export const getPacientes = () => api.get("/pacientes");

// =========================
//  GET: Obtener uno por ID
// =========================
export const getPacienteById = (id) => api.get(`/pacientes/${id}`);

// =========================
//  POST: Crear paciente
// =========================
export const createPaciente = (data) => api.post("/pacientes", data);

// =========================
//  PUT: Actualizar paciente
// =========================
export const updatePaciente = (id, data) => api.put(`/pacientes/${id}`, data);

// =========================
//  DELETE: Eliminar paciente
// =========================
export const deletePaciente = (id) => api.delete(`/pacientes/${id}`);
