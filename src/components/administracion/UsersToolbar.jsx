// src/components/administracion/UsersToolbar.jsx

export default function UsersToolbar({ filtro, onChangeFiltro }) {
  return (
    <div className='admin-filter'>
      <select
        className='admin-select'
        value={filtro}
        onChange={(e) => onChangeFiltro(e.target.value)}
      >
        <option value='all'>Todos</option>
        <option value='activos'>Solo activos</option>
        <option value='inactivos'>Solo inactivos</option>
      </select>
    </div>
  );
}
