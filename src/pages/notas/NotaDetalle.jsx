import { Modal, Button } from 'react-bootstrap';
import '../../styles/notaDetalle.scss';

export default function NotaDetalle({ show, onHide, nota }) {
  const handleClose = () => onHide?.();

  const fechaSesion = nota?.fechaSesion || nota?.createdAt;

  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  // ✅ Mostrar contenido clínico real
  const contenidoClinico =
    nota?.contenidoClinico ||
    [
      nota?.observaciones ? `Observaciones:\n${nota.observaciones}` : '',
      nota?.diagnostico ? `Diagnóstico:\n${nota.diagnostico}` : '',
      nota?.planTratamiento ? `Plan de tratamiento:\n${nota.planTratamiento}` : '',
    ]
      .filter(Boolean)
      .join('\n\n') ||
    'Sin contenido';

  return (
    <Modal show={show} onHide={handleClose} centered backdrop='static'>
      <Modal.Header closeButton>
        <Modal.Title>Detalle de Nota Clínica</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className='detalle-wrap'>
          <div className='detalle-row'>
            <span className='detalle-label'>Fecha de sesión:</span>
            <span className='detalle-value'>{formatFecha(fechaSesion)}</span>
          </div>

          <div className='detalle-row'>
            <span className='detalle-label'>Profesional:</span>
            <span className='detalle-value'>{nota?.profesional?.nombre || 'N/A'}</span>
          </div>

          <div className='detalle-box'>
            <div className='detalle-box-title'>Contenido</div>
            <pre className='detalle-pre'>{contenidoClinico}</pre>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant='secondary' onClick={handleClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
