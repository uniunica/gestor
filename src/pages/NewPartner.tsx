import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InitialDataForm } from '../components/Forms/InitialDataForm';
import { usePartners } from '../contexts/PartnerContext';
import { InitialData } from '../types/partner';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export const NewPartner: React.FC = () => {
  const navigate = useNavigate();
  const { addPartner, loading } = usePartners();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data: InitialData) => {
    try {
      setError('');
      await addPartner(data);
      setSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate('/partners');
      }, 2000);
    } catch (err) {
      setError('Erro ao cadastrar parceiro. Tente novamente.');
      console.error('Error adding partner:', err);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Parceiro Cadastrado com Sucesso!
          </h2>
          <p className="text-gray-600 mb-4">
            Os dados foram sincronizados com o Google Sheets automaticamente.
          </p>
          <p className="text-sm text-gray-500">
            Redirecionando para a lista de parceiros...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <button
          onClick={() => navigate('/partners')}
          className="mr-4 p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novo Parceiro</h1>
          <p className="mt-1 text-sm text-gray-600">
            Cadastre os dados iniciais do novo parceiro
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <InitialDataForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
};