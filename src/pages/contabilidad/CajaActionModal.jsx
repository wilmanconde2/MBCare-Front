import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

export default function CajaActionModal({ show, onClose, action, onConfirm }) {
  const [valor, setValor] = useState('');

  const esAbrir = action === 'abrir';

  const handleConfirm = () => {
    if (esAbrir) {
      const num = Number(valor);
      if (isNaN(num) || num < 0) {
        alert('El saldo inicial debe ser un número válido.');
        return;
      }
      onConfirm(num);
    } else {
      onConfirm(); // cerrar caja no necesita valor
    }

    setValor('');
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} centered backdrop='static'>
      <Modal.Header closeButton>
        <Modal.Title>{esAbrir ? 'Abrir Caja del Día' : 'Cerrar Caja del Día'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {esAbrir ? (
          <>
            <Form.Group className='mb-3'>
              <Form.Label>Saldo inicial</Form.Label>
              <Form.Control
                type='number'
                min='0'
                placeholder='Ej: 0, 50000'
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            </Form.Group>
          </>
        ) : (
          <>
            <p>Estás a punto de cerrar la caja del día. Confirma para generar el resumen final.</p>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant='secondary' onClick={onClose}>
          Cancelar
        </Button>

        <Button variant={esAbrir ? 'primary' : 'danger'} onClick={handleConfirm}>
          {esAbrir ? 'Abrir Caja' : 'Cerrar Caja'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
