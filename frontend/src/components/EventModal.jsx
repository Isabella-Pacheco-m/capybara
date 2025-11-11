import { useState, useEffect } from 'react';
import { companyService } from '../services/companyService';

export default function EventModal({ isOpen, onClose, onSubmit, event }) {
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    networking_hours: 0,
    location: '',
    is_active: true,
  });

  useEffect(() => {
    if (isOpen) loadCompanies();
  }, [isOpen]);

  useEffect(() => {
    if (event) {
      setFormData({
        company: event.company || '',
        name: event.name || '',
        description: event.description || '',
        start_date: event.start_date || '',
        end_date: event.end_date || '',
        start_time: event.start_time || '',
        end_time: event.end_time || '',
        networking_hours: event.networking_hours || 0,
        location: event.location || '',
        is_active: event.is_active ?? true,
      });
    } else resetForm();
  }, [event, isOpen]);

  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const data = await companyService.getAllCompanies();
      setCompanies(data.filter(c => c.is_active));
    } catch (error) {
      console.error('Error cargando empresas:', error);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const resetForm = () => {
    setFormData({
      company: '',
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      start_time: '',
      end_time: '',
      networking_hours: 0,
      location: '',
      is_active: true,
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.end_date < formData.start_date) {
      alert('La fecha de finalización debe ser posterior a la fecha de inicio');
      return;
    }
    if (formData.start_time && formData.end_time && formData.end_time <= formData.start_time) {
      alert('La hora final debe ser posterior a la hora de inicio');
      return;
    }
    if (formData.networking_hours < 0) {
      alert('Las horas de networking no pueden ser negativas');
      return;
    }
    onSubmit(formData);
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={handleClose}></div>
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-bold mb-2">
                {event ? 'Editar Evento' : 'Nuevo Evento'}
              </h3>
              <p className="text-blue-100">
                {event ? 'Actualiza la información del evento' : 'Completa los datos para crear un nuevo evento'}
              </p>
            </div>
            <button onClick={handleClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Empresa Organizadora *</label>
                {loadingCompanies ? (
                  <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-400">Cargando empresas...</div>
                ) : companies.length === 0 ? (
                  <div className="w-full px-4 py-3 border-2 border-yellow-200 bg-yellow-50 rounded-xl text-yellow-700">No hay empresas activas. Crea una empresa primero.</div>
                ) : (
                  <select name="company" value={formData.company} onChange={handleInputChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                    <option value="">Selecciona una empresa</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>{company.name} - {company.industry}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Evento *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="Nombre del evento" />
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none" placeholder="Describe el evento..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de Inicio *</label>
                <input type="date" name="start_date" value={formData.start_date} onChange={handleInputChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de Finalización *</label>
                <input type="date" name="end_date" value={formData.end_date} onChange={handleInputChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hora de Inicio *</label>
                <input type="time" name="start_time" value={formData.start_time} onChange={handleInputChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hora Final *</label>
                <input type="time" name="end_time" value={formData.end_time} onChange={handleInputChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Horas de Networking</label>
                <input type="number" name="networking_hours" value={formData.networking_hours} onChange={handleInputChange} step="0.5" min="0" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ubicación</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="Ciudad o dirección" />
                </div>
              </div>
              <div className="col-span-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Evento activo</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button type="button" onClick={handleClose} className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition">Cancelar</button>
              <button type="submit" disabled={companies.length === 0} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">{event ? 'Actualizar Evento' : 'Crear Evento'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
