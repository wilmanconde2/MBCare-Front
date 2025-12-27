import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { createPaciente } from '../../api/pacientes';
import '../../styles/nuevaCitaModal.scss';

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
    contactoEmergencia: '',
    telefonoEmergencia: '',
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
        contactoEmergencia: '',
        telefonoEmergencia: '',
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
      await createPaciente(form);
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
    <Modal show={!!show} onHide={onHide} centered backdrop='static'>
      <Modal.Header closeButton>
        <Modal.Title>Nuevo Paciente</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Row className='g-3'>
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

            <Col xs={12}>
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

            <Col xs={12}>
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

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Contacto Emergencia</Form.Label>
                <Form.Control
                  type='text'
                  name='contactoEmergencia'
                  value={form.contactoEmergencia}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Teléfono Emergencia</Form.Label>
                <Form.Control
                  type='text'
                  name='telefonoEmergencia'
                  value={form.telefonoEmergencia}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

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
