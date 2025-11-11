import { useState } from 'react';

export default function SlotRequestModal({ 
  profile, 
  selectedSlot, 
  onClose, 
  onSubmit, 
  brandColors 
}) {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(profile.id, selectedSlot, message);
      onClose();
    } catch (error) {
      alert('Error al enviar solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="absolute inset-0 backdrop-blur-sm transition-all duration-300"
        style={{ backgroundColor: `${brandColors.primary}15` }}
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl animate-scale-in border border-gray-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold mb-1" style={{ color: brandColors.primary }}>
              Solicitar Conexión
            </h3>
            <p className="text-sm text-gray-600">Envía una solicitud de networking</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-xl"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-6 p-4 rounded-2xl" style={{ backgroundColor: `${brandColors.primary}08` }}>
            {profile.photo_url ? (
              <img 
                src={profile.photo_url} 
                alt={profile.full_name}
                className="w-16 h-16 rounded-2xl object-cover shadow-md"
              />
            ) : (
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md"
                style={{ backgroundColor: brandColors.primary }}
              >
                {profile.full_name.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <p className="font-bold text-gray-900 text-lg">{profile.full_name}</p>
              <p className="text-sm text-gray-600">{profile.company_name}</p>
            </div>
          </div>

          <div 
            className="p-5 rounded-2xl border-2 transition-all"
            style={{ 
              backgroundColor: `${brandColors.primary}05`,
              borderColor: `${brandColors.primary}30`
            }}
          >
            <p className="text-sm text-gray-600 mb-1">Horario seleccionado</p>
            <p className="text-2xl font-bold" style={{ color: brandColors.primary }}>
              {selectedSlot}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Mensaje (opcional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ej: Hola, me gustaría hablar contigo sobre..."
              rows="4"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:border-transparent resize-none transition-all hover:border-gray-300"
              style={{ '--tw-ring-color': brandColors.primary }}
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 rounded-2xl font-semibold transition-all hover:bg-gray-50"
              style={{ borderColor: brandColors.primary, color: brandColors.primary }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 text-white rounded-2xl font-semibold disabled:opacity-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
              style={{ 
                background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`
              }}
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </span>
              ) : 'Enviar Solicitud'}
            </button>
          </div>
        </form>
      </div>

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

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}