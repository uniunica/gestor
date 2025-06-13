// Configuração da API Google Sheets
class SheetsAPI {
  constructor() {
    this.apiKey = "AIzaSyD_tcEft1u37kUNCTDEUE-NvOHGQn6ZRSI"; // Substitua pela sua API Key
    this.spreadsheetId = "1XvqI06KgnMeJvCDF74LZZ2bgRrRN8sjfndPU_pEP3-c"; // Substitua pelo ID da sua planilha
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
        throw new Error(
          `Erro na API: ${response.status} - ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erro na requisição:", error);
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
      throw error;
    }
  }

  // Escrever dados em uma aba específica
  async writeSheet(sheetName, range, values) {
    try {
      // Para escrever, precisamos usar a API de escrita (requer autenticação OAuth)
      // Como estamos usando apenas API Key, vamos simular o armazenamento local
      // Em produção, você precisará implementar OAuth 2.0

      console.warn("Escrita simulada - implemente OAuth 2.0 para escrita real");

      // Simular escrita salvando no localStorage
      const key = `sheets_${sheetName}_${range}`;
      const existingData = JSON.parse(localStorage.getItem(key) || "[]");

      // Se é uma nova linha, adicionar ao final
      if (Array.isArray(values[0])) {
        existingData.push(...values);
      } else {
        existingData.push(values);
      }

      localStorage.setItem(key, JSON.stringify(existingData));

      // Limpar cache para forçar atualização
      this.clearCache();

      return { updatedRows: values.length };
    } catch (error) {
      console.error(`Erro ao escrever na aba ${sheetName}:`, error);
      throw error;
    }
  }

  // Adicionar nova linha
  async appendRow(sheetName, values) {
    try {
      // Simular adição de linha
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
      return newRow;
    } catch (error) {
      console.error(`Erro ao adicionar linha na aba ${sheetName}:`, error);
      toast.error("Erro ao salvar dados. Tente novamente.");
      throw error;
    }
  }

  // Atualizar linha existente
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

      // Limpar cache
      this.clearCache();

      toast.success("Dados atualizados com sucesso!");
      return existingData[index];
    } catch (error) {
      console.error(`Erro ao atualizar linha na aba ${sheetName}:`, error);
      toast.error("Erro ao atualizar dados. Tente novamente.");
      throw error;
    }
  }

  // Deletar linha
  async deleteRow(sheetName, id) {
    try {
      const key = `sheets_${sheetName}`;
      const existingData = JSON.parse(localStorage.getItem(key) || "[]");

      const filteredData = existingData.filter((row) => row.id !== id);
      localStorage.setItem(key, JSON.stringify(filteredData));

      // Limpar cache
      this.clearCache();

      toast.success("Registro excluído com sucesso!");
      return true;
    } catch (error) {
      console.error(`Erro ao deletar linha na aba ${sheetName}:`, error);
      toast.error("Erro ao excluir registro. Tente novamente.");
      throw error;
    }
  }

  // Obter todos os dados de uma aba (simulado)
  async getAllData(sheetName) {
    try {
      const key = `sheets_${sheetName}`;
      const data = JSON.parse(localStorage.getItem(key) || "[]");
      return data;
    } catch (error) {
      console.error(`Erro ao obter dados da aba ${sheetName}:`, error);
      return [];
    }
  }

  // Parsear dados da linha baseado na aba
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

  // Parsear dados iniciais
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

  // Parsear cadastro finais
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

  // Parsear dados treinamento
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

  // Buscar parceiros
  async searchParceiros(query, filters = {}) {
    try {
      const allData = await this.getAllData(this.sheets.dadosIniciais);

      let filteredData = allData;

      // Aplicar filtro de busca
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

      // Aplicar filtros adicionais
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

  // Obter estatísticas
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

      // Estatísticas por tipo
      dadosIniciais.forEach((item) => {
        const tipo = item.tipoParceria || "Não informado";
        stats.porTipo[tipo] = (stats.porTipo[tipo] || 0) + 1;
      });

      // Estatísticas por UF
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

  // Limpar cache
  clearCache() {
    this.cache.clear();
  }

  // Exportar dados para CSV
  async exportToCSV(sheetName) {
    try {
      const data = await this.getAllData(sheetName);

      if (data.length === 0) {
        toast.warning("Não há dados para exportar");
        return;
      }

      // Obter cabeçalhos baseado na aba
      const headers = this.getHeadersForSheet(sheetName);

      // Converter dados para CSV
      let csv = headers.join(",") + "\n";

      data.forEach((row) => {
        const values = headers.map((header) => {
          const value = row[header] || "";
          // Escapar aspas e vírgulas
          return `"${value.toString().replace(/"/g, '""')}"`;
        });
        csv += values.join(",") + "\n";
      });

      // Download do arquivo
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

  // Obter cabeçalhos para cada aba
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
