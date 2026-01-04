// src/components/administracion/UserRow.jsx

import StatusBadge from './StatusBadge';
import RoleSelect from './RoleSelect';

export default function UserRow({ user, canToggle, canChangeRole, onToggleEstado, onChangeRol }) {
  const isFundadorTarget = user.rol === 'Fundador';

  const disableRole = isFundadorTarget || !canChangeRole;
  const disableToggle = isFundadorTarget || !canToggle;

  const actionIcon = user.activo ? 'bi-person-dash' : 'bi-person-check';
  const actionTitle = user.activo ? 'Desactivar' : 'Activar';

  return (
    <tr>
      <td className='td-main'>
        {user.nombre}
        <br />
        <small className='text-muted paciente-doc-mobile'>{user.email}</small>

        <br />
        <small className='text-muted admin-role-mobile'>
          Rol: <strong>{user.rol}</strong>
        </small>
      </td>

      <td className='hide-mobile'>{user.email}</td>

      <td className='text-center'>
        <StatusBadge activo={user.activo} />
      </td>

      <td>
        <RoleSelect
          value={user.rol}
          disabled={disableRole}
          onChange={(rol) => onChangeRol(user._id, rol)}
        />
      </td>

      <td className='text-center'>
        <i
          className={`bi ${actionIcon} admin-action-icon ${
            disableToggle ? 'text-muted' : 'text-primary'
          }`}
          onClick={() => (!disableToggle ? onToggleEstado(user._id) : null)}
          title={actionTitle}
          style={{
            pointerEvents: disableToggle ? 'none' : 'auto',
            opacity: disableToggle ? 0.5 : 1,
          }}
        ></i>
      </td>
    </tr>
  );
}
