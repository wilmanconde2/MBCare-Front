import axios from './axios';

/**
 * Crear transacción
 */
export const crearTransaccion = async (payload) => {
    const { data } = await axios.post('/flujo-caja/crear', payload);
    return data;
};

/**
 * Listar transacciones por caja
 */
export const listarTransaccionesPorCaja = async (cajaId) => {
    const { data } = await axios.get(`/flujo-caja/transacciones/caja/${cajaId}`);
    return data;
};

/**
 * Listar transacciones por fecha
 */
export const listarTransaccionesPorFecha = async (fecha) => {
    const { data } = await axios.get('/flujo-caja/transacciones/fecha', {
        params: { fecha },
    });
    return data;
};

/**
 * Editar transacción
 */
export const editarTransaccion = async (id, payload) => {
    const { data } = await axios.put(`/flujo-caja/transaccion/${id}`, payload);
    return data;
};

/**
 * Eliminar transacción
 */
export const eliminarTransaccion = async (id) => {
    const { data } = await axios.delete(`/flujo-caja/transaccion/${id}`);
    return data;
};
