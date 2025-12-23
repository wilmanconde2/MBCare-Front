import axios from './axios';

/**
 * Crear transacción (Ingreso o Egreso)
 * payload mínimo: { tipo: 'Ingreso'|'Egreso', descripcion, monto, metodoPago }
 * Puedes pasar campos extra (ej: categoria, paciente, notas) y el backend los irá soportando.
 */
export const crearTransaccion = async (payload) => {
    const { data } = await axios.post('/caja/flujo/crear', payload);
    return data; // { message, transaccion }
};

/**
 * Listar transacciones por ID de caja
 */
export const listarTransaccionesPorCaja = async (cajaId) => {
    const { data } = await axios.get(`/caja/flujo/transacciones/caja/${cajaId}`);
    return data; // { transacciones }
};

/**
 * Listar transacciones por fecha (YYYY-MM-DD)
 */
export const listarTransaccionesPorFecha = async (fecha) => {
    const { data } = await axios.get('/caja/flujo/transacciones/fecha', {
        params: { fecha },
    });
    return data; // { transacciones }
};

/**
 * Editar transacción (solo Fundador)
 * payload: { descripcion?, monto?, metodoPago? }
 */
export const editarTransaccion = async (id, payload) => {
    const { data } = await axios.put(`/caja/flujo/transaccion/${id}`, payload);
    return data; // { message, transaccion }
};

/**
 * Eliminar transacción (solo Fundador)
 */
export const eliminarTransaccion = async (id) => {
    const { data } = await axios.delete(`/caja/flujo/transaccion/${id}`);
    return data; // { message }
};
