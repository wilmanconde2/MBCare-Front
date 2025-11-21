import { useEffect, useState } from 'react';
import { getPacientes } from '../../api/pacientes';
import { useNavigate } from 'react-router-dom';

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadPacientes() {
      try {
        const res = await getPacientes(); // GET /pacientes
        setPacientes(res.data);
      } catch (error) {
        console.error('Error al cargar pacientes:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPacientes();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className='pacientes-page'>
      <h2 className='page-title'>Pacientes</h2>

      <div className='top-actions'>
        <button className='btn-new'>
          <i className='bi bi-plus-lg'></i>
          Nuevo Paciente
        </button>
      </div>

      <div className='pacientes-card'>
        <h3 className='card-title'>Lista de Pacientes</h3>

        <div className='table-wrapper'>
          <table className='pacientes-table'>
            <thead>
              <tr>
                <th>Nombre</th>
                <th className='hide-mobile'>Documento</th>
                <th>Teléfono</th>
                <th className='hide-mobile'>Email</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {pacientes.map((p) => (
                <tr key={p._id}>
                  <td>{p.nombreCompleto}</td>
                  <td className='hide-mobile'>{p.numeroDocumento}</td>
                  <td>{p.telefono || '-'}</td>
                  <td className='hide-mobile'>{p.email || '-'}</td>

                  <td className='actions'>
                    {/* VER DETALLE */}
                    <i
                      className='bi bi-eye view'
                      onClick={() => navigate(`/app/pacientes/${p._id}`)}
                    ></i>

                    {/* EDITAR */}
                    <i
                      className='bi bi-pencil edit'
                      onClick={() => navigate(`/app/pacientes/${p._id}/editar`)}
                    ></i>

                    {/* ELIMINAR */}
                    <i
                      className='bi bi-trash delete'
                      onClick={() => console.log('Eliminar', p._id)}
                    ></i>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
