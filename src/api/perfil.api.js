// src/api/perfil.api.js

import axios from "./axios";

export const updateMiNombreRequest = (nombre) =>
    axios.patch("/usuarios/me/nombre", { nombre });
