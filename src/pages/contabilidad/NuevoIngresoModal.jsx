import { useEffect, useMemo, useState } from 'react';
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

function parseDescripcion(raw) {
  if (!raw) return { descripcion: '', numeroRecibo: '', notas: '' };

  const parts = String(raw)
    .split(' | ')
    .map((p) => p.trim())
    .filter(Boolean);
  const base = parts.shift() || '';

  let numeroRecibo = '';
  let notas = '';

  for (const p of parts) {
    if (p.toLowerCase().startsWith('recibo:')) {
      numeroRecibo = p.slice('recibo:'.length).trim();
    } else if (p.toLowerCase().startsWith('notas:')) {
      notas = p.slice('notas:'.length).trim();
    }
  }

  return { descripcion: base, numeroRecibo, notas };
}

const NuevoIngresoModal = ({ show, onClose, onCreated, mode = 'create', transaccion = null }) => {
  const [form, setForm] = useState(initialForm);
  const [pacientes, setPacientes] = useState([]);
  const [saving, setSaving] = useState(false);

  const esEditar = mode === 'edit' && !!transaccion?._id;

  const titulo = useMemo(() => (esEditar ? 'Editar Ingreso' : 'Nuevo Ingreso'), [esEditar]);

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

  // Precargar formulario en modo edición
  useEffect(() => {
    if (!show) return;

    if (esEditar && transaccion) {
      const parsed = parseDescripcion(transaccion.descripcion);

      setForm({
        categoria: transaccion.categoria || '',
        paciente: transaccion.paciente?._id || transaccion.paciente || '',
        descripcion: parsed.descripcion || '',
        monto: String(transaccion.monto ?? '0'),
        metodoPago: transaccion.metodoPago || 'Efectivo',
        numeroRecibo: parsed.numeroRecibo || '',
        notas: parsed.notas || '',
      });
    } else {
      setForm(initialForm);
    }
  }, [show, esEditar, transaccion]);

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

      if (esEditar) {
        await axios.put(`/flujo-caja/transaccion/${transaccion._id}`, payload);
      } else {
        await axios.post('/flujo-caja/crear', payload);
      }

      onCreated && onCreated();
      handleClose();
    } catch (e) {
      console.error('Error al guardar ingreso', e);
      const msg = e?.response?.data?.message || 'Error al guardar el ingreso.';
      window.alert(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop='static'>
      <Modal.Header closeButton>
        <Modal.Title>{titulo}</Modal.Title>
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
              placeholder='Ej: Sesión, evaluación, etc.'
              value={form.descripcion}
              onChange={handleChange}
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
            <Form.Label>Método de pago</Form.Label>
            <Form.Select name='metodoPago' value={form.metodoPago} onChange={handleChange}>
              {METODOS_PAGO.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Recibo / notas */}
          <Form.Group className='mb-3'>
            <Form.Label>Número de recibo (opcional)</Form.Label>
            <Form.Control
              type='text'
              name='numeroRecibo'
              placeholder='Ej: 00123'
              value={form.numeroRecibo}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className='mb-3'>
            <Form.Label>Notas (opcional)</Form.Label>
            <Form.Control
              as='textarea'
              rows={3}
              name='notas'
              value={form.notas}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant='secondary' onClick={handleClose} disabled={saving}>
          Cancelar
        </Button>

        <Button
          variant={esEditar ? 'primary' : 'success'}
          onClick={handleGuardar}
          disabled={saving}
        >
          {saving ? 'Guardando...' : esEditar ? 'Guardar cambios' : 'Guardar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NuevoIngresoModal;
