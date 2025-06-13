// Configuração da API Google Sheets - Versão Melhorada
class SheetsAPI {
    constructor() {
        this.apiKey = "AIzaSyD_tcEft1u37kUNCTDEUE-NvOHGQn6ZRSI";
        this.spreadsheetId = "1XvqI06KgnMeJvCDF74LZZ2bgRrRN8sjfndPU_pEP3-c";
        this.baseUrl = "https://sheets.googleapis.com/v4/spreadsheets";

        // Nomes das abas
        this.sheets = {
            dadosIniciais: "DADOS INICIAIS",
            cadastroFinais: "CADASTROS FINAIS",
            dadosTreinamento: "DADOS TREINAMENTO",
        };

        // Cache para otimização
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
        
        // Status da API
        this.apiEnabled = false;
        this.lastApiCheck = 0;
        this.apiCheckInterval = 30 * 1000; // 30 segundos
        
        // Inicializar dados de exemplo se necessário
        this.initializeSampleData();
    }

    // Inicializar dados de exemplo
    initializeSampleData() {
        const sheets = [this.sheets.dadosIniciais, this.sheets.cadastroFinais, this.sheets.dadosTreinamento];
        
        sheets.forEach(sheetName => {
            const key = `sheets_${sheetName}`;
            const existingData = localStorage.getItem(key);
            
            if (!existingData || existingData === '[]') {
                console.log(`Criando dados de exemplo para ${sheetName}`);
                const sampleData = this.createSampleData(sheetName);
                localStorage.setItem(key, JSON.stringify(sampleData));
            }
        });
    }

    // Método genérico para fazer requisições à API
    async makeRequest(endpoint, options = {}) {
        try {
            const url = `${this.baseUrl}/${this.spreadsheetId}${endpoint}?key=${this.apiKey}`;
            
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                ...options,
            });

            if (!response.ok) {
                const errorData = await response.json();
                
                // Se for erro 403 de API não habilitada, marcar como desabilitada
                if (response.status === 403 && 
                    errorData.error?.message?.includes('has not been used') ||
                    errorData.error?.message?.includes('is disabled')) {
                    this.apiEnabled = false;
                    console.warn('Google Sheets API não está habilitada. Usando dados locais.');
                }
                
                throw new Error(`Erro na API: ${response.status} - ${errorData.error?.message || response.statusText}`);
            }

            // Se chegou até aqui, a API está funcionando
            this.apiEnabled = true;
            this.lastApiCheck = Date.now();
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Erro na requisição:", error);
            
            // Não mostrar toast de erro se for problema conhecido da API
            if (!error.message.includes('has not been used') && 
                !error.message.includes('is disabled')) {
                toast.error(`Erro ao conectar com Google Sheets: ${error.message}`);
            }
            
            throw error;
        }
    }

    // Verificar se deve tentar usar a API
    shouldTryAPI() {
        // Se a API foi verificada recentemente e estava desabilitada, não tentar
        if (!this.apiEnabled && (Date.now() - this.lastApiCheck) < this.apiCheckInterval) {
            return false;
        }
        return true;
    }

    // Ler dados de uma aba específica
    async readSheet(sheetName, range = "") {
        try {
            // Se não deve tentar a API, usar dados locais diretamente
            if (!this.shouldTryAPI()) {
                console.log(`API desabilitada, usando dados locais para ${sheetName}`);
                return this.getLocalData(sheetName);
            }

            const cacheKey = `${sheetName}_${range}`;
            const cachedData = this.cache.get(cacheKey);

            // Verificar cache
            if (cachedData && Date.now() - cachedData.timestamp < this.cacheTimeout) {
                console.log('Usando dados do cache para:', sheetName);
                return cachedData.data;
            }

            const fullRange = range ? `${sheetName}!${range}` : sheetName;
            const endpoint = `/values/${encodeURIComponent(fullRange)}`;

            const response = await this.makeRequest(endpoint);

            // Armazenar no cache
            this.cache.set(cacheKey, {
                data: response,
                timestamp: Date.now(),
            });

            return response;
        } catch (error) {
            console.log(`Erro ao acessar Google Sheets para ${sheetName}, usando dados locais`);
            return this.getLocalData(sheetName);
        }
    }

    // Obter dados locais como fallback
    getLocalData(sheetName) {
        const key = `sheets_${sheetName}`;
        const localData = JSON.parse(localStorage.getItem(key) || '[]');
        
        // Se não há dados locais, criar dados de exemplo
        if (localData.length === 0) {
            const sampleData = this.createSampleData(sheetName);
            localStorage.setItem(key, JSON.stringify(sampleData));
            return { values: [] }; // Retornar vazio para forçar uso dos dados de exemplo
        }
        
        // Simular estrutura da API do Google Sheets
        return {
            values: localData.map(item => {
                if (item.data) {
                    return item.data;
                }
                return this.convertObjectToArray(sheetName, item);
            })
        };
    }

    // Criar dados de exemplo para teste
    createSampleData(sheetName) {
        let sampleData = [];
        
        switch (sheetName) {
            case this.sheets.dadosIniciais:
                sampleData = [
                    {
                        id: 'sample_1',
                        numeroContrato: '2024001',
                        ano: 2024,
                        mes: 12,
                        dia: 13,
                        nome: 'João Silva Santos',
                        rg: '12.345.678-9',
                        cpf: '123.456.789-00',
                        email: 'joao.silva@email.com',
                        cnpj: '12.345.678/0001-90',
                        cep: '01234-567',
                        rua: 'Rua das Flores',
                        numero: '123',
                        bairro: 'Centro',
                        cidade: 'São Paulo',
                        uf: 'SP',
                        razaoSocial: 'João Silva ME',
                        nomeComercial: 'Silva Educação',
                        nomeAcademico: 'Instituto Silva',
                        nomeTestemunha: 'Maria Santos',
                        emailTestemunha: 'maria@email.com',
                        cpfTestemunha: '987.654.321-00',
                        contato: '(11) 99999-9999',
                        tipoParceria: 'Polo',
                        captadoPor: 'Equipe Comercial',
                        timestamp: new Date().toISOString()
                    },
                    {
                        id: 'sample_2',
                        numeroContrato: '2024002',
                        ano: 2024,
                        mes: 12,
                        dia: 10,
                        nome: 'Maria Oliveira Costa',
                        rg: '98.765.432-1',
                        cpf: '987.654.321-00',
                        email: 'maria.oliveira@email.com',
                        cnpj: '98.765.432/0001-10',
                        cep: '04567-890',
                        rua: 'Avenida Principal',
                        numero: '456',
                        bairro: 'Vila Nova',
                        cidade: 'Rio de Janeiro',
                        uf: 'RJ',
                        razaoSocial: 'Maria Oliveira Ltda',
                        nomeComercial: 'Oliveira Ensino',
                        nomeAcademico: 'Centro Oliveira',
                        nomeTestemunha: 'Carlos Silva',
                        emailTestemunha: 'carlos@email.com',
                        cpfTestemunha: '456.789.123-00',
                        contato: '(21) 88888-8888',
                        tipoParceria: 'Representante',
                        captadoPor: 'Equipe Sul',
                        timestamp: new Date().toISOString()
                    },
                    {
                        id: 'sample_3',
                        numeroContrato: '2024003',
                        ano: 2024,
                        mes: 12,
                        dia: 8,
                        nome: 'Pedro Almeida Lima',
                        rg: '11.222.333-4',
                        cpf: '111.222.333-44',
                        email: 'pedro.almeida@email.com',
                        cnpj: '11.222.333/0001-44',
                        cep: '30123-456',
                        rua: 'Rua do Comércio',
                        numero: '789',
                        bairro: 'Centro',
                        cidade: 'Belo Horizonte',
                        uf: 'MG',
                        razaoSocial: 'Pedro Almeida EIRELI',
                        nomeComercial: 'Almeida Educacional',
                        nomeAcademico: 'Instituto Almeida',
                        nomeTestemunha: 'Ana Costa',
                        emailTestemunha: 'ana@email.com',
                        cpfTestemunha: '789.123.456-00',
                        contato: '(31) 77777-7777',
                        tipoParceria: 'Franquia',
                        captadoPor: 'Equipe Sudeste',
                        timestamp: new Date().toISOString()
                    }
                ];
                break;
                
            case this.sheets.cadastroFinais:
                sampleData = [
                    {
                        id: 'sample_cf_1',
                        nome: 'João Silva Santos',
                        cidade: 'São Paulo',
                        uf: 'SP',
                        emailPolo: 'Sim',
                        sistemas: 'Sim',
                        portalParceiro: 'Em andamento',
                        pincelAtomico: 'Não',
                        pastaDrive: 'Sim',
                        enviarCaptacao: 'Não',
                        direcionarLorraine: 'Sim',
                        timestamp: new Date().toISOString()
                    },
                    {
                        id: 'sample_cf_2',
                        nome: 'Maria Oliveira Costa',
                        cidade: 'Rio de Janeiro',
                        uf: 'RJ',
                        emailPolo: 'Sim',
                        sistemas: 'Em andamento',
                        portalParceiro: 'Sim',
                        pincelAtomico: 'Sim',
                        pastaDrive: 'Sim',
                        enviarCaptacao: 'Sim',
                        direcionarLorraine: 'Não',
                        timestamp: new Date().toISOString()
                    },
                    {
                        id: 'sample_cf_3',
                        nome: 'Pedro Almeida Lima',
                        cidade: 'Belo Horizonte',
                        uf: 'MG',
                        emailPolo: 'Não',
                        sistemas: 'Não',
                        portalParceiro: 'Não',
                        pincelAtomico: 'Não',
                        pastaDrive: 'Não',
                        enviarCaptacao: 'Não',
                        direcionarLorraine: 'Sim',
                        timestamp: new Date().toISOString()
                    }
                ];
                break;
                
            case this.sheets.dadosTreinamento:
                sampleData = [
                    {
                        id: 'sample_dt_1',
                        nome: 'João Silva Santos',
                        cidade: 'São Paulo',
                        uf: 'SP',
                        status: 'Em Treinamento',
                        cadastro: 'Sim',
                        contatoLorraine: 'Sim',
                        treinamentoInicia: '2024-12-15',
                        cursoCademi: 'Em andamento',
                        treinamentoComercial: 'Não',
                        timestamp: new Date().toISOString()
                    },
                    {
                        id: 'sample_dt_2',
                        nome: 'Maria Oliveira Costa',
                        cidade: 'Rio de Janeiro',
                        uf: 'RJ',
                        status: 'Ativo',
                        cadastro: 'Sim',
                        contatoLorraine: 'Sim',
                        treinamentoInicia: '2024-11-20',
                        cursoCademi: 'Sim',
                        treinamentoComercial: 'Sim',
                        timestamp: new Date().toISOString()
                    },
                    {
                        id: 'sample_dt_3',
                        nome: 'Pedro Almeida Lima',
                        cidade: 'Belo Horizonte',
                        uf: 'MG',
                        status: 'Cadastrado',
                        cadastro: 'Sim',
                        contatoLorraine: 'Não',
                        treinamentoInicia: '',
                        cursoCademi: 'Não',
                        treinamentoComercial: 'Não',
                        timestamp: new Date().toISOString()
                    }
                ];
                break;
        }
        
        return sampleData;
    }

    // Obter todos os dados de uma aba
    async getAllData(sheetName) {
        try {
            console.log(`Carregando dados da aba: ${sheetName}`);
            
            // Tentar carregar dados reais do Google Sheets
            const sheetData = await this.readSheet(sheetName);
            
            if (sheetData && sheetData.values && sheetData.values.length > 0) {
                console.log(`✅ Dados encontrados no Google Sheets para ${sheetName}:`, sheetData.values.length, 'linhas');
                
                // Converter dados do Google Sheets para formato do sistema
                const convertedData = [];
                const dataRows = sheetData.values.slice(1); // Pular cabeçalho
                
                dataRows.forEach((row, index) => {
                    if (row && row.length > 0) {
                        const parsedData = this.parseRowData(sheetName, row);
                        convertedData.push({
                            id: `gs_${index}_${Date.now()}`,
                            data: row,
                            timestamp: new Date().toISOString(),
                            ...parsedData
                        });
                    }
                });
                
                // Salvar dados localmente para cache
                const key = `sheets_${sheetName}`;
                localStorage.setItem(key, JSON.stringify(convertedData));
                
                return convertedData;
            } else {
                console.log(`📁 Usando dados locais para ${sheetName}`);
                
                // Usar dados locais
                const key = `sheets_${sheetName}`;
                const localData = JSON.parse(localStorage.getItem(key) || '[]');
                
                if (localData.length === 0) {
                    console.log(`📝 Criando dados de exemplo para ${sheetName}`);
                    const sampleData = this.createSampleData(sheetName);
                    localStorage.setItem(key, JSON.stringify(sampleData));
                    return sampleData;
                }
                
                return localData;
            }
        } catch (error) {
            console.error(`❌ Erro ao obter dados da aba ${sheetName}:`, error);
            
            // Fallback para dados locais
            const key = `sheets_${sheetName}`;
            const localData = JSON.parse(localStorage.getItem(key) || '[]');
            
            if (localData.length === 0) {
                console.log(`📝 Criando dados de exemplo para ${sheetName}`);
                const sampleData = this.createSampleData(sheetName);
                localStorage.setItem(key, JSON.stringify(sampleData));
                return sampleData;
            }
            
            return localData;
        }
    }

    // Teste de conectividade melhorado
    async testConnection() {
        try {
            console.log('🔍 Testando conectividade com Google Sheets...');
            loading.show('Testando conexão com Google Sheets...');
            
            const response = await this.makeRequest('');
            
            if (response) {
                console.log('✅ Conexão bem-sucedida!', response);
                toast.success('✅ Conexão com Google Sheets estabelecida!');
                this.apiEnabled = true;
                return true;
            }
        } catch (error) {
            console.error('❌ Erro no teste de conexão:', error);
            
            if (error.message.includes('has not been used') || 
                error.message.includes('is disabled')) {
                toast.warning('⚠️ Google Sheets API não habilitada. Habilite a API e recarregue a página. Usando dados locais por enquanto.');
            } else {
                toast.error('❌ Erro ao conectar com Google Sheets. Usando dados locais.');
            }
            
            this.apiEnabled = false;
            return false;
        } finally {
            loading.hide();
        }
    }

    // Resto dos métodos permanecem iguais...
    convertObjectToArray(sheetName, obj) {
        switch (sheetName) {
            case this.sheets.dadosIniciais:
                return [
                    obj.numeroContrato || '',
                    obj.ano || new Date().getFullYear(),
                    obj.mes || (new Date().getMonth() + 1),
                    obj.dia || new Date().getDate(),
                    obj.nome || '',
                    obj.rg || '',
                    obj.cpf || '',
                    obj.email || '',
                    obj.cnpj || '',
                    obj.cep || '',
                    obj.rua || '',
                    obj.numero || '',
                    obj.bairro || '',
                    obj.cidade || '',
                    obj.uf || '',
                    obj.razaoSocial || '',
                    obj.nomeComercial || '',
                    obj.nomeAcademico || '',
                    obj.nomeTestemunha || '',
                    obj.emailTestemunha || '',
                    obj.cpfTestemunha || '',
                    obj.contato || '',
                    obj.tipoParceria || '',
                    obj.captadoPor || ''
                ];
            case this.sheets.cadastroFinais:
                return [
                    obj.nome || '',
                    obj.cidade || '',
                    obj.uf || '',
                    obj.emailPolo || '',
                    obj.sistemas || '',
                    obj.portalParceiro || '',
                    obj.pincelAtomico || '',
                    obj.pastaDrive || '',
                    obj.enviarCaptacao || '',
                    obj.direcionarLorraine || ''
                ];
            case this.sheets.dadosTreinamento:
                return [
                    obj.nome || '',
                    obj.cidade || '',
                    obj.uf || '',
                    obj.status || '',
                    obj.cadastro || '',
                    obj.contatoLorraine || '',
                    obj.treinamentoInicia || '',
                    obj.cursoCademi || '',
                    obj.treinamentoComercial || ''
                ];
            default:
                return [];
        }
    }

    async appendRow(sheetName, values) {
        try {
            console.log(`➕ Adicionando nova linha na aba ${sheetName}:`, values);
            
            const key = `sheets_${sheetName}`;
            const existingData = JSON.parse(localStorage.getItem(key) || '[]');

            const newRow = {
                id: Utils.generateId(),
                data: values,
                timestamp: new Date().toISOString(),
                ...this.parseRowData(sheetName, values),
            };

            existingData.push(newRow);
            localStorage.setItem(key, JSON.stringify(existingData));

            this.clearCache();
            toast.success("✅ Dados salvos com sucesso!");
            console.log('✅ Nova linha adicionada:', newRow);
            
            return newRow;
        } catch (error) {
            console.error(`❌ Erro ao adicionar linha na aba ${sheetName}:`, error);
            toast.error("❌ Erro ao salvar dados. Tente novamente.");
            throw error;
        }
    }

    // Manter todos os outros métodos iguais...
    parseRowData(sheetName, values) {
        switch (sheetName) {
            case this.sheets.dadosIniciais:
                return this.parseDadosIniciais(values);
            case this.sheets.cadastroFinais:
                return this.parseCadastroFinais(values);
            case this.sheets.dadosTreinamento:
                return this.parseDadosTreinamento(values);
            default:
                return {};
        }
    }

    parseDadosIniciais(values) {
        return {
            numeroContrato: values[0] || "",
            ano: values[1] || new Date().getFullYear(),
            mes: values[2] || new Date().getMonth() + 1,
            dia: values[3] || new Date().getDate(),
            nome: values[4] || "",
            rg: values[5] || "",
            cpf: values[6] || "",
            email: values[7] || "",
            cnpj: values[8] || "",
            cep: values[9] || "",
            rua: values[10] || "",
            numero: values[11] || "",
            bairro: values[12] || "",
            cidade: values[13] || "",
            uf: values[14] || "",
            razaoSocial: values[15] || "",
            nomeComercial: values[16] || "",
            nomeAcademico: values[17] || "",
            nomeTestemunha: values[18] || "",
            emailTestemunha: values[19] || "",
            cpfTestemunha: values[20] || "",
            contato: values[21] || "",
            tipoParceria: values[22] || "",
            captadoPor: values[23] || "",
        };
    }

    parseCadastroFinais(values) {
        return {
            nome: values[0] || "",
            cidade: values[1] || "",
            uf: values[2] || "",
            emailPolo: values[3] || "",
            sistemas: values[4] || "",
            portalParceiro: values[5] || "",
            pincelAtomico: values[6] || "",
            pastaDrive: values[7] || "",
            enviarCaptacao: values[8] || "",
            direcionarLorraine: values[9] || "",
        };
    }

    parseDadosTreinamento(values) {
        return {
            nome: values[0] || "",
            cidade: values[1] || "",
            uf: values[2] || "",
            status: values[3] || "",
            cadastro: values[4] || "",
            contatoLorraine: values[5] || "",
            treinamentoInicia: values[6] || "",
            cursoCademi: values[7] || "",
            treinamentoComercial: values[8] || "",
        };
    }

    async updateRow(sheetName, id, values) {
        try {
            const key = `sheets_${sheetName}`;
            const existingData = JSON.parse(localStorage.getItem(key) || "[]");

            const index = existingData.findIndex((row) => row.id === id);
            if (index === -1) {
                throw new Error("Registro não encontrado");
            }

            existingData[index] = {
                ...existingData[index],
                data: values,
                timestamp: new Date().toISOString(),
                ...this.parseRowData(sheetName, values),
            };

            localStorage.setItem(key, JSON.stringify(existingData));
            this.clearCache();

            toast.success("✅ Dados atualizados com sucesso!");
            return existingData[index];
        } catch (error) {
            console.error(`❌ Erro ao atualizar linha na aba ${sheetName}:`, error);
            toast.error("❌ Erro ao atualizar dados. Tente novamente.");
            throw error;
        }
    }

    async deleteRow(sheetName, id) {
        try {
            const key = `sheets_${sheetName}`;
            const existingData = JSON.parse(localStorage.getItem(key) || "[]");

            const filteredData = existingData.filter((row) => row.id !== id);
            localStorage.setItem(key, JSON.stringify(filteredData));

            this.clearCache();
            toast.success("✅ Registro excluído com sucesso!");
            return true;
        } catch (error) {
            console.error(`❌ Erro ao deletar linha na aba ${sheetName}:`, error);
            toast.error("❌ Erro ao excluir registro. Tente novamente.");
            throw error;
        }
    }

    async searchParceiros(query, filters = {}) {
        try {
            const allData = await this.getAllData(this.sheets.dadosIniciais);
            let filteredData = allData;

            if (query) {
                const searchTerm = query.toLowerCase();
                filteredData = filteredData.filter(
                    (item) =>
                        item.nome?.toLowerCase().includes(searchTerm) ||
                        item.cpf?.includes(searchTerm) ||
                        item.email?.toLowerCase().includes(searchTerm) ||
                        item.cidade?.toLowerCase().includes(searchTerm)
                );
            }

            if (filters.tipo) {
                filteredData = filteredData.filter(
                    (item) => item.tipoParceria === filters.tipo
                );
            }

            if (filters.status) {
                filteredData = filteredData.filter(
                    (item) => item.status === filters.status
                );
            }

            if (filters.uf) {
                filteredData = filteredData.filter((item) => item.uf === filters.uf);
            }

            return filteredData;
        } catch (error) {
            console.error("❌ Erro ao buscar parceiros:", error);
            return [];
        }
    }

    async getStats() {
        try {
            const dadosIniciais = await this.getAllData(this.sheets.dadosIniciais);
            const dadosTreinamento = await this.getAllData(this.sheets.dadosTreinamento);

            const stats = {
                totalParceiros: dadosIniciais.length,
                emTreinamento: dadosTreinamento.filter(
                    (item) => item.status === "Em Treinamento"
                ).length,
                parceirosAtivos: dadosTreinamento.filter(
                    (item) => item.status === "Ativo"
                ).length,
                porTipo: {},
                porUF: {},
            };

            dadosIniciais.forEach((item) => {
                const tipo = item.tipoParceria || "Não informado";
                stats.porTipo[tipo] = (stats.porTipo[tipo] || 0) + 1;
            });

            dadosIniciais.forEach((item) => {
                const uf = item.uf || "Não informado";
                stats.porUF[uf] = (stats.porUF[uf] || 0) + 1;
            });

            return stats;
        } catch (error) {
            console.error("❌ Erro ao obter estatísticas:", error);
            return {
                totalParceiros: 0,
                emTreinamento: 0,
                parceirosAtivos: 0,
                porTipo: {},
                porUF: {},
            };
        }
    }

    clearCache() {
        this.cache.clear();
    }

    async exportToCSV(sheetName) {
        try {
            const data = await this.getAllData(sheetName);

            if (data.length === 0) {
                toast.warning("⚠️ Não há dados para exportar");
                return;
            }

            const headers = this.getHeadersForSheet(sheetName);
            let csv = headers.join(",") + "\n";

            data.forEach((row) => {
                const values = headers.map((header) => {
                    const value = row[header] || "";
                    return `"${value.toString().replace(/"/g, '""')}"`;
                });
                csv += values.join(",") + "\n";
            });

            const filename = `${sheetName}_${new Date().toISOString().split("T")[0]}.csv`;
            Utils.downloadFile(csv, filename, "text/csv");

            toast.success("✅ Dados exportados com sucesso!");
        } catch (error) {
            console.error("❌ Erro ao exportar dados:", error);
            toast.error("❌ Erro ao exportar dados");
        }
    }

    getHeadersForSheet(sheetName) {
        switch (sheetName) {
            case this.sheets.dadosIniciais:
                return ["numeroContrato", "nome", "cpf", "email", "cidade", "uf", "tipoParceria"];
            case this.sheets.cadastroFinais:
                return ["nome", "cidade", "uf", "emailPolo", "sistemas", "portalParceiro"];
            case this.sheets.dadosTreinamento:
                return ["nome", "cidade", "uf", "status", "treinamentoInicia", "cursoCademi"];
            default:
                return [];
        }
    }
}

// Instância global da API
const sheetsAPI = new SheetsAPI();