// src/components/configuracion/TabsConfiguracion.jsx

export default function TabsConfiguracion({ activeTab, onChange }) {
  return (
    <div className='config-tabs'>
      <button
        type='button'
        className={`config-tab ${activeTab === 'perfil' ? 'active' : ''}`}
        onClick={() => onChange('perfil')}
      >
        <i className='bi bi-person config-tab-icon' />
        Perfil Personal
      </button>

      <button
        type='button'
        className={`config-tab ${activeTab === 'organizacion' ? 'active' : ''}`}
        onClick={() => onChange('organizacion')}
      >
        <i className='bi bi-building config-tab-icon' />
        Organización
      </button>

      <button
        type='button'
        className={`config-tab ${activeTab === 'seguridad' ? 'active' : ''}`}
        onClick={() => onChange('seguridad')}
      >
        <i className='bi bi-shield-lock config-tab-icon' />
        Seguridad
      </button>
    </div>
  );
}
