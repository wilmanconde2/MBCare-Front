// mbcare_frontend/src/pages/pacientes/NuevoPacienteModal.jsx

import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { createPaciente } from '../../api/pacientes';
import '../../styles/nuevaCitaModal.scss';

const ESTADOS_CIVILES = [
  'Soltero',
  'Casado',
  'Unión libre',
  'Separado',
  'Divorciado',
  'Viudo',
  'Otro',
];

function normalizePacientePayload(form) {
  const payload = { ...form };

  // Normalizar números
  for (const k of ['pesoKg', 'alturaCm']) {
    const v = payload[k];
    if (v === '' || v === null || v === undefined) {
      delete payload[k];
      continue;
    }
    const n = Number(v);
    if (Number.isNaN(n)) delete payload[k];
    else payload[k] = n;
  }

  // Limpiar strings vacíos
  Object.keys(payload).forEach((k) => {
    if (payload[k] === '') delete payload[k];
  });

  return payload;
}

export default function NuevoPacienteModal({ show, onHide, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nombreCompleto: '',
    tipoDocumento: 'CC',
    numeroDocumento: '',
    fechaNacimiento: '',
    genero: '',
    telefono: '',
    email: '',
    direccion: '',

    ocupacion: '',
    estadoCivil: '',

    pesoKg: '',
    alturaCm: '',
    alergias: '',
    lesiones: '',
    operaciones: '',
    razonVisita: '',
    valoracion: '',

    observaciones: '',
  });

  useEffect(() => {
    if (!show) {
      setForm({
        nombreCompleto: '',
        tipoDocumento: 'CC',
        numeroDocumento: '',
        fechaNacimiento: '',
        genero: '',
        telefono: '',
        email: '',
        direccion: '',

        ocupacion: '',
        estadoCivil: '',

        pesoKg: '',
        alturaCm: '',
        alergias: '',
        lesiones: '',
        operaciones: '',
        razonVisita: '',
        valoracion: '',

        observaciones: '',
      });
      setLoading(false);
    }
  }, [show]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGuardar = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const payload = normalizePacientePayload(form);
      await createPaciente(payload);
      onHide?.();
      onSuccess?.();
    } catch (err) {
      console.error('Error creando paciente:', err);
      alert('Error creando paciente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={!!show} onHide={onHide} centered backdrop='static' size='lg'>
      <Modal.Header closeButton>
        <Modal.Title>Nuevo Paciente</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Row className='g-3'>
            {/* Identificación */}
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Nombre Completo *</Form.Label>
                <Form.Control
                  type='text'
                  name='nombreCompleto'
                  value={form.nombreCompleto}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Tipo Documento *</Form.Label>
                <Form.Select
                  name='tipoDocumento'
                  value={form.tipoDocumento}
                  onChange={handleChange}
                >
                  <option value='CC'>CC</option>
                  <option value='TI'>TI</option>
                  <option value='CE'>CE</option>
                  <option value='Pasaporte'>Pasaporte</option>
                  <option value='Otro'>Otro</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Número de Documento *</Form.Label>
                <Form.Control
                  type='text'
                  name='numeroDocumento'
                  value={form.numeroDocumento}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Fecha de Nacimiento</Form.Label>
                <Form.Control
                  type='date'
                  name='fechaNacimiento'
                  value={form.fechaNacimiento}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Género</Form.Label>
                <Form.Select name='genero' value={form.genero} onChange={handleChange}>
                  <option value=''>Seleccione</option>
                  <option value='Masculino'>Masculino</option>
                  <option value='Femenino'>Femenino</option>
                  <option value='Otro'>Otro</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Contacto */}
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type='text'
                  name='telefono'
                  value={form.telefono}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type='email'
                  name='email'
                  value={form.email}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Dirección</Form.Label>
                <Form.Control
                  type='text'
                  name='direccion'
                  value={form.direccion}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            {/* Información adicional */}
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Ocupación</Form.Label>
                <Form.Control
                  type='text'
                  name='ocupacion'
                  value={form.ocupacion}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Estado civil</Form.Label>
                <Form.Select name='estadoCivil' value={form.estadoCivil} onChange={handleChange}>
                  <option value=''>Seleccione</option>
                  {ESTADOS_CIVILES.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Antropometría */}
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Peso (kg)</Form.Label>
                <Form.Control
                  type='number'
                  name='pesoKg'
                  value={form.pesoKg}
                  onChange={handleChange}
                  min='0'
                  step='0.1'
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Altura (cm)</Form.Label>
                <Form.Control
                  type='number'
                  name='alturaCm'
                  value={form.alturaCm}
                  onChange={handleChange}
                  min='0'
                  step='1'
                />
              </Form.Group>
            </Col>

            {/* Historia clínica */}
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Alergias</Form.Label>
                <Form.Control
                  as='textarea'
                  rows={2}
                  name='alergias'
                  value={form.alergias}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group>
                <Form.Label>Lesiones</Form.Label>
                <Form.Control
                  as='textarea'
                  rows={2}
                  name='lesiones'
                  value={form.lesiones}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group>
                <Form.Label>Operaciones</Form.Label>
                <Form.Control
                  as='textarea'
                  rows={2}
                  name='operaciones'
                  value={form.operaciones}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group>
                <Form.Label>Razón de la visita</Form.Label>
                <Form.Control
                  as='textarea'
                  rows={2}
                  name='razonVisita'
                  value={form.razonVisita}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group>
                <Form.Label>Valoración</Form.Label>
                <Form.Control
                  as='textarea'
                  rows={3}
                  name='valoracion'
                  value={form.valoracion}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            {/* Observaciones */}
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Observaciones</Form.Label>
                <Form.Control
                  as='textarea'
                  rows={3}
                  name='observaciones'
                  value={form.observaciones}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant='secondary' onClick={onHide} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleGuardar} disabled={loading}>
          {loading ? 'Guardando...' : 'Crear'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
