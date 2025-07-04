class GoogleSheetsAPI {
    constructor() {
        this.apiKey = 'YOUR_GOOGLE_SHEETS_API_KEY'; // Substitua pela sua chave API
        this.baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
        this.spreadsheetIds = {
            dashboard: 'YOUR_DASHBOARD_SPREADSHEET_ID',
            polos: 'YOUR_POLOS_SPREADSHEET_ID',
            parceiros: 'YOUR_PARCEIROS_SPREADSHEET_ID'
        };
    }

    async fetchSheetData(sheetType, range = 'A:Z') {
        try {
            const spreadsheetId = this.spreadsheetIds[sheetType];
            if (!spreadsheetId) {
                throw new Error(`Spreadsheet ID not found for ${sheetType}`);
            }

            const url = `${this.baseUrl}/${spreadsheetId}/values/${range}?key=${this.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return this.processSheetData(data.values);
            
        } catch (error) {
            console.error(`Error fetching ${sheetType} data:`, error);
            return this.getFallbackData(sheetType);
        }
    }

    processSheetData(rawData) {
        if (!rawData || rawData.length === 0) {
            return [];
        }

        const headers = rawData[0];
        const rows = rawData.slice(1);

        return rows.map(row => {
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = row[index] || '';
            });
            return obj;
        });
    }

    getFallbackData(sheetType) {
        const fallbackData = {
            dashboard: [
                { metric: 'Total Parceiros', value: 45, change: '+12%' },
                { metric: 'Polos Ativos', value: 12, change: '+3%' },
                { metric: 'Receita Mensal', value: 'R$ 150.000', change: '+8%' },
                { metric: 'Crescimento', value: '15%', change: '+2%' }
            ],
            polos: [
                { nome: 'Polo São Paulo', cidade: 'São Paulo', estado: 'SP', status: 'Ativo', parceiros: 15 },
                { nome: 'Polo Rio de Janeiro', cidade: 'Rio de Janeiro', estado: 'RJ', status: 'Ativo', parceiros: 12 },
                { nome: 'Polo Belo Horizonte', cidade: 'Belo Horizonte', estado: 'MG', status: 'Ativo', parceiros: 8 },
                { nome: 'Polo Brasília', cidade: 'Brasília', estado: 'DF', status: 'Ativo', parceiros: 10 }
            ],
            parceiros: [
                { nome: 'João Silva', empresa: 'Estética Premium', polo: 'São Paulo', status: 'Ativo', contato: 'joao@estetica.com' },
                { nome: 'Maria Santos', empresa: 'Beleza Total', polo: 'Rio de Janeiro', status: 'Ativo', contato: 'maria@beleza.com' },
                { nome: 'Pedro Costa', empresa: 'Spa Wellness', polo: 'Belo Horizonte', status: 'Ativo', contato: 'pedro@spa.com' },
                { nome: 'Ana Oliveira', empresa: 'Clínica Renovar', polo: 'Brasília', status: 'Ativo', contato: 'ana@renovar.com' }
            ]
        };

        return fallbackData[sheetType] || [];
    }

    async getDashboardData() {
        return await this.fetchSheetData('dashboard');
    }

    async getPolosData() {
        return await this.fetchSheetData('polos');
    }

    async getParceirosData() {
        return await this.fetchSheetData('parceiros');
    }

    // Método para atualizar dados na planilha (requer autenticação OAuth)
    async updateSheetData(sheetType, data) {
        try {
            // Implementar atualização de dados
            console.log(`Updating ${sheetType} with data:`, data);
            // Este método requer configuração OAuth para escrita
        } catch (error) {
            console.error(`Error updating ${sheetType}:`, error);
        }
    }
}

// Classe para gerenciar cache de dados
class DataCache {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
    }

    set(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    get(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        const isExpired = Date.now() - cached.timestamp > this.cacheTimeout;
        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    clear() {
        this.cache.clear();
    }

    has(key) {
        const cached = this.cache.get(key);
        if (!cached) return false;

        const isExpired = Date.now() - cached.timestamp > this.cacheTimeout;
        if (isExpired) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }
}

// Instância global da API e cache
window.googleSheetsAPI = new GoogleSheetsAPI();
window.dataCache = new DataCache();