// src/api/usuarios.js

import axios from './axios';

export const listarUsuarios = async () => {
    const { data } = await axios.get('/usuarios');
    return data.usuarios;
};

export const crearUsuario = async ({ nombre, email, password, rol }) => {
    return axios.post('/usuarios/crear', { nombre, email, password, rol });
};

export const toggleUsuarioActivo = async (id) => {
    return axios.put(`/usuarios/activar-desactivar/${id}`);
};

export const cambiarRolUsuario = async (id, rol) => {
    return axios.patch(`/usuarios/${id}/rol`, { rol });
};
