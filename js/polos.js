class PolosAPI {
  constructor() {
    this.apiKey = "AIzaSyD_tcEft1u37kUNCTDEUE-NvOHGQn6ZRSI";
    this.spreadsheetId = "1IxAnU18qxiEf-TjvqBEEj9L1W3CsY3-DHDxREV4APmk";
    this.sheetName = "Página1";

    console.log("✅ PolosAPI inicializada");
  }

  // ✨ FUNÇÃO PRINCIPAL - EXATAMENTE COMO SUA APLICAÇÃO QUE FUNCIONA
  async getAllPolos() {
    try {
      console.log("🏢 Carregando polos da planilha...");

      // URL EXATA como na sua aplicação
      const range = `${this.sheetName}!A2:J`;
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}?key=${this.apiKey}`;

      console.log("📤 URL:", url);

      const response = await fetch(url);
      const json = await response.json();
      const rows = json.values || [];

      console.log("📥 Linhas recebidas:", rows.length);

      // PROCESSAR EXATAMENTE COMO SUA APLICAÇÃO
      const polos = [];

      rows.forEach((row, index) => {
        const unidade = row[0]?.trim() || "";
        const razao = row[1]?.trim() || "";
        const comercial = row[2]?.trim() || "";
        const endereco = row[3]?.trim() || "";
        const cidade = row[4]?.trim() || "";
        const uf = row[5]?.trim() || "";
        const cep = row[6]?.trim() || "";
        const telefones = row[7]?.trim() || "";
        const email = row[8]?.trim() || "";
        const responsavel = row[9]?.trim() || "";

        // FILTRO SIMPLES - se tem unidade, adiciona
        if (unidade && unidade !== "" && unidade !== "UNIDADE") {
          polos.push({
            rowIndex: index + 2,
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
            nomePolo: unidade,
            contato: telefones,
            status: "ativo",
          });
        }
      });

      console.log("✅ Polos processados:", polos.length);

      // Log dos primeiros polos para verificação
      if (polos.length > 0) {
        console.log("📄 Primeiro polo:", polos[0]);
        console.log("📄 Segundo polo:", polos[1]);
      } else {
        console.warn("⚠️ Nenhum polo encontrado!");
        console.log("🔍 Primeiras 5 linhas brutas:", rows.slice(0, 5));
      }

      return polos;
    } catch (error) {
      console.error("❌ Erro ao carregar polos:", error);
      return [];
    }
  }

  // Estatísticas simples
  async getPolosStats() {
    const polos = await this.getAllPolos();
    return {
      total: polos.length,
      ativos: polos.length,
      inativos: 0,
      byState: {},
      byRegion: {
        norte: 0,
        nordeste: 0,
        centrooeste: 0,
        sudeste: polos.filter((p) => ["SP", "RJ", "MG", "ES"].includes(p.uf))
          .length,
        sul: 0,
      },
    };
  }

  // Filtros simples
  filterPolos(polos, filters = {}) {
    let filtered = [...polos];

    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.unidade.toLowerCase().includes(term) ||
          p.cidade.toLowerCase().includes(term)
      );
    }

    if (filters.uf) {
      filtered = filtered.filter((p) => p.uf === filters.uf);
    }

    return filtered;
  }

  // Teste de conexão simples
  async testConnection() {
    try {
      const polos = await this.getAllPolos();
      return {
        success: true,
        message: `Conexão OK - ${polos.length} polos encontrados`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Export simples
  exportToCSV(polos, filename = "polos.csv") {
    try {
      const headers = [
        "Unidade",
        "Razão Social",
        "Cidade",
        "UF",
        "Telefones",
        "Email",
      ];
      const csvData = [headers];

      polos.forEach((polo) => {
        csvData.push([
          polo.unidade,
          polo.razao,
          polo.cidade,
          polo.uf,
          polo.telefones,
          polo.email,
        ]);
      });

      const csvContent = csvData
        .map((row) => row.map((field) => `"${field || ""}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = filename;
      link.click();

      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error("Erro no export:", error);
      return false;
    }
  }
}
