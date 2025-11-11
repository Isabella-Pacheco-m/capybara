import { useState } from 'react';
import { networkingService } from '../services/networkingService';

export default function NetworkingPanel({ 
  currentProfile, 
  eventCode, 
  accessCode, 
  brandColors,
  onUpdate
}) {
  const [activeTab, setActiveTab] = useState('received');
  const [processing, setProcessing] = useState(false);

  const receivedRequests = currentProfile?.networking_slots_received || [];
  const sentRequests = currentProfile?.networking_slots_sent || [];
  
  const pendingReceived = receivedRequests.filter(slot => slot.status === 'pending');

  const handleAccept = async (slotId) => {
    if (!confirm('¿Aceptar esta solicitud de conexión?')) return;
    
    setProcessing(true);
    try {
      await networkingService.acceptSlot(eventCode, accessCode, slotId);
      await onUpdate();
      alert('Solicitud aceptada');
    } catch (error) {
      alert('Error al aceptar solicitud');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (slotId) => {
    if (!confirm('¿Rechazar esta solicitud de conexión?')) return;
    
    setProcessing(true);
    try {
      await networkingService.rejectSlot(eventCode, accessCode, slotId);
      await onUpdate();
      alert('Solicitud rechazada');
    } catch (error) {
      alert('Error al rechazar solicitud');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async (slotId) => {
    if (!confirm('¿Cancelar esta solicitud?')) return;
    
    setProcessing(true);
    try {
      await networkingService.cancelSlot(eventCode, accessCode, slotId);
      await onUpdate();
      alert('Solicitud cancelada');
    } catch (error) {
      alert('Error al cancelar solicitud');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: '#FEF3C7', text: '#92400E', label: 'Pendiente' },
      accepted: { bg: '#D1FAE5', text: '#065F46', label: 'Aceptada' },
      rejected: { bg: '#FEE2E2', text: '#991B1B', label: 'Rechazada' },
      cancelled: { bg: '#F3F4F6', text: '#374151', label: 'Cancelada' },
    };
    
    const style = styles[status] || styles.pending;
    
    return (
      <span 
        className="px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        {style.label}
      </span>
    );
  };

  return (
    <div className="h-full w-full md:w-[28rem] bg-white shadow-2xl overflow-y-auto">
      <div 
        className="p-8 text-white sticky top-0 z-10 backdrop-blur-sm"
        style={{
          background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-3xl font-bold">Networking</h2>
          {pendingReceived.length > 0 && (
            <div className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-xl">
              <span className="text-sm font-bold">{pendingReceived.length} nueva{pendingReceived.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        <p className="text-sm opacity-90">Gestiona tus conexiones del evento</p>
      </div>

      <div className="p-6">
        <div className="flex space-x-2 mb-6 bg-gray-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
              activeTab === 'received' 
                ? 'text-white shadow-lg transform scale-[1.02]' 
                : 'text-gray-600 hover:bg-gray-200'
            }`}
            style={activeTab === 'received' ? { 
              background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`
            } : {}}
          >
            <span>Recibidas</span>
            {pendingReceived.length > 0 && activeTab !== 'received' && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {pendingReceived.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
              activeTab === 'sent' 
                ? 'text-white shadow-lg transform scale-[1.02]' 
                : 'text-gray-600 hover:bg-gray-200'
            }`}
            style={activeTab === 'sent' ? { 
              background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`
            } : {}}
          >
            Enviadas
          </button>
        </div>

        {activeTab === 'received' && (
          <div className="space-y-4">
            {receivedRequests.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">No hay solicitudes recibidas</p>
                <p className="text-gray-400 text-sm mt-1">Aparecerán aquí cuando alguien solicite conectar</p>
              </div>
            ) : (
              receivedRequests.map((slot) => (
                <div 
                  key={slot.id} 
                  className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border-2 border-gray-100 hover:border-gray-200 transition-all hover:shadow-md"
                >
                  <div className="flex items-start space-x-3 mb-4">
                    {slot.requester_photo ? (
                      <img 
                        src={slot.requester_photo} 
                        alt={slot.requester_name}
                        className="w-14 h-14 rounded-2xl object-cover shadow-md"
                      />
                    ) : (
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md"
                        style={{ backgroundColor: brandColors.primary }}
                      >
                        {slot.requester_name?.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-lg">{slot.requester_name}</p>
                      <p className="text-sm text-gray-600">{slot.requester_position}</p>
                      <p className="text-xs font-semibold mt-0.5" style={{ color: brandColors.primary }}>
                        {slot.requester_company}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: `${brandColors.primary}08` }}>
                    <div>
                      <p className="text-xs text-gray-500 mb-1 font-semibold">Horario propuesto</p>
                      <p className="font-bold text-xl" style={{ color: brandColors.primary }}>{slot.time_slot}</p>
                    </div>
                    {getStatusBadge(slot.status)}
                  </div>

                  {slot.message && (
                    <div className="mb-4 p-4 bg-white rounded-xl border-2 border-gray-100">
                      <p className="text-xs text-gray-500 mb-2 font-semibold">Mensaje</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{slot.message}</p>
                    </div>
                  )}

                  {slot.status === 'accepted' && (
                    <div className="mb-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                      <p className="text-xs font-bold text-green-800 mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Información de contacto
                      </p>
                      {slot.requester_email && (
                        <a 
                          href={`mailto:${slot.requester_email}`}
                          className="text-sm text-green-700 font-medium block mb-2 hover:underline flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {slot.requester_email}
                        </a>
                      )}
                      {slot.requester_phone && (
                        <a 
                          href={`tel:${slot.requester_phone}`}
                          className="text-sm text-green-700 font-medium block hover:underline flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {slot.requester_phone}
                        </a>
                      )}
                    </div>
                  )}

                  {slot.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAccept(slot.id)}
                        disabled={processing}
                        className="flex-1 py-3 text-white rounded-xl font-semibold disabled:opacity-50 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                        style={{ 
                          background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`
                        }}
                      >
                        ✓ Aceptar
                      </button>
                      <button
                        onClick={() => handleReject(slot.id)}
                        disabled={processing}
                        className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold disabled:opacity-50 hover:bg-gray-300 transition-all"
                      >
                        ✕ Rechazar
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'sent' && (
          <div className="space-y-4">
            {sentRequests.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">No has enviado solicitudes</p>
                <p className="text-gray-400 text-sm mt-1">Explora perfiles y solicita conexiones</p>
              </div>
            ) : (
              sentRequests.map((slot) => (
                <div 
                  key={slot.id} 
                  className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border-2 border-gray-100 hover:border-gray-200 transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-lg mb-1">{slot.profile_name}</p>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-bold" style={{ color: brandColors.primary }}>{slot.time_slot}</span>
                      </div>
                    </div>
                    {getStatusBadge(slot.status)}
                  </div>

                  {slot.message && (
                    <div className="mb-4 p-4 bg-white rounded-xl border-2 border-gray-100">
                      <p className="text-xs text-gray-500 mb-2 font-semibold">Tu mensaje</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{slot.message}</p>
                    </div>
                  )}

                  {slot.status === 'accepted' && (
                    <div className="mb-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                      <p className="text-xs font-bold text-green-800 mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        ¡Conexión confirmada!
                      </p>
                      {slot.profile_email && (
                        <a 
                          href={`mailto:${slot.profile_email}`}
                          className="text-sm text-green-700 font-medium block mb-2 hover:underline flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {slot.profile_email}
                        </a>
                      )}
                      {slot.profile_phone && (
                        <a 
                          href={`tel:${slot.profile_phone}`}
                          className="text-sm text-green-700 font-medium block hover:underline flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {slot.profile_phone}
                        </a>
                      )}
                    </div>
                  )}

                  {slot.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(slot.id)}
                      disabled={processing}
                      className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold disabled:opacity-50 hover:bg-gray-300 transition-all"
                    >
                      Cancelar solicitud
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}