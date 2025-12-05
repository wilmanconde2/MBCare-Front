import { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { crearCita } from '../../api/citas';
import { getPacientes } from '../../api/pacientes';
import axios from '../../api/axios';
import '../../styles/nuevaCitaModal.scss';

const NuevaCitaModal = ({ show, onHide, onSuccess }) => {
  const [pacientes, setPacientes] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [rolUsuario, setRolUsuario] = useState('');

  const [formData, setFormData] = useState({
    paciente: '',
    profesional: '',
    fecha: '',
    duracion: 60,
    tipo: 'Presencial',
    notas: '',
  });

  useEffect(() => {
    const cargarData = async () => {
      try {
        // 🔹 Pacientes
        const resPac = await getPacientes(); // axios response
        setPacientes(resPac.data || []); // aquí sí es el array

        // 🔹 Profesionales
        const { data } = await axios.get('/usuarios'); // sin filtro de rol
        const todos = data.usuarios || [];
        setProfesionales(todos.filter((u) => u.rol === 'Profesional' || u.rol === 'Fundador'));

        // 🔹 Usuario autenticado
        const userData = localStorage.getItem('authUser');
        if (userData) {
          const user = JSON.parse(userData);
          setRolUsuario(user?.rol);

          if (user?.rol === 'Profesional') {
            setFormData((prev) => ({
              ...prev,
              profesional: user.id, // o user._id según tu backend
            }));
          }
        }
      } catch (e) {
        console.error('Error cargando datos para nueva cita', e);
      }
    };

    if (show) {
      cargarData();
    }
  }, [show]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGuardar = async () => {
    await crearCita(formData);
    onHide();
    onSuccess();
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop='static'>
      <Modal.Header closeButton>
        <Modal.Title>Nueva Cita</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          {/* Paciente */}
          <Form.Group className='mb-3'>
            <Form.Label>Paciente</Form.Label>
            <Form.Select name='paciente' value={formData.paciente} onChange={handleChange}>
              <option value=''>Seleccione un paciente</option>
              {pacientes.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.nombreCompleto}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Profesional */}
          {rolUsuario !== 'Profesional' && (
            <Form.Group className='mb-3'>
              <Form.Label>Profesional</Form.Label>
              <Form.Select name='profesional' value={formData.profesional} onChange={handleChange}>
                <option value=''>Seleccione un profesional</option>
                {profesionales.map((pro) => (
                  <option key={pro._id} value={pro._id}>
                    {pro.nombre} ({pro.email})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          {/* Fecha */}
          <Form.Group className='mb-3'>
            <Form.Label>Fecha y Hora</Form.Label>
            <Form.Control
              type='datetime-local'
              name='fecha'
              value={formData.fecha}
              onChange={handleChange}
            />
          </Form.Group>

          {/* Duración */}
          <Form.Group className='mb-3'>
            <Form.Label>Duración (minutos)</Form.Label>
            <Form.Control
              type='number'
              name='duracion'
              min='15'
              step='15'
              value={formData.duracion}
              onChange={handleChange}
            />
          </Form.Group>

          {/* Tipo */}
          <Form.Group className='mb-3'>
            <Form.Label>Tipo</Form.Label>
            <Form.Select name='tipo' value={formData.tipo} onChange={handleChange}>
              <option value='Presencial'>Presencial</option>
              <option value='Virtual'>Virtual</option>
            </Form.Select>
          </Form.Group>

          {/* Notas */}
          <Form.Group className='mb-2'>
            <Form.Label>Notas</Form.Label>
            <Form.Control
              as='textarea'
              rows={3}
              name='notas'
              value={formData.notas}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant='secondary' onClick={onHide}>
          Cancelar
        </Button>
        <Button onClick={handleGuardar}>Crear Cita</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NuevaCitaModal;
