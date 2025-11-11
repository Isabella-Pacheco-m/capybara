import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import EventModal from '../../components/EventModal';
import { eventService } from '../../services/eventService';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAllEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error cargando eventos:', error);
      alert('Error al cargar los eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingEvent) {
        await eventService.updateEvent(editingEvent.id, formData);
        alert('Evento actualizado exitosamente');
      } else {
        await eventService.createEvent(formData);
        alert('Evento creado exitosamente');
      }
      setShowModal(false);
      setEditingEvent(null);
      loadEvents();
    } catch (error) {
      console.error('Error guardando evento:', error);
      const errorMsg = error.response?.data?.end_date?.[0] || 'Error al guardar el evento';
      alert(errorMsg);
    }
  };

  const handleEdit = async (event) => {
    try {
      const fullEvent = await eventService.getEvent(event.id);
      setEditingEvent(fullEvent);
      setShowModal(true);
    } catch (error) {
      console.error('Error cargando evento:', error);
      alert('Error al cargar el evento');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este evento?')) {
      try {
        await eventService.deleteEvent(id);
        alert('Evento eliminado exitosamente');
        loadEvents();
      } catch (error) {
        console.error('Error eliminando evento:', error);
        alert('Error al eliminar el evento');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEvent(null);
  };

  const copyRegistrationLink = (eventCode) => {
    const link = `${frontendUrl}/register/${eventCode}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(eventCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const openRegistrationLink = (eventCode) => {
    const link = `${frontendUrl}/register/${eventCode}`;
    window.open(link, '_blank');
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Eventos</h2>
            <p className="text-gray-600 mt-1">Gestiona los eventos organizados</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl transition shadow-lg flex items-center space-x-2 font-semibold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Nuevo Evento</span>
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Cargando eventos...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No hay eventos registrados</h3>
            <p className="text-gray-600 mb-6">Comienza creando tu primer evento</p>
            <button onClick={() => setShowModal(true)} className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold">
              <span>Crear el primer evento</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{event.event_code}</span>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${event.is_active ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                        {event.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                      {event.is_upcoming && (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">Próximo</span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition">{event.name}</h3>
                    <p className="text-sm text-gray-600 font-medium">{event.company_name}</p>
                  </div>
                </div>

                {event.description && (
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">{event.description}</p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-600">{formatDate(event.start_date)} - {formatDate(event.end_date)}</span>
                  </div>

                  {event.start_time && event.end_time && (
                    <div className="flex items-center space-x-2 text-sm">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-600">{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
                    </div>
                  )}

                  {event.networking_hours > 0 && (
                    <div className="flex items-center space-x-2 text-sm">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-gray-600">{event.networking_hours} {event.networking_hours === 1 ? 'hora' : 'horas'} de networking</span>
                    </div>
                  )}

                  {event.location && (
                    <div className="flex items-center space-x-2 text-sm">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-gray-600">{event.location}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-sm pt-2 border-t border-gray-100">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-gray-600">{event.profiles_count} {event.profiles_count === 1 ? 'participante' : 'participantes'}</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700">Enlace de Registro</span>
                    <button onClick={() => copyRegistrationLink(event.event_code)} className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1">
                      {copiedCode === event.event_code ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                  <code className="text-xs text-gray-600 break-all block">{frontendUrl}/register/{event.event_code}</code>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => openRegistrationLink(event.event_code)} className="col-span-3 flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 rounded-xl transition font-semibold">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>Abrir Formulario</span>
                  </button>
                  <button onClick={() => handleEdit(event)} className="col-span-2 flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition font-semibold">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Editar</span>
                  </button>
                  <button onClick={() => handleDelete(event.id)} className="flex items-center justify-center px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition font-semibold">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EventModal isOpen={showModal} onClose={handleCloseModal} onSubmit={handleSubmit} event={editingEvent} />
    </DashboardLayout>
  );
}