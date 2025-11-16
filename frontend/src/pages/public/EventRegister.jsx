import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { profileService } from '../../services/ProfileService.js';

export default function EventRegister() {
  const { eventCode } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [interestInput, setInterestInput] = useState('');
  const [isExistingUser, setIsExistingUser] = useState(null);
  const [checkingUser, setCheckingUser] = useState(false);
  const [existingUserData, setExistingUserData] = useState({
    email: '',
    access_code: ''
  });
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    position: '',
    company_name: '',
    bio: '',
    phone: '',
    linkedin_url: '',
    interests: [],
    photo: null,
  });

  useEffect(() => {
    loadEvent();
  }, [eventCode]);

  const loadEvent = async () => {
    try {
      const data = await profileService.getEventPublic(eventCode);
      setEvent(data);
    } catch (error) {
      console.error('Error cargando evento:', error);
      alert('Evento no encontrado');
    } finally {
      setLoading(false);
    }
  };

  const handleExistingUserCheck = async () => {
    if (!existingUserData.email || !existingUserData.access_code) {
      alert('Por favor ingresa tu correo y código de acceso');
      return;
    }

    setCheckingUser(true);
    try {
      const response = await profileService.checkExistingUser(
        eventCode,
        existingUserData.email,
        existingUserData.access_code
      );
      
      if (response.exists) {
        const profile = response.profile;
        setFormData({
          full_name: profile.full_name,
          email: existingUserData.email,
          position: profile.position,
          company_name: profile.company_name,
          bio: profile.bio || '',
          phone: profile.phone || '',
          linkedin_url: profile.linkedin_url || '',
          interests: profile.interests || [],
          photo: null,
        });
        if (profile.photo_url) {
          setPhotoPreview(profile.photo_url);
        }
      }
    } catch (error) {
      if (error.response?.status === 400) {
        alert(error.response.data.error || 'Ya estás registrado en este evento');
      } else {
        alert('No se encontró un perfil con estos datos. Por favor completa el registro manual.');
      }
    } finally {
      setCheckingUser(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddInterest = () => {
    if (interestInput.trim() && !formData.interests.includes(interestInput.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, interestInput.trim()]
      });
      setInterestInput('');
    }
  };

  const handleRemoveInterest = (interest) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(i => i !== interest)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let result;
      
      if (isExistingUser === 'yes' && existingUserData.email && existingUserData.access_code) {
        result = await profileService.registerProfile(eventCode, {
          use_existing_profile: true,
          email: existingUserData.email,
          existing_access_code: existingUserData.access_code
        });
      } else {
        result = await profileService.registerProfile(eventCode, formData);
      }
      
      alert(`¡Registro exitoso! Tu código de acceso es: ${result.access_code}\n\nRevisa tu correo electrónico para más detalles.`);
      
      navigate(`/events/${eventCode}/directory`);
    } catch (error) {
      console.error('Error en registro:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.email?.[0] || 'Error al registrarse. Intenta de nuevo.';
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Cargando evento...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
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

  return (
    <div 
      className="min-h-screen py-12 px-4"
      style={{
        background: `linear-gradient(135deg, ${brandColors.primary}15 0%, ${brandColors.secondary}10 100%)`
      }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div 
            className="px-8 py-12 text-white"
            style={{
              background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`
            }}
          >
            {companyLogo && (
              <img 
                src={companyLogo} 
                alt={companyName}
                className="h-16 object-contain mx-auto mb-6 bg-white rounded-lg px-4 py-2"
              />
            )}
            <h1 className="text-4xl font-bold mb-2 text-center">{event.name}</h1>
            <p className="text-center text-lg opacity-90">{companyName}</p>
            <div className="mt-4 flex items-center justify-center space-x-4 text-sm opacity-90">
              <span>📅 {new Date(event.start_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              {event.location && <span>📍 {event.location}</span>}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Regístrate al Evento</h2>
              <p className="text-gray-600">Completa tus datos para unirte al networking</p>
            </div>

            {isExistingUser === null && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
                  ¿Ya te has registrado antes en Capybara?
                </h3>
                <div className="flex gap-4 justify-center">
                  <button
                    type="button"
                    onClick={() => setIsExistingUser('yes')}
                    className="flex-1 max-w-xs py-3 px-6 bg-white border-2 rounded-xl font-semibold transition hover:shadow-lg"
                    style={{ 
                      borderColor: brandColors.primary,
                      color: brandColors.primary
                    }}
                  >
                    ✅ Sí, ya tengo cuenta
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsExistingUser('no')}
                    className="flex-1 max-w-xs py-3 px-6 text-white rounded-xl font-semibold transition hover:shadow-lg"
                    style={{ backgroundColor: brandColors.primary }}
                  >
                    No, es mi primera vez
                  </button>
                </div>
              </div>
            )}

            {isExistingUser === 'yes' && (
              <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Verifica tu cuenta existente
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsExistingUser(null);
                      setExistingUserData({ email: '', access_code: '' });
                      setFormData({
                        full_name: '',
                        email: '',
                        position: '',
                        company_name: '',
                        bio: '',
                        phone: '',
                        linkedin_url: '',
                        interests: [],
                        photo: null,
                      });
                      setPhotoPreview(null);
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900 underline"
                  >
                    Cambiar opción
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={existingUserData.email}
                    onChange={(e) => setExistingUserData({ ...existingUserData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition"
                    placeholder="tu@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Código de Acceso de evento anterior
                  </label>
                  <input
                    type="text"
                    value={existingUserData.access_code}
                    onChange={(e) => setExistingUserData({ ...existingUserData, access_code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition font-mono"
                    placeholder="XXXX-XXX-XXX"
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={handleExistingUserCheck}
                  disabled={checkingUser}
                  className="w-full py-3 px-6 text-white rounded-xl font-semibold transition disabled:opacity-50"
                  style={{ backgroundColor: brandColors.primary }}
                >
                  {checkingUser ? 'Verificando...' : '🔍 Verificar y Cargar Datos'}
                </button>

                <p className="text-sm text-gray-600 text-center">
                  Una vez verificado, tus datos se cargarán automáticamente
                </p>
              </div>
            )}

            {(isExistingUser === 'no' || (isExistingUser === 'yes' && formData.full_name)) && (
              <>
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-32 h-32 rounded-full object-cover border-4" style={{ borderColor: `${brandColors.primary}30` }} />
                    ) : (
                      <div 
                        className="w-32 h-32 rounded-full flex items-center justify-center border-4"
                        style={{ 
                          backgroundColor: `${brandColors.primary}10`,
                          borderColor: `${brandColors.primary}30`
                        }}
                      >
                        <svg className="w-12 h-12" style={{ color: brandColors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    <label 
                      className="absolute bottom-0 right-0 text-white p-2 rounded-full cursor-pointer transition shadow-lg"
                      style={{ backgroundColor: brandColors.primary }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = brandColors.secondary}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = brandColors.primary}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre Completo *</label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      required
                      disabled={isExistingUser === 'yes'}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition disabled:bg-gray-50"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Correo Electrónico *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isExistingUser === 'yes'}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition disabled:bg-gray-50"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition"
                      placeholder="+57 300 123 4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cargo *</label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition"
                      placeholder="Ej: CEO, Desarrollador, Marketing Manager"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Empresa *</label>
                    <input
                      type="text"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition"
                      placeholder="Nombre de tu empresa"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn</label>
                    <input
                      type="url"
                      name="linkedin_url"
                      value={formData.linkedin_url}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition"
                      placeholder="https://linkedin.com/in/tu-perfil"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition resize-none"
                      placeholder="Cuéntanos sobre ti..."
                    ></textarea>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Intereses</label>
                    <div className="flex space-x-2 mb-3">
                      <input
                        type="text"
                        value={interestInput}
                        onChange={(e) => setInterestInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition"
                        placeholder="Ej: Tecnología, Marketing, Startups"
                      />
                      <button
                        type="button"
                        onClick={handleAddInterest}
                        className="px-6 py-3 text-white rounded-xl transition font-semibold"
                        style={{ backgroundColor: brandColors.primary }}
                      >
                        Agregar
                      </button>
                    </div>
                    {formData.interests.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.interests.map((interest, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium"
                            style={{ 
                              backgroundColor: `${brandColors.primary}20`,
                              color: brandColors.primary
                            }}
                          >
                            <span>{interest}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveInterest(interest)}
                              className="hover:opacity-75"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full text-white font-bold py-4 px-6 rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-lg"
                  style={{
                    background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`
                  }}
                >
                  {submitting ? 'Registrando...' : '✨ Completar Registro'}
                </button>

                <p className="text-center text-sm text-gray-600 mt-4">
                  Al registrarte, recibirás un código de acceso en tu correo electrónico
                </p>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}