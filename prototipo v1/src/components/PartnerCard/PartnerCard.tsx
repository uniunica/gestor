import React from 'react';
import { Partner } from '../../types/partner';
import { User, MapPin, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PartnerCardProps {
  partner: Partner;
  onClick: () => void;
}

const getStageInfo = (stage: Partner['currentStage']) => {
  switch (stage) {
    case 'initial':
      return { 
        label: 'Dados Iniciais', 
        color: 'bg-blue-100 text-blue-800',
        icon: Clock
      };
    case 'final':
      return { 
        label: 'Cadastro Final', 
        color: 'bg-yellow-100 text-yellow-800',
        icon: AlertCircle
      };
    case 'training':
      return { 
        label: 'Treinamento', 
        color: 'bg-purple-100 text-purple-800',
        icon: Clock
      };
    case 'completed':
      return { 
        label: 'Concluído', 
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle
      };
    default:
      return { 
        label: 'Desconhecido', 
        color: 'bg-gray-100 text-gray-800',
        icon: AlertCircle
      };
  }
};

export const PartnerCard: React.FC<PartnerCardProps> = ({ partner, onClick }) => {
  const stageInfo = getStageInfo(partner.currentStage);
  const StageIcon = stageInfo.icon;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              {partner.initialData.name}
            </h3>
            <p className="text-sm text-gray-500">
              {partner.initialData.partnershipType}
            </p>
          </div>
        </div>
        
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageInfo.color}`}>
          <StageIcon className="h-3 w-3 mr-1" />
          {stageInfo.label}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2" />
          {partner.initialData.city}, {partner.initialData.state}
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2" />
          Cadastrado em {format(partner.createdAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Contrato:</span>
          <span className="font-medium text-gray-900">
            {partner.initialData.contractNumber}
          </span>
        </div>
      </div>
    </div>
  );
};