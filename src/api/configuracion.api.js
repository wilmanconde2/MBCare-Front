// src/api/configuracion.api.js

import axios from "./axios";

export const getConfiguracionRequest = () => axios.get("/configuracion");

export const updateNombreOrganizacionRequest = (nombreOrganizacion) =>
    axios.patch("/configuracion/organizacion/nombre", { nombreOrganizacion });
