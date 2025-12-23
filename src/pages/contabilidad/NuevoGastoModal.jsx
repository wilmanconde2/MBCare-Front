import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from '../../api/axios';

const CATEGORIAS_EGRESO = [
  'Salarios',
  'Alquiler',
  'Servicios',
  'Suministros',
  'Mantenimiento',
  'Publicidad',
  'Capacitación',
  'Otros Gastos',
];

const TIPOS_SERVICIO = ['Luz', 'Agua', 'Internet', 'Teléfono', 'Otro'];

const METODOS_PAGO = ['Efectivo', 'Tarjeta', 'Transferencia', 'Otro'];

const initialForm = {
  categoria: '',
  subServicio: '',
  descripcion: '',
  monto: '0',
  metodoPago: 'Efectivo',
  numeroFactura: '',
  notas: '',
};

const NuevoGastoModal = ({ show, onClose, onCreated }) => {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    setForm(initialForm);
    onClose && onClose();
  };

  const handleGuardar = async () => {
    if (!form.categoria || !form.descripcion || !form.monto) {
      window.alert('Categoría, concepto y monto son obligatorios.');
      return;
    }

    if (form.categoria === 'Servicios' && !form.subServicio) {
      window.alert('Selecciona el tipo de servicio.');
      return;
    }

    const montoNumber = Number(form.monto);
    if (Number.isNaN(montoNumber) || montoNumber <= 0) {
      window.alert('El monto debe ser un número mayor que 0.');
      return;
    }

    // Armar descripción final
    let descripcion = form.descripcion.trim();

    if (form.categoria === 'Servicios' && form.subServicio) {
      descripcion = `[Servicio: ${form.subServicio}] ${descripcion}`;
    }

    if (form.numeroFactura) {
      descripcion += ` | Factura: ${form.numeroFactura.trim()}`;
    }

    if (form.notas) {
      descripcion += ` | Notas: ${form.notas.trim()}`;
    }

    const payload = {
      tipo: 'Egreso',
      categoria: form.categoria,
      descripcion,
      monto: montoNumber,
      metodoPago: form.metodoPago,
    };

    try {
      setSaving(true);
      await axios.post('/caja/flujo/crear', payload);
      onCreated && onCreated();
      handleClose();
    } catch (e) {
      console.error('Error al guardar gasto', e);
      window.alert('Error al guardar el gasto.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop='static'>
      <Modal.Header closeButton>
        <Modal.Title>Nuevo Gasto</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          {/* Categoría */}
          <Form.Group className='mb-3'>
            <Form.Label>Categoría *</Form.Label>
            <Form.Select name='categoria' value={form.categoria} onChange={handleChange}>
              <option value=''>Seleccionar categoría</option>
              {CATEGORIAS_EGRESO.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Tipo de servicio (solo si categoría = Servicios) */}
          {form.categoria === 'Servicios' && (
            <Form.Group className='mb-3'>
              <Form.Label>Tipo de Servicio *</Form.Label>
              <Form.Select name='subServicio' value={form.subServicio} onChange={handleChange}>
                <option value=''>Seleccionar servicio</option>
                {TIPOS_SERVICIO.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          {/* Concepto */}
          <Form.Group className='mb-3'>
            <Form.Label>Concepto *</Form.Label>
            <Form.Control
              type='text'
              name='descripcion'
              value={form.descripcion}
              onChange={handleChange}
              placeholder='Descripción de la transacción'
            />
          </Form.Group>

          {/* Monto */}
          <Form.Group className='mb-3'>
            <Form.Label>Monto *</Form.Label>
            <Form.Control
              type='number'
              name='monto'
              min='0'
              step='0.01'
              value={form.monto}
              onChange={handleChange}
            />
          </Form.Group>

          {/* Método de pago */}
          <Form.Group className='mb-3'>
            <Form.Label>Método de Pago *</Form.Label>
            <div>
              {METODOS_PAGO.map((m) => (
                <Form.Check
                  key={m}
                  inline
                  type='radio'
                  label={m}
                  name='metodoPago'
                  value={m}
                  checked={form.metodoPago === m}
                  onChange={handleChange}
                />
              ))}
            </div>
          </Form.Group>

          {/* Número de factura */}
          <Form.Group className='mb-3'>
            <Form.Label>Número de Factura</Form.Label>
            <Form.Control
              type='text'
              name='numeroFactura'
              value={form.numeroFactura}
              onChange={handleChange}
              placeholder='Opcional'
            />
          </Form.Group>

          {/* Notas */}
          <Form.Group className='mb-2'>
            <Form.Label>Notas</Form.Label>
            <Form.Control
              as='textarea'
              rows={3}
              name='notas'
              value={form.notas}
              onChange={handleChange}
              placeholder='Notas adicionales (opcional)'
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant='secondary' onClick={handleClose} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={handleGuardar} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NuevoGastoModal;
