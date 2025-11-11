import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { companyService } from '../../services/companyService';
import { eventService } from '../../services/eventService';

export default function Dashboard() {
  const [stats, setStats] = useState({
    companies: 0,
    events: 0,
    profiles: 0,
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar empresas y eventos en paralelo
      const [companies, events] = await Promise.all([
        companyService.getAllCompanies(),
        eventService.getAllEvents()
      ]);

      // Calcular total de perfiles sumando los profiles_count de cada evento
      const totalProfiles = events.reduce((sum, event) => sum + (event.profiles_count || 0), 0);

      setStats({
        companies: companies.length,
        events: events.length,
        profiles: totalProfiles,
      });

      // Ordenar eventos por fecha de inicio (más recientes primero) y tomar los 4 primeros
      const sortedEvents = events
        .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
        .slice(0, 4);
      
      setRecentEvents(sortedEvents);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Banner */}
        <div className="relative bg-gradient-to-br from-[#1a2cff] via-[#3b82f6] to-[#6ee7b7] rounded-3xl shadow-xl p-10 text-white overflow-hidden">
          <div className="absolute top-0 left-0 w-[20rem] h-[20rem] bg-[#60a5fa]/40 rounded-full -translate-x-1/2 -translate-y-1/2 blur-[120px]"></div>
          <div className="absolute bottom-0 right-0 w-[18rem] h-[18rem] bg-[#7dd3fc]/30 rounded-full translate-x-1/3 translate-y-1/3 blur-[100px]"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-3">Bienvenido al Dashboard</h2>
            <p className="text-blue-100 text-lg">
              Sistema de gestión y networking empresarial.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow-xl transition duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative z-10 flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Empresas
              </span>
            </div>
            <p className="text-5xl font-extrabold text-gray-900 mb-2">{stats.companies}</p>
            <p className="text-gray-600 text-sm">Empresas registradas</p>
          </div>

          <div className="group bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow-xl transition duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative z-10 flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                Eventos
              </span>
            </div>
            <p className="text-5xl font-extrabold text-gray-900 mb-2">{stats.events}</p>
            <p className="text-gray-600 text-sm">Eventos activos</p>
          </div>

          <div className="group bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow-xl transition duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative z-10 flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                Perfiles
              </span>
            </div>
            <p className="text-5xl font-extrabold text-gray-900 mb-2">{stats.profiles}</p>
            <p className="text-gray-600 text-sm">Usuarios registrados</p>
          </div>
        </div>

        {/* Recent Events Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Eventos Recientes</h3>
              <p className="text-gray-600 text-sm mt-1">Los últimos eventos creados</p>
            </div>
            <Link
              to="/admin/events"
              className="flex items-center space-x-2 text-green-600 hover:text-green-700 font-semibold text-sm"
            >
              <span>Ver todos</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mb-4"></div>
              <p className="text-gray-600">Cargando eventos...</p>
            </div>
          ) : recentEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">No hay eventos registrados aún</p>
              <Link
                to="/admin/events"
                className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 font-semibold"
              >
                <span>Crear primer evento</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {event.event_code}
                        </span>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            event.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {event.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                        {event.is_upcoming && (
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                            Próximo
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-green-600 transition">
                        {event.name}
                      </h4>
                      <p className="text-sm text-gray-600 font-medium">
                        {event.company_name}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-600">
                        {formatDate(event.start_date)}
                        {event.start_date !== event.end_date && ` - ${formatDate(event.end_date)}`}
                      </span>
                    </div>

                    {event.start_time && (
                      <div className="flex items-center space-x-2 text-sm">
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-600">{formatTime(event.start_time)}</span>
                      </div>
                    )}

                    {event.location && (
                      <div className="flex items-center space-x-2 text-sm">
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-gray-600 truncate">{event.location}</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 text-sm pt-2 border-t border-gray-100">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-gray-600">
                        {event.profiles_count} {event.profiles_count === 1 ? 'participante' : 'participantes'}
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/admin/events"
                    className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition font-semibold"
                  >
                    <span>Ver detalles</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}