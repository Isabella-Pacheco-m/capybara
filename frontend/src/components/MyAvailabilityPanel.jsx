import { useState, useEffect } from 'react';

export default function MyAvailabilityPanel({ 
  currentProfile, 
  event,
  brandColors,
  onClose,
  onUpdate
}) {
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    console.log('📊 Current Profile:', currentProfile);
    console.log('📊 Available Slots from Profile:', currentProfile?.available_slots);
    
    if (currentProfile?.available_slots) {
      setSelectedSlots(currentProfile.available_slots);
    }
  }, [currentProfile]);

  const allSlots = event?.networking_slots || [];
  
  const occupiedSlots = [
    ...(currentProfile?.networking_slots_received || [])
      .filter(s => s.status === 'accepted' || s.status === 'pending')
      .map(s => s.time_slot),
    ...(currentProfile?.networking_slots_sent || [])
      .filter(s => s.status === 'accepted')
      .map(s => s.time_slot)
  ];

  console.log('🔒 Occupied Slots:', occupiedSlots);
  console.log('✅ Selected Slots:', selectedSlots);

  const handleToggleSlot = (slot) => {
    if (occupiedSlots.includes(slot)) return;
    
    if (selectedSlots.includes(slot)) {
      const newSlots = selectedSlots.filter(s => s !== slot);
      console.log('➖ Removing slot:', slot, 'New slots:', newSlots);
      setSelectedSlots(newSlots);
    } else {
      const newSlots = [...selectedSlots, slot];
      console.log('➕ Adding slot:', slot, 'New slots:', newSlots);
      setSelectedSlots(newSlots);
    }
  };

  const handleSave = async () => {
    console.log('💾 Saving availability with slots:', selectedSlots);
    setSaving(true);
    try {
      await onUpdate(selectedSlots);
      console.log('✅ Availability saved successfully');
      onClose();
    } catch (error) {
      console.error('❌ Error guardando disponibilidad:', error);
      console.error('❌ Error details:', error.response?.data);
      alert('Error al guardar disponibilidad: ' + (error.response?.data?.error || error.message));
    } finally {
      setSaving(false);
    }
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
          <h2 className="text-3xl font-bold">Mi Disponibilidad</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-xl transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-sm opacity-90">Selecciona los horarios en los que estás disponible</p>
      </div>

      <div className="p-6">
        <div className="mb-6 p-4 bg-blue-50 rounded-2xl border-2 border-blue-100">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-blue-900 font-semibold mb-1">Información importante</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                Los horarios ocupados (con reuniones pendientes o aceptadas) no pueden ser deseleccionados.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded border-2" style={{ borderColor: brandColors.primary }}></div>
              <span className="text-gray-600">Disponible</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: `${brandColors.primary}15`, border: `2px solid ${brandColors.primary}` }}></div>
              <span className="text-gray-600">Seleccionado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-gray-200 border-2 border-gray-300"></div>
              <span className="text-gray-600">Ocupado</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {allSlots.map((slot) => {
            const isOccupied = occupiedSlots.includes(slot);
            const isSelected = selectedSlots.includes(slot);
            
            return (
              <button
                key={slot}
                onClick={() => handleToggleSlot(slot)}
                disabled={isOccupied}
                className={`px-3 py-3 rounded-xl text-sm font-bold transition-all ${
                  isOccupied 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-2 border-gray-300' 
                    : isSelected
                    ? 'border-2 shadow-sm'
                    : 'border-2 hover:shadow-md'
                }`}
                style={
                  isOccupied 
                    ? {} 
                    : isSelected
                    ? { 
                        backgroundColor: `${brandColors.primary}15`, 
                        borderColor: brandColors.primary,
                        color: brandColors.primary
                      }
                    : { 
                        borderColor: brandColors.primary,
                        color: brandColors.primary
                      }
                }
              >
                {slot}
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-gray-50 rounded-2xl border-2 border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Horarios seleccionados</span>
              <span className="text-2xl font-bold" style={{ color: brandColors.primary }}>
                {selectedSlots.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Horarios ocupados</span>
              <span className="text-2xl font-bold text-gray-600">
                {occupiedSlots.length}
              </span>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 text-white rounded-2xl font-bold disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all"
            style={{ 
              background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`
            }}
          >
            {saving ? 'Guardando...' : 'Guardar Disponibilidad'}
          </button>

          <button
            onClick={onClose}
            className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}