import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePartners } from '../contexts/PartnerContext';
import { PartnerCard } from '../components/PartnerCard/PartnerCard';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Download,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export const PartnersList: React.FC = () => {
  const navigate = useNavigate();
  const { partners, loading } = usePartners();
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [partnershipTypeFilter, setPartnershipTypeFilter] = useState('');

  const filteredPartners = useMemo(() => {
    return partners.filter(partner => {
      const matchesSearch = 
        partner.initialData.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.initialData.cpf.includes(searchQuery) ||
        partner.initialData.cnpj.includes(searchQuery) ||
        partner.initialData.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStage = !stageFilter || partner.currentStage === stageFilter;
      const matchesCity = !cityFilter || partner.initialData.city === cityFilter;
      const matchesPartnershipType = !partnershipTypeFilter || partner.initialData.partnershipType === partnershipTypeFilter;
      
      return matchesSearch && matchesStage && matchesCity && matchesPartnershipType;
    });
  }, [partners, searchQuery, stageFilter, cityFilter, partnershipTypeFilter]);

  const uniqueCities = [...new Set(partners.map(p => p.initialData.city))].sort();
  const uniquePartnershipTypes = [...new Set(partners.map(p => p.initialData.partnershipType))].sort();

  const clearFilters = () => {
    setSearchQuery('');
    setStageFilter('');
    setCityFilter('');
    setPartnershipTypeFilter('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parceiros</h1>
          <p className="mt-1 text-sm text-gray-600">
            {filteredPartners.length} de {partners.length} parceiros
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </button>
          
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
          
          <button
            onClick={() => navigate('/partners/new')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Parceiro
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Nome, CPF, CNPJ ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Stage Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Etapa
            </label>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas</option>
              <option value="initial">Dados Iniciais</option>
              <option value="final">Cadastro Final</option>
              <option value="training">Treinamento</option>
              <option value="completed">Concluído</option>
            </select>
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cidade
            </label>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas</option>
              {uniqueCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Partnership Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Parceria
            </label>
            <select
              value={partnershipTypeFilter}
              onChange={(e) => setPartnershipTypeFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              {uniquePartnershipTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchQuery || stageFilter || cityFilter || partnershipTypeFilter) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* Partners Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : filteredPartners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((partner) => (
            <PartnerCard
              key={partner.id}
              partner={partner}
              onClick={() => navigate(`/partners/${partner.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {partners.length === 0 ? 'Nenhum parceiro cadastrado' : 'Nenhum parceiro encontrado'}
          </h3>
          <p className="text-gray-600 mb-4">
            {partners.length === 0 
              ? 'Comece cadastrando seu primeiro parceiro no sistema.'
              : 'Tente ajustar os filtros para encontrar o que procura.'
            }
          </p>
          <button
            onClick={() => navigate('/partners/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            {partners.length === 0 ? 'Cadastrar Primeiro Parceiro' : 'Novo Parceiro'}
          </button>
        </div>
      )}
    </div>
  );
};