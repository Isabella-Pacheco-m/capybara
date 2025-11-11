import { useState } from 'react';

export default function ProfileCard({ 
  profile, 
  isCurrentUser, 
  brandColors, 
  onEditClick,
  onSlotClick,
  isEditing,
  editFormData,
  photoPreview,
  saving,
  onEditInputChange,
  onPhotoChange,
  onSaveProfile,
  onCancelEdit,
  acceptedMeeting
}) {
  const [showAllSlots, setShowAllSlots] = useState(false);

  if (isEditing) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-xl border-2 animate-scale-in" style={{ borderColor: brandColors.primary }}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold mb-1" style={{ color: brandColors.primary }}>Editar Perfil</h3>
            <p className="text-sm text-gray-600">Actualiza tu información</p>
          </div>
          <button onClick={onCancelEdit} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-28 h-28 rounded-3xl object-cover shadow-lg" />
              ) : (
                <div 
                  className="w-28 h-28 rounded-3xl flex items-center justify-center text-white font-bold text-3xl shadow-lg"
                  style={{ backgroundColor: brandColors.primary }}
                >
                  {editFormData.full_name.charAt(0)}
                </div>
              )}
              <label 
                className="absolute bottom-0 right-0 text-white p-3 rounded-2xl cursor-pointer shadow-lg transition-all transform hover:scale-110 active:scale-95"
                style={{ backgroundColor: brandColors.primary }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input type="file" accept="image/*" onChange={onPhotoChange} className="hidden" />
              </label>
            </div>
          </div>

          <input
            type="text"
            name="full_name"
            value={editFormData.full_name}
            onChange={onEditInputChange}
            placeholder="Nombre completo"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:border-transparent transition-all hover:border-gray-300"
            style={{ '--tw-ring-color': brandColors.primary }}
          />

          <input
            type="text"
            name="position"
            value={editFormData.position}
            onChange={onEditInputChange}
            placeholder="Cargo"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:border-transparent transition-all hover:border-gray-300"
            style={{ '--tw-ring-color': brandColors.primary }}
          />

          <input
            type="text"
            name="company_name"
            value={editFormData.company_name}
            onChange={onEditInputChange}
            placeholder="Empresa"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:border-transparent transition-all hover:border-gray-300"
            style={{ '--tw-ring-color': brandColors.primary }}
          />

          <textarea
            name="bio"
            value={editFormData.bio}
            onChange={onEditInputChange}
            placeholder="Descripción"
            rows="3"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:border-transparent resize-none transition-all hover:border-gray-300"
            style={{ '--tw-ring-color': brandColors.primary }}
          />

          <input
            type="tel"
            name="phone"
            value={editFormData.phone}
            onChange={onEditInputChange}
            placeholder="Teléfono"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:border-transparent transition-all hover:border-gray-300"
            style={{ '--tw-ring-color': brandColors.primary }}
          />

          <input
            type="url"
            name="linkedin_url"
            value={editFormData.linkedin_url}
            onChange={onEditInputChange}
            placeholder="LinkedIn URL"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:border-transparent transition-all hover:border-gray-300"
            style={{ '--tw-ring-color': brandColors.primary }}
          />

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onSaveProfile}
              disabled={saving}
              className="flex-1 py-3 text-white rounded-2xl font-semibold disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all"
              style={{ 
                background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`
              }}
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              onClick={onCancelEdit}
              className="px-6 py-3 border-2 rounded-2xl font-semibold hover:bg-gray-50 transition-all"
              style={{ borderColor: brandColors.primary, color: brandColors.primary }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1">
        {isCurrentUser && (
          <div className="flex justify-end mb-3">
            <button
              onClick={() => onEditClick(profile)}
              className="text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:shadow-md"
              style={{ backgroundColor: `${brandColors.primary}15`, color: brandColors.primary }}
            >
              ✏️ Editar perfil
            </button>
          </div>
        )}
        
        <div className="flex items-start space-x-4 mb-4">
          {profile.photo_url ? (
            <img 
              src={profile.photo_url} 
              alt={profile.full_name}
              className="w-20 h-20 rounded-2xl object-cover shadow-md"
            />
          ) : (
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-md"
              style={{ backgroundColor: brandColors.primary }}
            >
              {profile.full_name.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 truncate mb-1">{profile.full_name}</h3>
            <p className="text-sm text-gray-600 truncate">{profile.position}</p>
            <p className="text-sm font-semibold truncate mt-1" style={{ color: brandColors.primary }}>
              {profile.company_name}
            </p>
          </div>
        </div>

        {profile.bio && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">{profile.bio}</p>
        )}

        {profile.interests && profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {profile.interests.slice(0, 3).map((interest, index) => (
              <span
                key={index}
                className="text-xs px-3 py-1.5 rounded-xl font-semibold shadow-sm"
                style={{ 
                  backgroundColor: `${brandColors.primary}15`,
                  color: brandColors.primary
                }}
              >
                {interest}
              </span>
            ))}
          </div>
        )}

        {acceptedMeeting && (
          <div className="mb-4 p-4 rounded-2xl border-2 animate-pulse-subtle" style={{ 
            backgroundColor: '#D1FAE5',
            borderColor: '#10B981'
          }}>
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-bold text-green-800">Reunión confirmada</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-green-700 font-medium">Horario:</span>
              <span className="text-lg font-bold text-green-800">{acceptedMeeting.time_slot}</span>
            </div>
          </div>
        )}

        {!isCurrentUser && profile.available_slots && profile.available_slots.length > 0 && (
          <div className="mb-4 p-4 rounded-2xl border-2 transition-all" style={{ 
            backgroundColor: `${brandColors.primary}05`,
            borderColor: `${brandColors.primary}20`
          }}>
            <p className="text-xs font-bold mb-3 flex items-center" style={{ color: brandColors.primary }}>
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Horarios disponibles
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.available_slots.slice(0, 4).map((slot, index) => (
                <button
                  key={index}
                  onClick={() => onSlotClick(profile, slot)}
                  className="px-4 py-2 bg-white rounded-xl text-sm font-bold transition-all hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
                  style={{ color: brandColors.primary }}
                >
                  {slot}
                </button>
              ))}
              {profile.available_slots.length > 4 && (
                <button
                  onClick={() => setShowAllSlots(true)}
                  className="px-4 py-2 text-xs font-bold rounded-xl transition-all hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
                  style={{ 
                    background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`,
                    color: 'white'
                  }}
                >
                  Ver todos ({profile.available_slots.length})
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
          {profile.linkedin_url && (
            <a
              href={profile.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-white transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
              style={{ 
                background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`
              }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              <span className="text-sm font-semibold">LinkedIn</span>
            </a>
          )}
        </div>
      </div>

      {showAllSlots && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="absolute inset-0 backdrop-blur-sm transition-all duration-300"
            style={{ backgroundColor: `${brandColors.primary}15` }}
            onClick={() => setShowAllSlots(false)}
          />
          <div className="relative bg-white rounded-3xl p-8 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl animate-scale-in border border-gray-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-1" style={{ color: brandColors.primary }}>
                  Horarios disponibles
                </h3>
                <p className="text-sm text-gray-600 mt-1">{profile.full_name}</p>
              </div>
              <button
                onClick={() => setShowAllSlots(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {profile.available_slots.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setShowAllSlots(false);
                    onSlotClick(profile, slot);
                  }}
                  className="px-4 py-4 bg-white border-2 rounded-2xl text-sm font-bold transition-all hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
                  style={{ 
                    borderColor: brandColors.primary,
                    color: brandColors.primary
                  }}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.95;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }

        .animate-pulse-subtle {
          animation: pulse-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}