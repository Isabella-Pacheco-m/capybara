import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { profileService } from '../../services/ProfileService';
import { networkingService } from '../../services/networkingService';
import SlotRequestModal from '../../components/SlotRequestModal';
import NetworkingPanel from '../../components/NetworkingPanel';
import ProfileCard from '../../components/ProfileCard';
import MyAvailabilityPanel from '../../components/MyAvailabilityPanel';

export default function EventDirectory() {
  const { eventCode } = useParams();
  
  const [event, setEvent] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProfile, setEditingProfile] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showNetworkingPanel, setShowNetworkingPanel] = useState(false);
  const [showAvailabilityPanel, setShowAvailabilityPanel] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    loadEvent();
  }, [eventCode]);

  const loadEvent = async () => {
    try {
      const data = await profileService.getEventPublic(eventCode);
      setEvent(data);
    } catch (error) {
      console.error('Error cargando evento:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDirectory = async () => {
    try {
      const directoryData = await profileService.getDirectory(eventCode, accessCode);
      const myProfile = await profileService.getProfile(eventCode, accessCode);
      if (directoryData.event) {
        setEvent(directoryData.event);
      }
      setProfiles(directoryData.profiles || []);
      setCurrentProfile(myProfile);
    } catch (error) {
      console.error('Error cargando directorio:', error);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setVerifying(true);
    try {
      await profileService.verifyAccessCode(eventCode, accessCode);
      await loadDirectory();
      setAuthenticated(true);
    } catch (error) {
      console.error('Error verificando código:', error);
      alert('Código de acceso inválido');
    } finally {
      setVerifying(false);
    }
  };

  const handleEditClick = (profile) => {
    setEditingProfile(profile.id);
    setEditFormData({
      full_name: profile.full_name,
      position: profile.position,
      company_name: profile.company_name,
      bio: profile.bio || '',
      phone: profile.phone || '',
      linkedin_url: profile.linkedin_url || '',
      interests: profile.interests || [],
      photo: null
    });
    setPhotoPreview(profile.photo_url);
  };

  const handleCancelEdit = () => {
    setEditingProfile(null);
    setEditFormData(null);
    setPhotoPreview(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditFormData({ ...editFormData, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updated = await profileService.updateProfile(eventCode, accessCode, editFormData);
      setCurrentProfile(updated);
      setProfiles(profiles.map(p => p.id === updated.id ? updated : p));
      setEditingProfile(null);
      setEditFormData(null);
      setPhotoPreview(null);
      alert('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      alert('Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAvailability = async (selectedSlots) => {
    try {
      await profileService.updateAvailability(eventCode, accessCode, selectedSlots);
      await loadDirectory();
    } catch (error) {
      console.error('Error actualizando disponibilidad:', error);
      throw error;
    }
  };

  const handleSlotClick = (profile, slot) => {
    setSelectedProfile(profile);
    setSelectedSlot(slot);
  };

  const handleRequestSlot = async (profileId, timeSlot, message) => {
    try {
      await networkingService.requestSlot(eventCode, accessCode, profileId, timeSlot, message);
      await loadDirectory();
      alert('Solicitud enviada exitosamente');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error al enviar solicitud';
      throw new Error(errorMsg);
    }
  };

  const getAcceptedMeetingWithProfile = (profileId) => {
    if (!currentProfile) return null;
    
    const receivedAccepted = currentProfile.networking_slots_received?.find(
      slot => slot.requester === profileId && slot.status === 'accepted'
    );
    if (receivedAccepted) return receivedAccepted;
    
    const sentAccepted = currentProfile.networking_slots_sent?.find(
      slot => slot.profile === profileId && slot.status === 'accepted'
    );
    return sentAccepted || null;
  };

  const filteredProfiles = profiles.filter(profile => 
    profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando evento...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center bg-white rounded-3xl shadow-xl p-12 max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Evento no encontrado</h2>
          <p className="text-gray-600">Verifica el enlace e intenta nuevamente</p>
        </div>
      </div>
    );
  }

  const brandColors = {
    primary: event.company_details?.primary_color || event.company?.primary_color || '#3B82F6',
    secondary: event.company_details?.secondary_color || event.company?.secondary_color || '#1E40AF',
    accent: event.company_details?.accent_color || event.company?.accent_color || '#60A5FA'
  };

  const companyLogo = event.company_details?.logo_url || event.company?.logo_url || null;
  const companyName = event.company_name || event.company_details?.name || event.company?.name || '';

  if (!authenticated) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${brandColors.primary}08 0%, ${brandColors.secondary}05 50%, ${brandColors.accent}08 100%)`
        }}
      >
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl" style={{ backgroundColor: `${brandColors.primary}20` }}></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: `${brandColors.accent}20` }}></div>
        </div>

        <div className="max-w-md w-full relative z-10">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm border border-gray-100">
            <div 
              className="px-8 py-12 text-white text-center relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`
              }}
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-white rounded-full -ml-30 -mb-30"></div>
              </div>

              <div className="relative z-10">
                {companyLogo && (
                  <div className="mb-6 animate-fade-in">
                    <img 
                      src={companyLogo} 
                      alt={companyName}
                      className="h-16 object-contain mx-auto bg-white rounded-xl px-6 py-3 shadow-lg"
                    />
                  </div>
                )}
                <h1 className="text-3xl font-bold mb-2 animate-slide-up">{event.name}</h1>
                <p className="opacity-90 text-lg animate-slide-up" style={{ animationDelay: '100ms' }}>{companyName}</p>
              </div>
            </div>

            <div onSubmit={handleVerifyCode} className="p-8 space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceder al Directorio</h2>
                <p className="text-gray-600">Ingresa tu código de acceso personal</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Código de Acceso</label>
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  required
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition text-center text-lg font-mono tracking-wider hover:border-gray-300"
                  placeholder="XXXX-XXX-XXX"
                  maxLength={20}
                  style={{ '--tw-ring-color': brandColors.primary }}
                />
              </div>

              <button
                type="submit"
                disabled={verifying}
                onClick={handleVerifyCode}
                className="w-full text-white font-bold py-4 px-6 rounded-xl transition disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                style={{
                  background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`
                }}
              >
                {verifying ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verificando...
                  </span>
                ) : 'Acceder al Directorio'}
              </button>

              <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  ¿No tienes código? <a href={`/register/${eventCode}`} className="font-semibold hover:underline transition" style={{ color: brandColors.primary }}>Regístrate aquí</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pendingRequests = currentProfile?.networking_slots_received?.filter(
    slot => slot.status === 'pending'
  ).length || 0;

  return (
    <>
      <div 
        className="min-h-screen relative"
        style={{
          background: `linear-gradient(135deg, ${brandColors.primary}08 0%, ${brandColors.secondary}05 50%, ${brandColors.accent}08 100%)`
        }}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: `${brandColors.primary}15` }}></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: `${brandColors.accent}15` }}></div>
        </div>

        <div 
          className="relative overflow-hidden shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`
          }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-[32rem] h-[32rem] bg-white rounded-full -ml-64 -mb-64"></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white rounded-full"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0 mb-6 md:mb-8">
              <div className="flex items-center space-x-4 md:space-x-6">
                {companyLogo && (
                  <img 
                    src={companyLogo} 
                    alt={companyName}
                    className="h-12 md:h-16 object-contain bg-white rounded-xl md:rounded-2xl px-4 md:px-6 py-2 md:py-3 shadow-lg flex-shrink-0"
                  />
                )}
                <div className="text-white min-w-0">
                  <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2 truncate">{event.name}</h1>
                  <p className="text-base md:text-xl opacity-90 truncate">{companyName}</p>
                </div>
              </div>
              
              <div className="flex items-stretch space-x-3 md:space-x-4">
                <div className="flex-1 md:flex-none bg-white rounded-xl md:rounded-2xl px-6 md:px-8 py-3 md:py-4 shadow-lg flex flex-col justify-center items-center min-w-[100px]">
                  <p className="text-gray-600 text-xs md:text-sm font-semibold">Participantes</p>
                  <p className="text-2xl md:text-4xl font-bold" style={{ color: brandColors.primary }}>{profiles.length}</p>
                </div>
                <button
                  onClick={() => setShowAvailabilityPanel(!showAvailabilityPanel)}
                  className="relative bg-white rounded-xl md:rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center px-4 md:px-0 md:w-16 md:h-16"
                  title="Mi disponibilidad"
                >
                  <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: brandColors.primary }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <button
                  onClick={() => setShowNetworkingPanel(!showNetworkingPanel)}
                  className="relative bg-white rounded-xl md:rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center px-4 md:px-0 md:w-16 md:h-16"
                  title="Solicitudes de networking"
                >
                  <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: brandColors.primary }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {pendingRequests > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 md:-top-2 md:-right-2 flex items-center justify-center w-5 h-5 md:w-7 md:h-7 text-[10px] md:text-xs font-bold text-white rounded-full shadow-lg"
                      style={{ 
                        backgroundColor: brandColors.accent
                      }}
                    >
                      {pendingRequests > 9 ? '9+' : pendingRequests}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="relative mt-4 md:mt-0">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, empresa o cargo..."
                className="w-full px-4 md:px-6 py-3 md:py-4 pl-11 md:pl-14 bg-white bg-opacity-95 backdrop-blur-sm border-2 border-white border-opacity-50 rounded-xl md:rounded-2xl focus:ring-2 focus:border-transparent transition text-base md:text-lg shadow-xl placeholder-gray-500"
                style={{ '--tw-ring-color': 'white' }}
              />
              <svg 
                className="absolute left-3 md:left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 md:right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 relative z-10">
          {filteredProfiles.length === 0 ? (
            <div className="bg-white rounded-2xl md:rounded-3xl p-8 md:p-16 text-center shadow-lg">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                <svg className="w-8 h-8 md:w-12 md:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-600 text-base md:text-lg">No se encontraron participantes</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-start">
              {filteredProfiles.map(profile => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  isCurrentUser={currentProfile && profile.id === currentProfile.id}
                  brandColors={brandColors}
                  onEditClick={handleEditClick}
                  onSlotClick={handleSlotClick}
                  isEditing={editingProfile === profile.id}
                  editFormData={editFormData}
                  photoPreview={photoPreview}
                  saving={saving}
                  onEditInputChange={handleEditInputChange}
                  onPhotoChange={handlePhotoChange}
                  onSaveProfile={handleSaveProfile}
                  onCancelEdit={handleCancelEdit}
                  acceptedMeeting={getAcceptedMeetingWithProfile(profile.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showAvailabilityPanel && (
        <div className="fixed inset-0 z-[9999] animate-fade-in">
          <div 
            className="absolute inset-0 backdrop-blur-sm transition-all duration-300"
            style={{ backgroundColor: `${brandColors.primary}15` }}
            onClick={() => setShowAvailabilityPanel(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full md:w-auto animate-slide-in-right">
            <MyAvailabilityPanel
              currentProfile={currentProfile}
              event={event}
              brandColors={brandColors}
              onClose={() => setShowAvailabilityPanel(false)}
              onUpdate={handleUpdateAvailability}
            />
          </div>
        </div>
      )}

      {showNetworkingPanel && (
        <div className="fixed inset-0 z-[9999] animate-fade-in">
          <div 
            className="absolute inset-0 backdrop-blur-sm transition-all duration-300"
            style={{ backgroundColor: `${brandColors.primary}15` }}
            onClick={() => setShowNetworkingPanel(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full md:w-auto animate-slide-in-right">
            <NetworkingPanel
              currentProfile={currentProfile}
              eventCode={eventCode}
              accessCode={accessCode}
              brandColors={brandColors}
              onUpdate={loadDirectory}
            />
          </div>
        </div>
      )}

      {selectedProfile && selectedSlot && (
        <SlotRequestModal
          profile={selectedProfile}
          selectedSlot={selectedSlot}
          onClose={() => {
            setSelectedProfile(null);
            setSelectedSlot(null);
          }}
          onSubmit={handleRequestSlot}
          brandColors={brandColors}
        />
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
      `}</style>
    </>
  );
}