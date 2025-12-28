import { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from '../../api/axios';
import { getPacientes } from '../../api/pacientes';

const CATEGORIAS_INGRESO = [
  'Consulta General',
  'Tratamiento',
  'Sesión',
  'Paquete de Sesiones',
  'Mensualidad',
  'Procedimientos',
  'Otros Ingresos',
];

const METODOS_PAGO = ['Efectivo', 'Tarjeta', 'Transferencia', 'Otro'];

const initialForm = {
  categoria: '',
  paciente: '',
  descripcion: '',
  monto: '0',
  metodoPago: 'Efectivo',
  numeroRecibo: '',
  notas: '',
};

const NuevoIngresoModal = ({ show, onClose, onCreated }) => {
  const [form, setForm] = useState(initialForm);
  const [pacientes, setPacientes] = useState([]);
  const [saving, setSaving] = useState(false);

  // Cargar pacientes de la organización
  useEffect(() => {
    const loadPacientes = async () => {
      try {
        const res = await getPacientes(); // axios response
        setPacientes(res.data || []);
      } catch (e) {
        console.error('Error al cargar pacientes', e);
      }
    };

    if (show) {
      loadPacientes();
    }
  }, [show]);

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

    const montoNumber = Number(form.monto);
    if (Number.isNaN(montoNumber) || montoNumber <= 0) {
      window.alert('El monto debe ser un número mayor que 0.');
      return;
    }

    // Compactar concepto + datos opcionales en "descripcion"
    let descripcion = form.descripcion.trim();
    if (form.numeroRecibo) {
      descripcion += ` | Recibo: ${form.numeroRecibo.trim()}`;
    }
    if (form.notas) {
      descripcion += ` | Notas: ${form.notas.trim()}`;
    }

    const payload = {
      tipo: 'Ingreso',
      categoria: form.categoria,
      descripcion,
      monto: montoNumber,
      metodoPago: form.metodoPago,
    };

    if (form.paciente) {
      payload.paciente = form.paciente; // opcional
    }

    try {
      setSaving(true);
      await axios.post('/flujo-caja/crear', payload);
      onCreated && onCreated();
      handleClose();
    } catch (e) {
      console.error('Error al guardar ingreso', e);
      window.alert('Error al guardar el ingreso.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop='static'>
      <Modal.Header closeButton>
        <Modal.Title>Nuevo Ingreso</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          {/* Categoría */}
          <Form.Group className='mb-3'>
            <Form.Label>Categoría *</Form.Label>
            <Form.Select name='categoria' value={form.categoria} onChange={handleChange}>
              <option value=''>Seleccionar categoría</option>
              {CATEGORIAS_INGRESO.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Cliente (paciente opcional) */}
          <Form.Group className='mb-3'>
            <Form.Label>Cliente (opcional)</Form.Label>
            <Form.Select name='paciente' value={form.paciente} onChange={handleChange}>
              <option value=''>Sin cliente asociado</option>
              {pacientes.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.nombreCompleto} {p.numeroDocumento ? `(${p.numeroDocumento})` : ''}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

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

          {/* Número de recibo (solo UI, se guarda dentro de descripcion) */}
          <Form.Group className='mb-3'>
            <Form.Label>Número de Recibo</Form.Label>
            <Form.Control
              type='text'
              name='numeroRecibo'
              value={form.numeroRecibo}
              onChange={handleChange}
              placeholder='Opcional'
            />
          </Form.Group>

          {/* Notas (solo UI, se guarda dentro de descripcion) */}
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

export default NuevoIngresoModal;
