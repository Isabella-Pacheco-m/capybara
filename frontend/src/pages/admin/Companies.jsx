import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import CompanyModal from '../../components/CompanyModal';
import { companyService } from '../../services/companyService';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await companyService.getAllCompanies();
      console.log('Empresas cargadas:', data); // Debug
      setCompanies(data);
    } catch (error) {
      console.error('Error cargando empresas:', error);
      alert('Error al cargar las empresas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingCompany) {
        await companyService.updateCompany(editingCompany.id, formData);
        alert('Empresa actualizada exitosamente');
      } else {
        await companyService.createCompany(formData);
        alert('Empresa creada exitosamente');
      }
      setShowModal(false);
      setEditingCompany(null);
      loadCompanies();
    } catch (error) {
      console.error('Error guardando empresa:', error);
      alert('Error al guardar la empresa');
    }
  };

  const handleEdit = async (company) => {
    try {
      // Cargar los datos completos de la empresa
      const fullCompany = await companyService.getCompany(company.id);
      console.log('Datos completos de empresa:', fullCompany); // Debug
      setEditingCompany(fullCompany);
      setShowModal(true);
    } catch (error) {
      console.error('Error cargando empresa:', error);
      alert('Error al cargar la empresa');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta empresa?')) {
      try {
        await companyService.deleteCompany(id);
        alert('Empresa eliminada exitosamente');
        loadCompanies();
      } catch (error) {
        console.error('Error eliminando empresa:', error);
        alert('Error al eliminar la empresa');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCompany(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Empresas</h2>
            <p className="text-gray-600 mt-1">Gestiona las empresas registradas en el sistema</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl transition shadow-lg flex items-center space-x-2 font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Nueva Empresa</span>
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Cargando empresas...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No hay empresas registradas</h3>
            <p className="text-gray-600 mb-6">Comienza creando tu primera empresa para gestionar eventos</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              <span>Crear la primera empresa</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <div
                key={company.id}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  {company.logo_url ? (
                    <div className="w-16 h-16 flex items-center justify-center bg-gray-50 rounded-xl p-2">
                      <img
                        src={company.logo_url}
                        alt={company.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          console.error('Error cargando logo:', company.logo_url);
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  )}
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      company.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {company.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                  {company.name}
                </h3>
                
                <div className="flex items-center space-x-2 mb-3">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="text-sm text-gray-600 font-medium">{company.industry}</span>
                </div>

                {company.description ? (
                  <p className="text-sm text-gray-500 mb-4 line-clamp-3 leading-relaxed min-h-[3.6rem]">
                    {company.description}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 italic mb-4 min-h-[3.6rem]">
                    Sin descripción
                  </p>
                )}
                
                <div className="flex items-center space-x-2 mb-5 pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500 font-medium">Colores:</span>
                  <div className="flex space-x-1.5">
                    <div
                      className="w-7 h-7 rounded-lg shadow-sm ring-1 ring-gray-200"
                      style={{ backgroundColor: company.primary_color || '#3B82F6' }}
                      title={`Primario: ${company.primary_color || '#3B82F6'}`}
                    ></div>
                    <div
                      className="w-7 h-7 rounded-lg shadow-sm ring-1 ring-gray-200"
                      style={{ backgroundColor: company.secondary_color || '#1E40AF' }}
                      title={`Secundario: ${company.secondary_color || '#1E40AF'}`}
                    ></div>
                    <div
                      className="w-7 h-7 rounded-lg shadow-sm ring-1 ring-gray-200"
                      style={{ backgroundColor: company.accent_color || '#60A5FA' }}
                      title={`Acento: ${company.accent_color || '#60A5FA'}`}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(company)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition font-semibold"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(company.id)}
                    className="px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition"
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

      <CompanyModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        company={editingCompany}
      />
    </DashboardLayout>
  );
}