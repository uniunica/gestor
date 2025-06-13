import React, { createContext, useContext, useState, useEffect } from 'react';
import { Partner, InitialData, FinalRegistration, TrainingData } from '../types/partner';
import { GoogleSheetsService } from '../services/googleSheets';

interface PartnerContextType {
  partners: Partner[];
  loading: boolean;
  addPartner: (initialData: InitialData) => Promise<void>;
  updateFinalRegistration: (partnerId: string, data: FinalRegistration) => Promise<void>;
  updateTrainingData: (partnerId: string, data: TrainingData) => Promise<void>;
  getPartnerById: (id: string) => Partner | undefined;
  searchPartners: (query: string) => Partner[];
  filterPartners: (filters: PartnerFilters) => Partner[];
}

interface PartnerFilters {
  stage?: string;
  city?: string;
  state?: string;
  partnershipType?: string;
  dateRange?: { start: Date; end: Date };
}

const PartnerContext = createContext<PartnerContextType | undefined>(undefined);

export const usePartners = () => {
  const context = useContext(PartnerContext);
  if (context === undefined) {
    throw new Error('usePartners must be used within a PartnerProvider');
  }
  return context;
};

export const PartnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);

  const addPartner = async (initialData: InitialData): Promise<void> => {
    setLoading(true);
    
    const newPartner: Partner = {
      id: Date.now().toString(),
      initialData,
      finalRegistration: null,
      trainingData: null,
      currentStage: 'initial',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      // Sync with Google Sheets
      await GoogleSheetsService.addInitialData(initialData);
      
      setPartners(prev => [...prev, newPartner]);
    } catch (error) {
      console.error('Error adding partner:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateFinalRegistration = async (partnerId: string, data: FinalRegistration): Promise<void> => {
    setLoading(true);
    
    try {
      await GoogleSheetsService.updateFinalRegistration(data);
      
      setPartners(prev => prev.map(partner => 
        partner.id === partnerId 
          ? { 
              ...partner, 
              finalRegistration: data, 
              currentStage: 'final' as const,
              updatedAt: new Date()
            }
          : partner
      ));
    } catch (error) {
      console.error('Error updating final registration:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTrainingData = async (partnerId: string, data: TrainingData): Promise<void> => {
    setLoading(true);
    
    try {
      await GoogleSheetsService.updateTrainingData(data);
      
      setPartners(prev => prev.map(partner => 
        partner.id === partnerId 
          ? { 
              ...partner, 
              trainingData: data, 
              currentStage: data.status === 'completed' ? 'completed' : 'training',
              updatedAt: new Date()
            }
          : partner
      ));
    } catch (error) {
      console.error('Error updating training data:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getPartnerById = (id: string): Partner | undefined => {
    return partners.find(partner => partner.id === id);
  };

  const searchPartners = (query: string): Partner[] => {
    const lowercaseQuery = query.toLowerCase();
    return partners.filter(partner => 
      partner.initialData.name.toLowerCase().includes(lowercaseQuery) ||
      partner.initialData.cpf.includes(query) ||
      partner.initialData.cnpj.includes(query) ||
      partner.initialData.email.toLowerCase().includes(lowercaseQuery)
    );
  };

  const filterPartners = (filters: PartnerFilters): Partner[] => {
    return partners.filter(partner => {
      if (filters.stage && partner.currentStage !== filters.stage) return false;
      if (filters.city && partner.initialData.city !== filters.city) return false;
      if (filters.state && partner.initialData.state !== filters.state) return false;
      if (filters.partnershipType && partner.initialData.partnershipType !== filters.partnershipType) return false;
      
      if (filters.dateRange) {
        const partnerDate = partner.createdAt;
        if (partnerDate < filters.dateRange.start || partnerDate > filters.dateRange.end) return false;
      }
      
      return true;
    });
  };

  return (
    <PartnerContext.Provider value={{
      partners,
      loading,
      addPartner,
      updateFinalRegistration,
      updateTrainingData,
      getPartnerById,
      searchPartners,
      filterPartners
    }}>
      {children}
    </PartnerContext.Provider>
  );
};