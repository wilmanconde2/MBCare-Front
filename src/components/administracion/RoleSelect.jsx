// src/components/administracion/RoleSelect.jsx

const ROLES = ['Profesional', 'Asistente'];

export default function RoleSelect({ value, onChange, disabled }) {
  const safeValue = value === 'Fundador' ? 'Fundador' : value || 'Asistente';

  return (
    <select
      className='admin-role-select'
      value={safeValue}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || value === 'Fundador'}
    >
      {value === 'Fundador' && <option value='Fundador'>Fundador</option>}

      {ROLES.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}
