class GoogleSheetsAPI {
  constructor() {
    this.spreadsheetId = "YOUR_SPREADSHEET_ID"; // Substitua pelo ID da sua planilha
    this.apiKey = "YOUR_API_KEY"; // Substitua pela sua API Key
    this.clientId = "YOUR_CLIENT_ID"; // Substitua pelo seu Client ID
    this.discoveryDoc =
      "https://sheets.googleapis.com/$discovery/rest?version=v4";
    this.scopes = "https://www.googleapis.com/auth/spreadsheets";
    this.gapi = null;
    this.tokenClient = null;
    this.gapiInited = false;
    this.gisInited = false;
  }

  async init() {
    await this.gapiLoaded();
    await this.gisLoaded();
  }

  async gapiLoaded() {
    await gapi.load("client", async () => {
      await gapi.client.init({
        apiKey: this.apiKey,
        discoveryDocs: [this.discoveryDoc],
      });
      this.gapiInited = true;
      this.maybeEnableButtons();
    });
  }

  gisLoaded() {
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: this.clientId,
      scope: this.scopes,
      callback: "", // defined later
    });
    this.gisInited = true;
    this.maybeEnableButtons();
  }

  maybeEnableButtons() {
    if (this.gapiInited && this.gisInited) {
      console.log("Google Sheets API ready");
    }
  }

  async authorize() {
    return new Promise((resolve, reject) => {
      this.tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
          reject(resp);
        }
        resolve(resp);
      };

      if (gapi.client.getToken() === null) {
        this.tokenClient.requestAccessToken({ prompt: "consent" });
      } else {
        this.tokenClient.requestAccessToken({ prompt: "" });
      }
    });
  }

  // Adicionar dados à aba DADOS INICIAIS
  async adicionarDadosIniciais(parceiro) {
    try {
      await this.authorize();

      const now = new Date();
      const numeroContrato = this.gerarNumeroContrato();

      const values = [
        [
          numeroContrato, // A - Nº CONTRATO
          now.getFullYear(), // B - ANO
          now.getMonth() + 1, // C - MÊS
          now.getDate(), // D - DIA
          parceiro.nome, // E - NOME
          parceiro.rg, // F - RG
          parceiro.cpf, // G - CPF
          parceiro.email, // H - EMAIL
          parceiro.cnpj, // I - CNPJ
          parceiro.cep, // J - CEP
          parceiro.rua, // K - RUA
          parceiro.numero, // L - NÚMERO
          parceiro.bairro, // M - BAIRRO
          parceiro.cidade, // N - CIDADE
          parceiro.uf, // O - UF
          parceiro.razaoSocial, // P - RAZÃO SOCIAL
          parceiro.nomeComercial, // Q - NOME COMERCIAL
          parceiro.nomeAcademico, // R - NOME ACADÊMICO
          parceiro.nomeTestemunha, // S - NOME TESTEMUNHA
          parceiro.emailTestemunha, // T - E-MAIL TESTEMUNHA
          parceiro.cpfTestemunha, // U - CPF TESTEMUNHA
          parceiro.contato, // V - CONTATO
          parceiro.tipoParceria, // W - TIPO DE PARCERIA
          parceiro.captadoPor, // X - CAPTADO POR
        ],
      ];

      const request = {
        spreadsheetId: this.spreadsheetId,
        range: "DADOS INICIAIS!A:X",
        valueInputOption: "USER_ENTERED",
        resource: {
          values: values,
        },
      };

      const response = await gapi.client.sheets.spreadsheets.values.append(
        request
      );

      // Adicionar também nas outras abas
      await this.adicionarCadastroFinais(parceiro);
      await this.adicionarDadosTreinamento(parceiro);

      return response;
    } catch (error) {
      console.error("Erro ao adicionar dados iniciais:", error);
      throw error;
    }
  }

  // Adicionar dados à aba CADASTRO FINAIS
  async adicionarCadastroFinais(parceiro) {
    const values = [
      [
        parceiro.nome, // A - NOME
        parceiro.cidade, // B - CIDADE
        parceiro.uf, // C - UF
        "Pendente", // D - SOLICITAR A CRIAÇÃO DE EMAIL PARA O POLO
        "Pendente", // E - CADASTROS NOS SISTEMAS
        "Pendente", // F - SOLICITAR AO PARCEIRO O CADASTRO NO PORTAL
        "Pendente", // G - SOLICITAR ACESSO DO PARCEIRO AO PINCEL ATÔMICO
        "Pendente", // H - CRIAR PASTA DE POLO NO DRIVE
        "Pendente", // I - ENVIAR PARA ABA DE CAPTAÇÃO
        "Pendente", // J - DIRECIONAR PARCEIRO PARA LORRAINE
      ],
    ];

    const request = {
      spreadsheetId: this.spreadsheetId,
      range: "CADASTRO FINAIS!A:J",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: values,
      },
    };

    return await gapi.client.sheets.spreadsheets.values.append(request);
  }

  // Adicionar dados à aba DADOS TREINAMENTO
  async adicionarDadosTreinamento(parceiro) {
    const values = [
      [
        parceiro.nome, // A - NOME
        parceiro.cidade, // B - CIDADE
        parceiro.uf, // C - UF
        "Aguardando", // D - STATUS
        "Pendente", // E - CADASTRO
        "Pendente", // F - CONTATO LORRAINE
        "", // G - TREINAMENTO INICIA
        "Pendente", // H - CURSO CADEMI
        "Pendente", // I - TREINAMENTO COMERCIAL
      ],
    ];

    const request = {
      spreadsheetId: this.spreadsheetId,
      range: "DADOS TREINAMENTO!A:I",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: values,
      },
    };

    return await gapi.client.sheets.spreadsheets.values.append(request);
  }

  // Buscar todos os parceiros
  async buscarParceiros() {
    try {
      await this.authorize();

      const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: "DADOS INICIAIS!A2:X",
      });

      const rows = response.result.values;
      if (!rows || rows.length === 0) {
        return [];
      }

      return rows.map((row) => ({
        numeroContrato: row[0] || "",
        ano: row[1] || "",
        mes: row[2] || "",
        dia: row[3] || "",
        nome: row[4] || "",
        rg: row[5] || "",
        cpf: row[6] || "",
        email: row[7] || "",
        cnpj: row[8] || "",
        cep: row[9] || "",
        rua: row[10] || "",
        numero: row[11] || "",
        bairro: row[12] || "",
        cidade: row[13] || "",
        uf: row[14] || "",
        razaoSocial: row[15] || "",
        nomeComercial: row[16] || "",
        nomeAcademico: row[17] || "",
        nomeTestemunha: row[18] || "",
        emailTestemunha: row[19] || "",
        cpfTestemunha: row[20] || "",
        contato: row[21] || "",
        tipoParceria: row[22] || "",
        captadoPor: row[23] || "",
      }));
    } catch (error) {
      console.error("Erro ao buscar parceiros:", error);
      throw error;
    }
  }

  gerarNumeroContrato() {
    const now = new Date();
    const ano = now.getFullYear();
    const mes = String(now.getMonth() + 1).padStart(2, "0");
    const dia = String(now.getDate()).padStart(2, "0");
    const hora = String(now.getHours()).padStart(2, "0");
    const minuto = String(now.getMinutes()).padStart(2, "0");

    return `${ano}${mes}${dia}${hora}${minuto}`;
  }
}

// Instância global
const sheetsAPI = new GoogleSheetsAPI();
