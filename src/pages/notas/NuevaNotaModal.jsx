import { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { crearNota, editarNota } from '../../api/notas';
import '../../styles/nuevaNotaModal.scss';

export default function NuevaNotaModal({ show, onHide, paciente, nota, onSuccess }) {
  const isEdit = Boolean(nota?._id);

  const pacienteId = paciente?._id || nota?.paciente?._id;

  const pacienteNombre = useMemo(() => {
    return paciente?.nombreCompleto || nota?.paciente?.nombreCompleto || 'Paciente no seleccionado';
  }, [paciente, nota]);

  const pacienteDoc = useMemo(() => {
    return paciente?.numeroDocumento || nota?.paciente?.numeroDocumento || '';
  }, [paciente, nota]);

  const toInputDate = (dateValue) => {
    if (!dateValue) return '';
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [formData, setFormData] = useState({
    fechaSesion: '',
    observaciones: '',
    diagnostico: '',
    planTratamiento: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Cargar valores en edición / reset en nuevo
  useEffect(() => {
    if (!show) return;

    setErrorMsg('');

    if (isEdit) {
      setFormData({
        fechaSesion: toInputDate(nota?.fechaSesion || nota?.createdAt),
        observaciones: nota?.observaciones ?? '',
        diagnostico: nota?.diagnostico ?? '',
        planTratamiento: nota?.planTratamiento ?? '',
      });
    } else {
      setFormData({
        fechaSesion: toInputDate(new Date()),
        observaciones: '',
        diagnostico: '',
        planTratamiento: '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, isEdit, nota?._id]);

  const handleClose = () => {
    if (submitting) return;
    onHide?.();
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validate = () => {
    if (!pacienteId) return 'Selecciona un paciente antes de crear una nota.';
    if (!formData.fechaSesion) return 'La fecha de sesión es obligatoria.';

    const tieneContenido =
      String(formData.observaciones || '').trim() ||
      String(formData.diagnostico || '').trim() ||
      String(formData.planTratamiento || '').trim();

    if (!tieneContenido) {
      return 'La nota no puede estar vacía. Completa al menos Observaciones, Diagnóstico o Plan de tratamiento.';
    }

    return '';
  };

  const handleSubmit = async () => {
    setErrorMsg('');

    const err = validate();
    if (err) {
      setErrorMsg(err);
      return;
    }

    const payload = {
      paciente: pacienteId,
      fechaSesion: formData.fechaSesion,
      observaciones: formData.observaciones,
      diagnostico: formData.diagnostico,
      planTratamiento: formData.planTratamiento,
    };

    try {
      setSubmitting(true);

      if (isEdit) {
        await editarNota(nota._id, payload);
      } else {
        await crearNota(payload);
      }

      await onSuccess?.();
      onHide?.();
    } catch (error) {
      console.error('Error guardando nota:', error);
      const msg = error?.response?.data?.message || error?.message || 'Error guardando nota';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop='static' keyboard={!submitting}>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? 'Editar Nota Clínica' : 'Nueva Nota'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          {/* Paciente bloqueado */}
          <Form.Group className='mb-3'>
            <Form.Label>Paciente *</Form.Label>

            <div className='locked-field'>
              <div className='locked-main'>{pacienteNombre}</div>
              {pacienteDoc ? <div className='locked-sub'>Documento: {pacienteDoc}</div> : null}
            </div>
          </Form.Group>

          {/* Fecha */}
          <Form.Group className='mb-3'>
            <Form.Label>Fecha de Sesión *</Form.Label>
            <Form.Control
              type='date'
              name='fechaSesion'
              value={formData.fechaSesion}
              onChange={handleChange}
              required
            />
          </Form.Group>

          {/* Observaciones */}
          <Form.Group className='mb-3'>
            <Form.Label>Observaciones</Form.Label>
            <Form.Control
              as='textarea'
              rows={3}
              name='observaciones'
              value={formData.observaciones}
              onChange={handleChange}
              placeholder='Descripción de la sesión, comportamiento del paciente, etc.'
            />
          </Form.Group>

          {/* Diagnóstico */}
          <Form.Group className='mb-3'>
            <Form.Label>Diagnóstico</Form.Label>
            <Form.Control
              as='textarea'
              rows={3}
              name='diagnostico'
              value={formData.diagnostico}
              onChange={handleChange}
              placeholder='Diagnóstico clínico o evaluación'
            />
          </Form.Group>

          {/* Plan */}
          <Form.Group className='mb-2'>
            <Form.Label>Plan de Tratamiento</Form.Label>
            <Form.Control
              as='textarea'
              rows={3}
              name='planTratamiento'
              value={formData.planTratamiento}
              onChange={handleChange}
              placeholder='Plan de acción, próximos pasos, recomendaciones'
            />
          </Form.Group>

          {errorMsg ? <div className='form-error mt-3'>{errorMsg}</div> : null}
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant='secondary' onClick={handleClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
