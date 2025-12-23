import axios from './axios';

/**
 * Abrir caja del día
 * saldoInicial: number
 */
export const abrirCaja = async (saldoInicial) => {
    const { data } = await axios.post('/caja/abrir', { saldoInicial });
    return data; // { message, caja }
};

/**
 * Cerrar caja del día
 */
export const cerrarCaja = async () => {
    const { data } = await axios.post('/caja/cerrar');
    return data; // { message, caja, resumen }
};

/**
 * ✅ Estado de la caja de hoy (abierta/cerrada)
 * Devuelve info mínima para habilitar/deshabilitar UI
 */
export const obtenerEstadoCajaHoy = async () => {
    const { data } = await axios.get('/caja/estado-hoy');
    return data; // { abierta: boolean, caja: {...} | null }
};

/**
 * Obtener resumen de caja para una fecha
 * fecha debe ser string 'YYYY-MM-DD'
 */
export const obtenerResumenCaja = async (fecha) => {
    const { data } = await axios.get('/caja/resumen', {
        params: { fecha },
    });
    return data; // { message?, resumen }
};

/**
 * Listar historial de cajas cerradas
 * params: { page, limit, desde, hasta, profesionalId, mes }
 */
export const obtenerHistorialCajas = async (params = {}) => {
    const { data } = await axios.get('/caja/historial', {
        params,
    });
    return data; // { total, paginaActual, totalPaginas, cajas }
};

/**
 * Exportar historial de cajas cerradas a PDF
 * params: mismos filtros que obtenerHistorialCajas
 * Devuelve el response completo (blob) para que el frontend descargue el archivo.
 */
export const exportarHistorialCajaPDF = async (params = {}) => {
    const response = await axios.get('/caja/historial/exportar', {
        params,
        responseType: 'blob',
    });
    return response;
};
