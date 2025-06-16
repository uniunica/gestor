class PolosAPI {
  constructor() {
    this.apiKey = "AIzaSyD_tcEft1u37kUNCTDEUE-NvOHGQn6ZRSI";
    this.spreadsheetId = "1IxAnU18qxiEf-TjvqBEEj9L1W3CsY3-DHDxREV4APmk";
    this.baseUrl = "https://sheets.googleapis.com/v4/spreadsheets";
    this.sheetName = "Página1";

    // Cache para otimização
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos

    console.log("✅ PolosAPI inicializada");
    console.log("📊 Planilha ID:", this.spreadsheetId);
    console.log("📋 Aba:", this.sheetName);
  }

  // Construir URL da API
  buildUrl(range = "") {
    const encodedSheetName = encodeURIComponent(this.sheetName);
    const fullRange = range ? `${encodedSheetName}!${range}` : encodedSheetName;
    return `${this.baseUrl}/${this.spreadsheetId}/values/${fullRange}?key=${this.apiKey}`;
  }

  // Fazer requisição GET
  async makeRequest(url, options = {}) {
    try {
      console.log("📤 Fazendo requisição para:", url);

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

      const data = await response.json();
      console.log("📥 Resposta recebida:", data);
      return data;
    } catch (error) {
      console.error("❌ Erro na requisição:", error);
      throw error;
    }
  }

  // Obter dados da planilha de polos
  async getSheetData(useCache = true) {
    const cacheKey = `polos_sheet_data`;

    // Verificar cache
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log("📦 Usando dados do cache");
        return cached.data;
      }
    }

    try {
      const url = this.buildUrl();
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
      console.error(`❌ Erro ao obter dados da planilha de polos:`, error);
      throw error;
    }
  }

  // Obter todos os polos (VERSÃO CORRIGIDA)
  async getAllPolos() {
    try {
      console.log("🏢 Buscando dados dos polos...");

      // ✨ USAR RANGE ESPECÍFICO (como na sua aplicação que funciona)
      const range = `${this.sheetName}!A2:J`; // Da linha 2 até coluna J
      const url = `${this.baseUrl}/${this.spreadsheetId}/values/${range}?key=${this.apiKey}`;

      console.log("📤 URL da requisição:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const json = await response.json();
      console.log("📥 Resposta JSON:", json);

      const rows = json.values || [];
      console.log("📊 Total de linhas recebidas:", rows.length);

      if (rows.length === 0) {
        console.warn("⚠️ Nenhuma linha de dados encontrada");
        return [];
      }

      // ✨ PROCESSAR DADOS DIRETAMENTE (como na sua aplicação)
      const polos = [];

      rows.forEach((row, index) => {
        // Extrair dados das colunas (baseado na sua aplicação)
        const unidade = row[0]?.toString().trim() || ""; // Coluna A
        const razao = row[1]?.toString().trim() || ""; // Coluna B
        const comercial = row[2]?.toString().trim() || ""; // Coluna C
        const endereco = row[3]?.toString().trim() || ""; // Coluna D
        const cidade = row[4]?.toString().trim() || ""; // Coluna E
        const uf = row[5]?.toString().trim() || ""; // Coluna F
        const cep = row[6]?.toString().trim() || ""; // Coluna G
        const telefones = row[7]?.toString().trim() || ""; // Coluna H
        const email = row[8]?.toString().trim() || ""; // Coluna I
        const responsavel = row[9]?.toString().trim() || ""; // Coluna J

        // ✨ FILTRO SIMPLES (como na sua aplicação)
        if (
          unidade &&
          unidade !== "" &&
          !unidade.toLowerCase().includes("unidade")
        ) {
          const polo = {
            rowIndex: index + 2, // +2 porque começamos da linha 2
            unidade,
            razao,
            comercial,
            endereco,
            cidade,
            uf,
            cep,
            telefones,
            email,
            responsavel,
            // Campos calculados
            nomePolo: unidade || comercial || razao,
            contato: telefones,
            status: "ativo",
          };

          polos.push(polo);

          // Log dos primeiros 3 polos para debug
          if (index < 3) {
            console.log(`📄 Polo ${index + 1}:`, polo);
          }
        }
      });

      console.log("✅ Total de polos processados:", polos.length);

      if (polos.length === 0) {
        console.warn("⚠️ Nenhum polo válido encontrado após processamento");
        console.log("🔍 Primeiras 5 linhas brutas:", rows.slice(0, 5));
      }

      return polos;
    } catch (error) {
      console.error("❌ Erro ao obter polos:", error);
      throw error;
    }
  }

  // Filtrar polos por critérios
  filterPolos(polos, filters = {}) {
    let filteredPolos = [...polos];

    // Filtro por texto de busca
    if (filters.search && filters.search.trim() !== "") {
      const searchTerm = filters.search.toLowerCase();
      filteredPolos = filteredPolos.filter(
        (polo) =>
          polo.unidade.toLowerCase().includes(searchTerm) ||
          polo.razao.toLowerCase().includes(searchTerm) ||
          polo.comercial.toLowerCase().includes(searchTerm) ||
          polo.cidade.toLowerCase().includes(searchTerm) ||
          polo.responsavel.toLowerCase().includes(searchTerm)
      );
    }

    // Filtro por UF
    if (filters.uf && filters.uf !== "") {
      filteredPolos = filteredPolos.filter(
        (polo) => polo.uf.toUpperCase() === filters.uf.toUpperCase()
      );
    }

    // Filtro por status
    if (filters.status && filters.status !== "") {
      filteredPolos = filteredPolos.filter(
        (polo) => polo.status === filters.status
      );
    }

    return filteredPolos;
  }

  // Obter estatísticas dos polos
  async getPolosStats() {
    try {
      const polos = await this.getAllPolos();

      const stats = {
        total: polos.length,
        ativos: 0,
        inativos: 0,
        byState: {},
        byRegion: {
          norte: 0,
          nordeste: 0,
          centrooeste: 0,
          sudeste: 0,
          sul: 0,
        },
        recentActivity: [],
      };

      // Mapeamento de estados por região
      const regioes = {
        norte: ["AC", "AP", "AM", "PA", "RO", "RR", "TO"],
        nordeste: ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"],
        centrooeste: ["DF", "GO", "MT", "MS"],
        sudeste: ["ES", "MG", "RJ", "SP"],
        sul: ["PR", "RS", "SC"],
      };

      polos.forEach((polo) => {
        // Contar por status
        if (polo.status === "ativo") {
          stats.ativos++;
        } else {
          stats.inativos++;
        }

        // Contar por estado
        if (polo.uf) {
          const uf = polo.uf.toUpperCase();
          stats.byState[uf] = (stats.byState[uf] || 0) + 1;

          // Contar por região
          Object.keys(regioes).forEach((regiao) => {
            if (regioes[regiao].includes(uf)) {
              stats.byRegion[regiao]++;
            }
          });
        }
      });

      // Atividade recente
      stats.recentActivity = polos
        .slice(-5)
        .reverse()
        .map((polo) => ({
          type: "polo_info",
          message: `Polo: ${polo.nomePolo} - ${polo.cidade}/${polo.uf}`,
          time: new Date().toISOString(),
          polo: polo,
        }));

      console.log("📊 Estatísticas dos polos:", stats);
      return stats;
    } catch (error) {
      console.error("❌ Erro ao obter estatísticas dos polos:", error);
      throw error;
    }
  }

  // Obter polos por estado
  async getPolosByState(uf) {
    try {
      const polos = await this.getAllPolos();
      return polos.filter((polo) => polo.uf.toUpperCase() === uf.toUpperCase());
    } catch (error) {
      console.error(`❌ Erro ao obter polos do estado ${uf}:`, error);
      throw error;
    }
  }

  // Buscar polo por nome/unidade
  async searchPolos(searchTerm) {
    try {
      const polos = await this.getAllPolos();
      const term = searchTerm.toLowerCase();

      return polos.filter(
        (polo) =>
          polo.unidade.toLowerCase().includes(term) ||
          polo.razao.toLowerCase().includes(term) ||
          polo.comercial.toLowerCase().includes(term) ||
          polo.cidade.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error(`❌ Erro ao buscar polos:`, error);
      throw error;
    }
  }

  // Limpar cache
  clearCache() {
    this.cache.clear();
    console.log("🧹 Cache dos polos limpo");
  }

  // Verificar conectividade com a planilha de polos
  async testConnection() {
    try {
      console.log("🔗 Testando conexão com planilha de polos...");

      const range = `${this.sheetName}!A1:J1`; // Apenas primeira linha para teste
      const url = `${this.baseUrl}/${this.spreadsheetId}/values/${range}?key=${this.apiKey}`;

      const response = await fetch(url);
      const json = await response.json();

      return {
        success: true,
        spreadsheetTitle: "Planilha de Polos",
        sheetName: this.sheetName,
        totalRows: json.values ? json.values.length : 0,
        message: "Conexão com planilha de polos estabelecida com sucesso",
      };
    } catch (error) {
      console.error("❌ Erro ao testar conexão com polos:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Exportar dados dos polos para CSV
  exportToCSV(polos, filename = "polos_ativos.csv") {
    try {
      const headers = [
        "Unidade",
        "Razão Social",
        "Nome Comercial",
        "Endereço",
        "Cidade",
        "UF",
        "CEP",
        "Telefones",
        "E-mail",
        "Responsável",
      ];

      const csvData = polos.map((polo) => [
        polo.unidade,
        polo.razao,
        polo.comercial,
        polo.endereco,
        polo.cidade,
        polo.uf,
        polo.cep,
        polo.telefones,
        polo.email,
        polo.responsavel,
      ]);

      // Adicionar headers
      csvData.unshift(headers);

      // Converter para CSV
      const csvContent = csvData
        .map((row) => row.map((field) => `"${field || ""}"`).join(","))
        .join("\n");

      // Download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("✅ Dados dos polos exportados para CSV");
      return true;
    } catch (error) {
      console.error("❌ Erro ao exportar dados dos polos:", error);
      return false;
    }
  }

  // Debug: Mostrar estrutura da planilha
  async debugSheetStructure() {
    try {
      const sheetData = await this.getSheetData(false);

      console.log("🔍 DEBUG - Estrutura da planilha de polos:");
      console.log("📊 Total de linhas:", sheetData.values?.length || 0);

      if (sheetData.values && sheetData.values.length > 0) {
        console.log("📋 Headers (linha 1):", sheetData.values[0]);

        if (sheetData.values.length > 1) {
          console.log("📄 Primeira linha de dados:", sheetData.values[1]);
        }

        if (sheetData.values.length > 2) {
          console.log("📄 Segunda linha de dados:", sheetData.values[2]);
        }
      }

      return sheetData;
    } catch (error) {
      console.error("❌ Erro no debug:", error);
      throw error;
    }
  }
  // Adicionar no final da classe PolosAPI
  async debugData() {
    try {
      console.log("🔍 DEBUG: Analisando dados da planilha...");

      const sheetData = await this.getSheetData(false);
      console.log(
        "📊 Total de linhas na planilha:",
        sheetData.values?.length || 0
      );

      if (sheetData.values && sheetData.values.length > 0) {
        console.log("📋 Headers (linha 1):", sheetData.values[0]);

        if (sheetData.values.length > 1) {
          console.log(
            "📄 Segunda linha (primeira linha de dados):",
            sheetData.values[1]
          );
        }

        if (sheetData.values.length > 2) {
          console.log("📄 Terceira linha:", sheetData.values[2]);
        }
      }

      // Testar processamento
      const polos = await this.getAllPolos();
      console.log("🏢 Polos processados:", polos.length);

      if (polos.length > 0) {
        console.log("📋 Primeiro polo processado:", polos[0]);
        console.log("📋 Segundo polo processado:", polos[1]);
      }

      return { sheetData, polos };
    } catch (error) {
      console.error("❌ Erro no debug:", error);
      return { error: error.message };
    }
  }
}
