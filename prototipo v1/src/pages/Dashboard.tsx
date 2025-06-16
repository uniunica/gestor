import React from "react";
import {
  Users,
  UserPlus,
  ClipboardList,
  GraduationCap,
  TrendingUp,
  Calendar,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { usePartners } from "../contexts/PartnerContext";
import { PartnerCard } from "../components/PartnerCard/PartnerCard";
import { useNavigate } from "react-router-dom";

export const Dashboard: React.FC = () => {
  const { partners } = usePartners();
  const navigate = useNavigate();

  const stats = {
    total: partners.length,
    initial: partners.filter((p) => p.currentStage === "initial").length,
    final: partners.filter((p) => p.currentStage === "final").length,
    training: partners.filter((p) => p.currentStage === "training").length,
    completed: partners.filter((p) => p.currentStage === "completed").length,
  };

  const recentPartners = partners
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 6);

  const statCards = [
    {
      title: "Total de Parceiros",
      value: stats.total,
      icon: Users,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Dados Iniciais",
      value: stats.initial,
      icon: UserPlus,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
    },
    {
      title: "Cadastro Final",
      value: stats.final,
      icon: ClipboardList,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      title: "Em Treinamento",
      value: stats.training,
      icon: GraduationCap,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      title: "Concluídos",
      value: stats.completed,
      icon: TrendingUp,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Visão geral do sistema de gerenciamento de parceiros
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/partners/new")}
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
          >
            <UserPlus className="h-8 w-8 text-blue-600" />
            <div className="ml-3 text-left">
              <p className="font-medium text-blue-900">Novo Parceiro</p>
              <p className="text-sm text-blue-600">Cadastrar novo parceiro</p>
            </div>
          </button>

          <button
            onClick={() => navigate("/partners")}
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200"
          >
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-3 text-left">
              <p className="font-medium text-green-900">Ver Parceiros</p>
              <p className="text-sm text-green-600">Lista completa</p>
            </div>
          </button>

          <button
            onClick={() => navigate("/reports")}
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200"
          >
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-3 text-left">
              <p className="font-medium text-purple-900">Relatórios</p>
              <p className="text-sm text-purple-600">Análises e métricas</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Partners */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Parceiros Recentes
          </h2>
          <button
            onClick={() => navigate("/partners")}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Ver todos
          </button>
        </div>

        {recentPartners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentPartners.map((partner) => (
              <PartnerCard
                key={partner.id}
                partner={partner}
                onClick={() => navigate(`/partners/${partner.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum parceiro cadastrado
            </h3>
            <p className="text-gray-600 mb-4">
              Comece cadastrando seu primeiro parceiro no sistema.
            </p>
            <button
              onClick={() => navigate("/partners/new")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Cadastrar Primeiro Parceiro
            </button>
          </div>
        )}
      </div>

      {/* Integration Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Status da Integração
        </h2>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          <span className="ml-2 text-sm text-gray-600">
            Google Sheets conectado e sincronizado
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Última sincronização: há poucos segundos
        </p>
      </div>
    </div>
  );
};
