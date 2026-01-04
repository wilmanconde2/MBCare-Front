// src/components/configuracion/TabsConfiguracion.jsx

export default function TabsConfiguracion({ activeTab, onChange }) {
  return (
    <div className='config-tabs'>
      <button
        type='button'
        className={`config-tab ${activeTab === 'perfil' ? 'active' : ''}`}
        onClick={() => onChange('perfil')}
      >
        Perfil personal
      </button>

      <button
        type='button'
        className={`config-tab ${activeTab === 'organizacion' ? 'active' : ''}`}
        onClick={() => onChange('organizacion')}
      >
        Organización
      </button>

      <button
        type='button'
        className={`config-tab ${activeTab === 'seguridad' ? 'active' : ''}`}
        onClick={() => onChange('seguridad')}
      >
        Seguridad
      </button>
    </div>
  );
}
