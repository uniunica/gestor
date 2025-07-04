class GoogleSheetsAPI {
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
  }

  // Construir URL da API
  buildUrl(sheetName, range = "") {
    const encodedSheetName = encodeURIComponent(sheetName);
    const fullRange = range ? `${encodedSheetName}!${range}` : encodedSheetName;
    return `${this.baseUrl}/${this.spreadsheetId}/values/${fullRange}?key=${this.apiKey}`;
  }

  // Fazer requisição GET
  async makeRequest(url, options = {}) {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `API Error: ${response.status} - ${
            errorData.error?.message || "Unknown error"
          }`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Erro na requisição:", error);
      throw error;
    }
  }

  // Fazer requisição POST/PUT
  async makeWriteRequest(url, data, method = "PUT") {
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `API Error: ${response.status} - ${
            errorData.error?.message || "Unknown error"
          }`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Erro na requisição de escrita:", error);
      throw error;
    }
  }

  // Obter dados de uma aba
  async getSheetData(sheetName, useCache = true) {
    const cacheKey = `sheet_${sheetName}`;

    // Verificar cache
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const url = this.buildUrl(sheetName);
      const response = await this.makeRequest(url);

      const data = {
        values: response.values || [],
        range: response.range || "",
        majorDimension: response.majorDimension || "ROWS",
      };

      // Salvar no cache
      if (useCache) {
        this.cache.set(cacheKey, {
          data: data,
          timestamp: Date.now(),
        });
      }

      return data;
    } catch (error) {
      console.error(`Erro ao obter dados da aba ${sheetName}:`, error);
      throw error;
    }
  }

  // Obter todos os parceiros (dados iniciais)
  async getAllPartners() {
    try {
      const sheetData = await this.getSheetData(this.sheets.dadosIniciais);

      if (!sheetData.values || sheetData.values.length < 2) {
        return [];
      }

      const headers = sheetData.values[0];
      const rows = sheetData.values.slice(1);

      return rows.map((row, index) => {
        const partner = {
          rowIndex: index + 2, // +2 porque começamos da linha 2 (header é linha 1)
        };

        // Mapear colunas para propriedades
        headers.forEach((header, colIndex) => {
          const value = row[colIndex] || "";

          switch (header.toUpperCase()) {
            case "Nº CONTRATO":
              partner.numeroContrato = value;
              break;
            case "ANO":
              partner.ano = value;
              break;
            case "MÊS":
              partner.mes = value;
              break;
            case "DIA":
              partner.dia = value;
              break;
            case "NOME":
              partner.nome = value;
              break;
            case "RG":
              partner.rg = value;
              break;
            case "CPF":
              partner.cpf = value;
              break;
            case "EMAIL":
              partner.email = value;
              break;
            case "CNPJ":
              partner.cnpj = value;
              break;
            case "CEP":
              partner.cep = value;
              break;
            case "RUA":
              partner.rua = value;
              break;
            case "NÚMERO":
              partner.numero = value;
              break;
            case "BAIRRO":
              partner.bairro = value;
              break;
            case "CIDADE":
              partner.cidade = value;
              break;
            case "UF":
              partner.uf = value;
              break;
            case "RAZÃO SOCIAL":
              partner.razaoSocial = value;
              break;
            case "NOME COMERCIAL":
              partner.nomeComercial = value;
              break;
            case "NOME ACADÊMICO":
              partner.nomeAcademico = value;
              break;
            case "NOME TESTEMUNHA":
              partner.nomeTestemunha = value;
              break;
            case "E-MAIL TESTEMUNHA":
              partner.emailTestemunha = value;
              break;
            case "CPF TESTEMUNHA":
              partner.cpfTestemunha = value;
              break;
            case "CONTATO":
              partner.contato = value;
              break;
            case "TIPO DE PARCERIA":
              partner.tipoParceria = value;
              break;
            case "CAPTADO POR":
              partner.captadoPor = value;
              break;
          }
        });

        return partner;
      });
    } catch (error) {
      console.error("Erro ao obter parceiros:", error);
      throw error;
    }
  }

  // Adicionar novo parceiro
  async addPartner(partnerData) {
    try {
      // Gerar dados automáticos
      const now = new Date();
      const numeroContrato = Utils.generateContractNumber();

      // Preparar dados para a aba DADOS INICIAIS
      const rowData = [
        numeroContrato, // Nº CONTRATO
        now.getFullYear().toString(), // ANO
        (now.getMonth() + 1).toString(), // MÊS
        now.getDate().toString(), // DIA
        partnerData.nome || "", // NOME
        partnerData.rg || "", // RG
        partnerData.cpf || "", // CPF
        partnerData.email || "", // EMAIL
        partnerData.cnpj || "", // CNPJ
        partnerData.cep || "", // CEP
        partnerData.rua || "", // RUA
        partnerData.numero || "", // NÚMERO
        partnerData.bairro || "", // BAIRRO
        partnerData.cidade || "", // CIDADE
        partnerData.uf || "", // UF
        partnerData.razaoSocial || "", // RAZÃO SOCIAL
        partnerData.nomeComercial || "", // NOME COMERCIAL
        partnerData.nomeAcademico || "", // NOME ACADÊMICO
        partnerData.nomeTestemunha || "", // NOME TESTEMUNHA
        partnerData.emailTestemunha || "", // E-MAIL TESTEMUNHA
        partnerData.cpfTestemunha || "", // CPF TESTEMUNHA
        partnerData.contato || "", // CONTATO
        partnerData.tipoParceria || "", // TIPO DE PARCERIA
        partnerData.captadoPor || "", // CAPTADO POR
      ];

      // Adicionar à planilha
      const url = `${this.baseUrl}/${
        this.spreadsheetId
      }/values/${encodeURIComponent(
        this.sheets.dadosIniciais
      )}:append?valueInputOption=RAW&key=${this.apiKey}`;

      const response = await this.makeWriteRequest(
        url,
        {
          values: [rowData],
        },
        "POST"
      );

      // Limpar cache
      this.clearCache();

      // Adicionar às outras abas se necessário
      await this.addToCadastroFinais(partnerData);
      await this.addToDadosTreinamento(partnerData);

      return {
        success: true,
        numeroContrato: numeroContrato,
        response: response,
      };
    } catch (error) {
      console.error("Erro ao adicionar parceiro:", error);
      throw error;
    }
  }

  // Adicionar à aba CADASTROS FINAIS
  async addToCadastroFinais(partnerData) {
    try {
      const rowData = [
        partnerData.nome || "", // NOME
        partnerData.cidade || "", // CIDADE
        partnerData.uf || "", // UF
        partnerData.solicitarEmail ? "SIM" : "NÃO", // SOLICITAR A CRIAÇÃO DE EMAIL PARA O POLO
        partnerData.cadastrosSistemas ? "SIM" : "NÃO", // CADASTROS NOS SISTEMAS
        partnerData.cadastroPortal ? "SIM" : "NÃO", // SOLICITAR AO PARCEIRO O CADASTRO NO PORTAL DO PARCEIRO
        partnerData.acessoPincel ? "SIM" : "NÃO", // SOLICITAR ACESSO DO PARCEIRO AO PINCEL ATÔMICO
        partnerData.criarPasta ? "SIM" : "NÃO", // CRIAR PASTA DE POLO NO DRIVE
        partnerData.enviarCaptacao ? "SIM" : "NÃO", // ENVIAR PARA ABA DE CAPTAÇÃO
        partnerData.direcionarLorraine ? "SIM" : "NÃO", // DIRECIONAR PARCEIRO PARA LORRAINE
      ];

      const url = `${this.baseUrl}/${
        this.spreadsheetId
      }/values/${encodeURIComponent(
        this.sheets.cadastroFinais
      )}:append?valueInputOption=RAW&key=${this.apiKey}`;

      await this.makeWriteRequest(
        url,
        {
          values: [rowData],
        },
        "POST"
      );
    } catch (error) {
      console.error("Erro ao adicionar aos cadastros finais:", error);
      // Não propagar o erro para não interromper o processo principal
    }
  }

  // Adicionar à aba DADOS TREINAMENTO
  async addToDadosTreinamento(partnerData) {
    try {
      const rowData = [
        partnerData.nome || "", // NOME
        partnerData.cidade || "", // CIDADE
        partnerData.uf || "", // UF
        partnerData.statusTreinamento || "pendente", // STATUS
        partnerData.cadastroStatus || "pendente", // CADASTRO
        partnerData.contatoLorraine || "", // CONTATO LORRAINE
        partnerData.treinamentoInicia || "", // TREINAMENTO INICIA
        partnerData.cursoCademi || "", // CURSO CADEMI
        partnerData.treinamentoComercial || "", // TREINAMENTO COMERCIAL
      ];

      const url = `${this.baseUrl}/${
        this.spreadsheetId
      }/values/${encodeURIComponent(
        this.sheets.dadosTreinamento
      )}:append?valueInputOption=RAW&key=${this.apiKey}`;

      await this.makeWriteRequest(
        url,
        {
          values: [rowData],
        },
        "POST"
      );
    } catch (error) {
      console.error("Erro ao adicionar aos dados de treinamento:", error);
      // Não propagar o erro para não interromper o processo principal
    }
  }

  // Atualizar parceiro existente
  async updatePartner(rowIndex, partnerData) {
    try {
      // Preparar dados atualizados
      const now = new Date();
      const rowData = [
        partnerData.numeroContrato || Utils.generateContractNumber(),
        partnerData.ano || now.getFullYear().toString(),
        partnerData.mes || (now.getMonth() + 1).toString(),
        partnerData.dia || now.getDate().toString(),
        partnerData.nome || "",
        partnerData.rg || "",
        partnerData.cpf || "",
        partnerData.email || "",
        partnerData.cnpj || "",
        partnerData.cep || "",
        partnerData.rua || "",
        partnerData.numero || "",
        partnerData.bairro || "",
        partnerData.cidade || "",
        partnerData.uf || "",
        partnerData.razaoSocial || "",
        partnerData.nomeComercial || "",
        partnerData.nomeAcademico || "",
        partnerData.nomeTestemunha || "",
        partnerData.emailTestemunha || "",
        partnerData.cpfTestemunha || "",
        partnerData.contato || "",
        partnerData.tipoParceria || "",
        partnerData.captadoPor || "",
      ];

      // Atualizar linha específica
      const range = `${this.sheets.dadosIniciais}!A${rowIndex}:X${rowIndex}`;
      const url = `${this.baseUrl}/${
        this.spreadsheetId
      }/values/${encodeURIComponent(range)}?valueInputOption=RAW&key=${
        this.apiKey
      }`;

      const response = await this.makeWriteRequest(url, {
        values: [rowData],
      });

      // Limpar cache
      this.clearCache();

      return {
        success: true,
        response: response,
      };
    } catch (error) {
      console.error("Erro ao atualizar parceiro:", error);
      throw error;
    }
  }

  // Deletar parceiro
  async deletePartner(rowIndex) {
    try {
      // Nota: A API do Google Sheets não tem um método direto para deletar linhas
      // Uma abordagem é limpar a linha (deixar em branco)
      const emptyRow = Array(24).fill(""); // 24 colunas vazias

      const range = `${this.sheets.dadosIniciais}!A${rowIndex}:X${rowIndex}`;
      const url = `${this.baseUrl}/${
        this.spreadsheetId
      }/values/${encodeURIComponent(range)}?valueInputOption=RAW&key=${
        this.apiKey
      }`;

      const response = await this.makeWriteRequest(url, {
        values: [emptyRow],
      });

      // Limpar cache
      this.clearCache();

      return {
        success: true,
        response: response,
      };
    } catch (error) {
      console.error("Erro ao deletar parceiro:", error);
      throw error;
    }
  }

  // Obter estatísticas dos parceiros
  async getPartnerStats() {
    try {
      const partners = await this.getAllPartners();

      const stats = {
        total: partners.length,
        active: 0,
        pending: 0,
        training: 0,
        byType: {},
        byState: {},
        recentActivity: [],
      };

      partners.forEach((partner) => {
        // Contar por tipo
        if (partner.tipoParceria) {
          stats.byType[partner.tipoParceria] =
            (stats.byType[partner.tipoParceria] || 0) + 1;
        }

        // Contar por estado
        if (partner.uf) {
          stats.byState[partner.uf] = (stats.byState[partner.uf] || 0) + 1;
        }

        // Simular status (em uma implementação real, isso viria dos dados)
        const randomStatus = Math.random();
        if (randomStatus < 0.6) {
          stats.active++;
        } else if (randomStatus < 0.8) {
          stats.pending++;
        } else {
          stats.training++;
        }
      });

      // Simular atividade recente
      stats.recentActivity = partners.slice(0, 5).map((partner) => ({
        type: "new_partner",
        message: `Novo parceiro cadastrado: ${partner.nome}`,
        time: new Date().toISOString(),
        partner: partner,
      }));

      return stats;
    } catch (error) {
      console.error("Erro ao obter estatísticas:", error);
      throw error;
    }
  }

  // Limpar cache
  clearCache() {
    this.cache.clear();
  }

  // Verificar conectividade com a API
  async testConnection() {
    try {
      const url = `${this.baseUrl}/${this.spreadsheetId}?key=${this.apiKey}`;
      const response = await this.makeRequest(url);
      return {
        success: true,
        spreadsheetTitle: response.properties?.title || "Planilha sem título",
      };
    } catch (error) {
      console.error("Erro ao testar conexão:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}