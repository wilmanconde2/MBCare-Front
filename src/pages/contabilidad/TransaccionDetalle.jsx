import { Modal } from 'react-bootstrap';
import '../../styles/contabilidad.scss';

function splitDescripcion(raw) {
  if (!raw) return { base: '', recibo: '', notas: '' };

  const parts = String(raw)
    .split(' | ')
    .map((p) => p.trim())
    .filter(Boolean);

  const base = parts.shift() || '';
  let recibo = '';
  let notas = '';

  for (const p of parts) {
    const low = p.toLowerCase();
    if (low.startsWith('recibo:')) recibo = p.slice('recibo:'.length).trim();
    if (low.startsWith('notas:')) notas = p.slice('notas:'.length).trim();
  }

  return { base, recibo, notas };
}

export default function TransaccionDetalle({ show, onHide, transaccion }) {
  if (!show) return null;
  if (!transaccion) return null;

  const fechaT = transaccion?.createdAt ? new Date(transaccion.createdAt) : null;

  const fecha = fechaT ? fechaT.toLocaleDateString('es-CO', { dateStyle: 'short' }) : '-';

  const hora = fechaT
    ? fechaT.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    : '-';

  const metodo = transaccion?.metodoPago ?? transaccion?.metodo ?? '-';

  const pacienteLabel =
    typeof transaccion?.paciente === 'string'
      ? transaccion?.paciente
      : transaccion?.paciente?.nombreCompleto ?? '-';

  const profesionalLabel =
    typeof transaccion?.profesional === 'string'
      ? transaccion?.profesional
      : transaccion?.profesional?.nombre ?? '-';

  const { base, recibo, notas } = splitDescripcion(transaccion?.descripcion);

  return (
    <Modal show={show} onHide={onHide} centered backdrop='static' dialogClassName='tx-modal'>
      <div className='detalle-wrapper tx-detalle-wrapper'>
        <div className='detalle-header'>
          <h2>Detalle de la transacción</h2>
          <button className='close-x' onClick={onHide} type='button' aria-label='Cerrar'>
            ✕
          </button>
        </div>

        <div className='detalle-grid'>
          <div>
            <label>Fecha</label>
            <p>{fecha}</p>
          </div>

          <div>
            <label>Hora</label>
            <p>{hora}</p>
          </div>

          <div>
            <label>Tipo</label>
            <p style={{ fontWeight: 600 }}>{transaccion?.tipo || '-'}</p>
          </div>

          <div>
            <label>Monto</label>
            <p>${Number(transaccion?.monto || 0).toLocaleString('es-CO')}</p>
          </div>

          <div>
            <label>Método</label>
            <p>{metodo}</p>
          </div>

          <div>
            <label>Paciente</label>
            <p>{pacienteLabel || '-'}</p>
          </div>

          <div>
            <label>Categoría</label>
            <p>{transaccion?.categoria || '-'}</p>
          </div>

          <div>
            <label>Profesional</label>
            <p>{profesionalLabel || '-'}</p>
          </div>

          <div className='col-2'>
            <label>Detalle</label>
            <p className='tx-multiline'>{base || '-'}</p>
          </div>

          <div>
            <label>Recibo</label>
            <p className='tx-multiline'>{recibo || '-'}</p>
          </div>

          <div className='col-2'>
            <label>Notas</label>
            <p className='tx-multiline tx-notas'>{notas || '-'}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
