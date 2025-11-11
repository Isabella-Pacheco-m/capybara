import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { profileAdminService } from '../../services/profileAdminService';
import { eventService } from '../../services/eventService';

export default function Profiles() {
  const [profiles, setProfiles] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      loadProfilesByEvent(selectedEvent);
    } else {
      loadProfiles();
    }
  }, [selectedEvent]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profilesData, eventsData] = await Promise.all([
        profileAdminService.getAllProfiles(),
        eventService.getAllEvents(),
      ]);
      setProfiles(profilesData);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await profileAdminService.getAllProfiles();
      setProfiles(data);
    } catch (error) {
      console.error('Error cargando perfiles:', error);
      alert('Error al cargar los perfiles');
    } finally {
      setLoading(false);
    }
  };

  const loadProfilesByEvent = async (eventId) => {
    try {
      setLoading(true);
      const data = await profileAdminService.getProfilesByEvent(eventId);
      setProfiles(data);
    } catch (error) {
      console.error('Error cargando perfiles:', error);
      alert('Error al cargar los perfiles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, profileName) => {
    if (window.confirm(`¿Estás seguro de eliminar el perfil de ${profileName}?`)) {
      try {
        await profileAdminService.deleteProfile(id);
        alert('Perfil eliminado exitosamente');
        if (selectedEvent) {
          loadProfilesByEvent(selectedEvent);
        } else {
          loadProfiles();
        }
      } catch (error) {
        console.error('Error eliminando perfil:', error);
        alert('Error al eliminar el perfil');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const filteredProfiles = profiles.filter(profile => {
    const searchLower = searchTerm.toLowerCase();
    return (
      profile.full_name.toLowerCase().includes(searchLower) ||
      profile.email.toLowerCase().includes(searchLower) ||
      profile.company_name.toLowerCase().includes(searchLower) ||
      profile.position.toLowerCase().includes(searchLower) ||
      profile.event_name?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Perfiles</h2>
            <p className="text-gray-600 mt-1">Gestiona los perfiles registrados en eventos</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-semibold">
              {filteredProfiles.length} {filteredProfiles.length === 1 ? 'perfil' : 'perfiles'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filtrar por Evento
              </label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="">Todos los eventos</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name} ({event.event_code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, email, empresa..."
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <svg 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Cargando perfiles...</p>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No hay perfiles registrados</h3>
            <p className="text-gray-600">Los perfiles aparecerán cuando los usuarios se registren en los eventos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredProfiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {profile.photo_url ? (
                      <img 
                        src={profile.photo_url} 
                        alt={profile.full_name}
                        className="w-20 h-20 rounded-full object-cover border-4 border-gray-100"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                        {profile.full_name.charAt(0)}
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {profile.full_name}
                        </h3>
                        {profile.code_verified && (
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                            Verificado
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center space-x-2 text-sm">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="text-gray-600 font-medium">{profile.position}</span>
                          <span className="text-gray-400">·</span>
                          <span className="text-blue-600 font-medium">{profile.company_name}</span>
                        </div>

                        <div className="flex items-center space-x-2 text-sm">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <a href={`mailto:${profile.email}`} className="text-gray-600 hover:text-blue-600 transition">
                            {profile.email}
                          </a>
                        </div>

                        {profile.phone && (
                          <div className="flex items-center space-x-2 text-sm">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <a href={`tel:${profile.phone}`} className="text-gray-600 hover:text-blue-600 transition">
                              {profile.phone}
                            </a>
                          </div>
                        )}

                        {profile.linkedin_url && (
                          <div className="flex items-center space-x-2 text-sm">
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                            </svg>
                            <a 
                              href={profile.linkedin_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 transition"
                            >
                              Ver perfil de LinkedIn
                            </a>
                          </div>
                        )}
                      </div>

                      {profile.bio && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                          {profile.bio}
                        </p>
                      )}

                      {profile.interests && profile.interests.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {profile.interests.map((interest, index) => (
                            <span
                              key={index}
                              className="text-xs px-3 py-1 rounded-full font-medium bg-blue-50 text-blue-600"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center space-x-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-2 text-sm">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-gray-600">{profile.event_name}</span>
                        </div>

                        <div className="flex items-center space-x-2 text-sm">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <code className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded">
                            {profile.access_code}
                          </code>
                        </div>

                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{formatDate(profile.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(profile.id, profile.full_name)}
                    className="ml-4 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition"
                  >
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
    </DashboardLayout>
  );
}