// src/components/configuracion/OrganizacionTab.jsx

import Swal from 'sweetalert2';
import { updateNombreOrganizacionRequest } from '../../api/configuracion.api';
import { useAuth } from '../../context/AuthContext';

export default function OrganizacionTab({ isFundador, orgData, setOrgData }) {
  const { updateOrgNombreLocal } = useAuth();

  const onSave = async (e) => {
    e.preventDefault();

    if (!isFundador) return;

    try {
      const nombre = (orgData.nombre || '').trim();

      if (!nombre) {
        await Swal.fire('Error', 'El nombre de la organización es obligatorio.', 'error');
        return;
      }

      const res = await updateNombreOrganizacionRequest(nombre);
      const updated = res.data?.organizacion?.nombre || nombre;

      setOrgData((prev) => ({ ...prev, nombre: updated }));
      updateOrgNombreLocal(updated);

      await Swal.fire('Listo', 'Nombre de la organización actualizado.', 'success');
    } catch (error) {
      await Swal.fire(
        'Error',
        error.response?.data?.message || 'No se pudo actualizar la organización.',
        'error',
      );
    }
  };

  return (
    <div className='config-section'>
      <h4 className='config-section-title'>Organización</h4>

      <form className='config-form' onSubmit={onSave}>
        <div className='config-field'>
          <label className='config-label'>Nombre de la clínica / organización</label>
          <input
            className='config-input'
            value={orgData.nombre}
            disabled={!isFundador}
            onChange={(e) => setOrgData((prev) => ({ ...prev, nombre: e.target.value }))}
            placeholder='Nombre de la organización'
          />
          {!isFundador && (
            <small className='config-help'>
              Solo el Fundador puede editar el nombre de la organización.
            </small>
          )}
        </div>

        <div className='config-field'>
          <label className='config-label'>Industria</label>
          <input className='config-input' value={orgData.industria} disabled readOnly />
          <small className='config-help'>La industria es solo lectura.</small>
        </div>

        {isFundador && (
          <div className='config-actions'>
            <button className='config-btn primary' type='submit'>
              Guardar
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
