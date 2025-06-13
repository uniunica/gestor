// Configuração da API Google Sheets
class SheetsAPI {
  constructor() {
    this.apiKey = "AIzaSyD_tcEft1u37kUNCTDEUE-NvOHGQn6ZRSI";
    this.spreadsheetId = "1XvqI06KgnMeJvCDF74LZZ2bgRrRN8sjfndPU_pEP3-c";
    this.baseUrl = "https://sheets.googleapis.com/v4/spreadsheets";

    // Nomes das abas
    this.sheets = {
      dadosIniciais: "DADOS INICIAIS",
      cadastroFinais: "CADASTRO FINAIS",
      dadosTreinamento: "DADOS TREINAMENTO",
    };

    // Cache para otimização
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos

    // Flag para indicar se deve usar dados reais ou simulados
    this.useRealData = true;
  }

  // Método genérico para fazer requisições à API
  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${this.baseUrl}/${this.spreadsheetId}${endpoint}?key=${this.apiKey}`;
      console.log("Fazendo requisição para:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro na resposta da API:", errorText);
        throw new Error(
          `Erro na API: ${response.status} - ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Dados recebidos da API:", data);
      return data;
    } catch (error) {
      console.error("Erro na requisição:", error);
      toast.error(`Erro ao conectar com Google Sheets: ${error.message}`);
      throw error;
    }
  }

  // Ler dados de uma aba específica
  async readSheet(sheetName, range = "") {
    try {
      const cacheKey = `${sheetName}_${range}`;
      const cachedData = this.cache.get(cacheKey);

      // Verificar cache
      if (cachedData && Date.now() - cachedData.timestamp < this.cacheTimeout) {
        console.log("Usando dados do cache para:", sheetName);
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
      console.error(`Erro ao ler aba ${sheetName}:`, error);

      // Se falhar, tentar usar dados locais como fallback
      console.log("Tentando usar dados locais como fallback...");
      return this.getLocalData(sheetName);
    }
  }

  // Obter dados locais como fallback
  getLocalData(sheetName) {
    const key = `sheets_${sheetName}`;
    const localData = JSON.parse(localStorage.getItem(key) || "[]");

    // Simular estrutura da API do Google Sheets
    return {
      values: localData.map((item) => {
        if (item.data) {
          return item.data;
        }
        return this.convertObjectToArray(sheetName, item);
      }),
    };
  }

  // Converter objeto para array baseado na aba
  convertObjectToArray(sheetName, obj) {
    switch (sheetName) {
      case this.sheets.dadosIniciais:
        return [
          obj.numeroContrato || "",
          obj.ano || new Date().getFullYear(),
          obj.mes || new Date().getMonth() + 1,
          obj.dia || new Date().getDate(),
          obj.nome || "",
          obj.rg || "",
          obj.cpf || "",
          obj.email || "",
          obj.cnpj || "",
          obj.cep || "",
          obj.rua || "",
          obj.numero || "",
          obj.bairro || "",
          obj.cidade || "",
          obj.uf || "",
          obj.razaoSocial || "",
          obj.nomeComercial || "",
          obj.nomeAcademico || "",
          obj.nomeTestemunha || "",
          obj.emailTestemunha || "",
          obj.cpfTestemunha || "",
          obj.contato || "",
          obj.tipoParceria || "",
          obj.captadoPor || "",
        ];
      case this.sheets.cadastroFinais:
        return [
          obj.nome || "",
          obj.cidade || "",
          obj.uf || "",
          obj.emailPolo || "",
          obj.sistemas || "",
          obj.portalParceiro || "",
          obj.pincelAtomico || "",
          obj.pastaDrive || "",
          obj.enviarCaptacao || "",
          obj.direcionarLorraine || "",
        ];
      case this.sheets.dadosTreinamento:
        return [
          obj.nome || "",
          obj.cidade || "",
          obj.uf || "",
          obj.status || "",
          obj.cadastro || "",
          obj.contatoLorraine || "",
          obj.treinamentoInicia || "",
          obj.cursoCademi || "",
          obj.treinamentoComercial || "",
        ];
      default:
        return [];
    }
  }

  // Obter todos os dados de uma aba (CORRIGIDO)
  async getAllData(sheetName) {
    try {
      console.log(`Carregando dados da aba: ${sheetName}`);

      // Primeiro tentar carregar dados reais do Google Sheets
      const sheetData = await this.readSheet(sheetName);

      if (sheetData && sheetData.values && sheetData.values.length > 0) {
        console.log(
          `Dados encontrados no Google Sheets para ${sheetName}:`,
          sheetData.values
        );

        // Converter dados do Google Sheets para formato do sistema
        const convertedData = [];

        // Pular a primeira linha se for cabeçalho
        const dataRows = sheetData.values.slice(1);

        dataRows.forEach((row, index) => {
          if (row && row.length > 0) {
            const parsedData = this.parseRowData(sheetName, row);
            convertedData.push({
              id: `gs_${index}_${Date.now()}`,
              data: row,
              timestamp: new Date().toISOString(),
              ...parsedData,
            });
          }
        });

        // Salvar dados localmente para cache
        const key = `sheets_${sheetName}`;
        localStorage.setItem(key, JSON.stringify(convertedData));

        return convertedData;
      } else {
        console.log(
          `Nenhum dado encontrado no Google Sheets para ${sheetName}, usando dados locais`
        );

        // Usar dados locais
        const key = `sheets_${sheetName}`;
        const localData = JSON.parse(localStorage.getItem(key) || "[]");
        return localData;
      }
    } catch (error) {
      console.error(`Erro ao obter dados da aba ${sheetName}:`, error);

      // Fallback para dados locais
      const key = `sheets_${sheetName}`;
      const localData = JSON.parse(localStorage.getItem(key) || "[]");

      if (localData.length === 0) {
        console.log(`Criando dados de exemplo para ${sheetName}`);
        return this.createSampleData(sheetName);
      }

      return localData;
    }
  }

  // Criar dados de exemplo para teste
  createSampleData(sheetName) {
    let sampleData = [];

    switch (sheetName) {
      case this.sheets.dadosIniciais:
        sampleData = [
          {
            id: "sample_1",
            numeroContrato: "2024001",
            ano: 2024,
            mes: 12,
            dia: 13,
            nome: "João Silva",
            rg: "12.345.678-9",
            cpf: "123.456.789-00",
            email: "joao@email.com",
            cnpj: "12.345.678/0001-90",
            cep: "01234-567",
            rua: "Rua das Flores",
            numero: "123",
            bairro: "Centro",
            cidade: "São Paulo",
            uf: "SP",
            razaoSocial: "João Silva ME",
            nomeComercial: "Silva Educação",
            nomeAcademico: "Instituto Silva",
            nomeTestemunha: "Maria Santos",
            emailTestemunha: "maria@email.com",
            cpfTestemunha: "987.654.321-00",
            contato: "(11) 99999-9999",
            tipoParceria: "Polo",
            captadoPor: "Equipe Comercial",
            timestamp: new Date().toISOString(),
          },
        ];
        break;

      case this.sheets.cadastroFinais:
        sampleData = [
          {
            id: "sample_cf_1",
            nome: "João Silva",
            cidade: "São Paulo",
            uf: "SP",
            emailPolo: "Sim",
            sistemas: "Sim",
            portalParceiro: "Não",
            pincelAtomico: "Não",
            pastaDrive: "Sim",
            enviarCaptacao: "Não",
            direcionarLorraine: "Sim",
            timestamp: new Date().toISOString(),
          },
        ];
        break;

      case this.sheets.dadosTreinamento:
        sampleData = [
          {
            id: "sample_dt_1",
            nome: "João Silva",
            cidade: "São Paulo",
            uf: "SP",
            status: "Em Treinamento",
            cadastro: "Sim",
            contatoLorraine: "Sim",
            treinamentoInicia: "2024-12-15",
            cursoCademi: "Não",
            treinamentoComercial: "Não",
            timestamp: new Date().toISOString(),
          },
        ];
        break;
    }

    // Salvar dados de exemplo
    const key = `sheets_${sheetName}`;
    localStorage.setItem(key, JSON.stringify(sampleData));

    return sampleData;
  }

  // Adicionar nova linha (CORRIGIDO)
  async appendRow(sheetName, values) {
    try {
      console.log(`Adicionando nova linha na aba ${sheetName}:`, values);

      // Por enquanto, salvar apenas localmente
      // TODO: Implementar escrita real no Google Sheets com OAuth

      const key = `sheets_${sheetName}`;
      const existingData = JSON.parse(localStorage.getItem(key) || "[]");

      // Adicionar nova linha com timestamp
      const newRow = {
        id: Utils.generateId(),
        data: values,
        timestamp: new Date().toISOString(),
        ...this.parseRowData(sheetName, values),
      };

      existingData.push(newRow);
      localStorage.setItem(key, JSON.stringify(existingData));

      // Limpar cache
      this.clearCache();

      toast.success("Dados salvos com sucesso!");
      console.log("Nova linha adicionada:", newRow);

      return newRow;
    } catch (error) {
      console.error(`Erro ao adicionar linha na aba ${sheetName}:`, error);
      toast.error("Erro ao salvar dados. Tente novamente.");
      throw error;
    }
  }

  // Teste de conectividade
  async testConnection() {
    try {
      console.log("Testando conectividade com Google Sheets...");
      loading.show("Testando conexão...");

      const response = await this.makeRequest("");

      if (response) {
        console.log("Conexão bem-sucedida!", response);
        toast.success("Conexão com Google Sheets estabelecida!");
        return true;
      }
    } catch (error) {
      console.error("Erro no teste de conexão:", error);
      toast.error("Erro ao conectar com Google Sheets. Usando dados locais.");
      return false;
    } finally {
      loading.hide();
    }
  }

  // Resto dos métodos permanecem iguais...
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

      toast.success("Dados atualizados com sucesso!");
      return existingData[index];
    } catch (error) {
      console.error(`Erro ao atualizar linha na aba ${sheetName}:`, error);
      toast.error("Erro ao atualizar dados. Tente novamente.");
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
      toast.success("Registro excluído com sucesso!");
      return true;
    } catch (error) {
      console.error(`Erro ao deletar linha na aba ${sheetName}:`, error);
      toast.error("Erro ao excluir registro. Tente novamente.");
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
      console.error("Erro ao buscar parceiros:", error);
      return [];
    }
  }

  async getStats() {
    try {
      const dadosIniciais = await this.getAllData(this.sheets.dadosIniciais);
      const dadosTreinamento = await this.getAllData(
        this.sheets.dadosTreinamento
      );

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
      console.error("Erro ao obter estatísticas:", error);
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
        toast.warning("Não há dados para exportar");
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

      const filename = `${sheetName}_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      Utils.downloadFile(csv, filename, "text/csv");

      toast.success("Dados exportados com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      toast.error("Erro ao exportar dados");
    }
  }

  getHeadersForSheet(sheetName) {
    switch (sheetName) {
      case this.sheets.dadosIniciais:
        return [
          "numeroContrato",
          "nome",
          "cpf",
          "email",
          "cidade",
          "uf",
          "tipoParceria",
        ];
      case this.sheets.cadastroFinais:
        return [
          "nome",
          "cidade",
          "uf",
          "emailPolo",
          "sistemas",
          "portalParceiro",
        ];
      case this.sheets.dadosTreinamento:
        return [
          "nome",
          "cidade",
          "uf",
          "status",
          "treinamentoInicia",
          "cursoCademi",
        ];
      default:
        return [];
    }
  }
}

// Instância global da API
const sheetsAPI = new SheetsAPI();
