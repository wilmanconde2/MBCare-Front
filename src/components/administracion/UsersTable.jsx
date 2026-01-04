// src/components/administracion/UsersTable.jsx

import UserRow from './UserRow';

export default function UsersTable({
  usuarios,
  loading,
  canToggle,
  canChangeRole,
  onToggleEstado,
  onChangeRol,
}) {
  if (loading) return <p className='empty-state'>Cargando usuarios...</p>;
  if (!usuarios.length) return null;

  return (
    <table className='pacientes-table admin-table'>
      <thead>
        <tr>
          <th>Nombre</th>
          <th className='hide-mobile'>Email</th>
          <th className='text-center'>Estado</th>
          <th>Rol</th>
          <th className='text-center'>Acciones</th>
        </tr>
      </thead>

      <tbody>
        {usuarios.map((u) => (
          <UserRow
            key={u._id}
            user={u}
            canToggle={canToggle}
            canChangeRole={canChangeRole}
            onToggleEstado={onToggleEstado}
            onChangeRol={onChangeRol}
          />
        ))}
      </tbody>
    </table>
  );
}
