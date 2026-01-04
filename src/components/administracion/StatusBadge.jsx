// src/components/administracion/StatusBadge.jsx

export default function StatusBadge({ activo }) {
  return (
    <span className={`admin-badge ${activo ? 'is-active' : 'is-inactive'}`}>
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  );
}
