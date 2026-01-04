// src/pages/configuracion/Configuracion.jsx

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

import '../../styles/configuracion.scss';

import TabsConfiguracion from '../../components/configuracion/TabsConfiguracion';
import PerfilPersonalTab from '../../components/configuracion/PerfilPersonalTab';
import OrganizacionTab from '../../components/configuracion/OrganizacionTab';
import SeguridadTab from '../../components/configuracion/SeguridadTab';

import { getConfiguracionRequest } from '../../api/configuracion.api';

export default function Configuracion() {
  const { user, org, updateOrgNombreLocal } = useAuth();

  const rol = user?.rol;
  const isFundador = useMemo(() => rol === 'Fundador', [rol]);

  const [activeTab, setActiveTab] = useState('perfil'); // perfil | organizacion | seguridad
  const [loading, setLoading] = useState(true);

  const [orgData, setOrgData] = useState({
    nombre: org?.nombre || '',
    industria: org?.industria || '',
  });

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const res = await getConfiguracionRequest();

        const payload = res.data?.organizacion;
        if (mounted && payload) {
          setOrgData({
            nombre: payload.nombre || '',
            industria: payload.industria || '',
          });

          // Sincroniza nombre org en topbar si vino actualizado
          if (payload.nombre && payload.nombre !== org?.nombre) {
            updateOrgNombreLocal(payload.nombre);
          }
        }
      } catch {
        // si falla, igual renderiza con lo que hay en context
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className='config-page'>
      <div className='config-header'>
        <h3 className='config-title'>Configuración</h3>
        <p className='config-subtitle'>Administra tu perfil, organización y seguridad.</p>
      </div>

      <div className='config-card'>
        <TabsConfiguracion activeTab={activeTab} onChange={setActiveTab} />

        <div className='config-content'>
          {loading ? (
            <div className='config-loading'>Cargando...</div>
          ) : (
            <>
              {activeTab === 'perfil' && <PerfilPersonalTab />}

              {activeTab === 'organizacion' && (
                <OrganizacionTab
                  isFundador={isFundador}
                  orgData={orgData}
                  setOrgData={setOrgData}
                />
              )}

              {activeTab === 'seguridad' && <SeguridadTab />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
