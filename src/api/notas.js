import axios from './axios';

/* ===============================
   NOTAS CLÍNICAS — API
   (Compat con NotasClinicas.jsx actual)
================================ */

/**
 * 🔍 Obtener todas las notas clínicas de un paciente por número de documento
 * Backend:
 * GET /notas/documento/:numeroDocumento
 *
 * IMPORTANTE:
 * - Retorna el RESPONSE completo (axios) para que puedas usar:
 *   res.data.notas (como tienes en NotasClinicas.jsx)
 */
export const getNotasPorDocumento = async (numeroDocumento) => {
    if (!numeroDocumento) {
        throw new Error('El número de documento es obligatorio');
    }

    return axios.get(`/notas/documento/${numeroDocumento}`);
};

/**
 * ➕ Crear una nueva nota clínica
 * Backend:
 * POST /notas
 *
 * Retorna data: { message, nota }
 */
export const crearNota = async (payload) => {
    const { data } = await axios.post('/notas', payload);
    return data;
};

/**
 * 🔍 Obtener una nota por ID
 * Backend:
 * GET /notas/:id
 *
 * Retorna data: { nota }
 */
export const getNotaById = async (id) => {
    if (!id) throw new Error('ID de nota requerido');

    const { data } = await axios.get(`/notas/${id}`);
    return data;
};

/**
 * ✏️ Editar nota clínica
 * Backend:
 * PUT /notas/:id
 *
 * Retorna data: { message, nota }
 */
export const editarNota = async (id, payload) => {
    if (!id) throw new Error('ID de nota requerido');

    const { data } = await axios.put(`/notas/${id}`, payload);
    return data;
};

/**
 * 🗑️ Eliminar nota clínica
 * Backend:
 * DELETE /notas/:id
 *
 * Retorna data: { message }
 */
export const eliminarNota = async (id) => {
    if (!id) throw new Error('ID de nota requerido');

    const { data } = await axios.delete(`/notas/${id}`);
    return data;
};

/* ===============================
   EXPORTAR NOTAS PDF
   Backend:
   GET /reportes/notas/:numeroDocumento
================================ */

/**
 * 📄 Obtener PDF (blob) con TODAS las notas por número de documento
 * Retorna response axios (blob en response.data)
 */
export const exportarNotasPDF = async (numeroDocumento) => {
    if (!numeroDocumento) throw new Error('Número de documento requerido');

    return axios.get(`/reportes/notas/${numeroDocumento}`, {
        responseType: 'blob',
    });
};

/**
 * ⬇️ Descargar PDF directamente
 * Úsalo en el botón "Exportar PDF" si quieres descarga (no tab nueva)
 */
export const descargarNotasPDF = async (numeroDocumento) => {
    const res = await exportarNotasPDF(numeroDocumento);

    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `notas_${numeroDocumento}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
};
