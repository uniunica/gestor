// Aplicação Principal
class PartnersApp {
  constructor() {
    this.currentTab = "dashboard";
    this.currentEditId = null;
    this.init();
  }

  async init() {
    try {
      // Verificar autenticação
      if (!localStorage.getItem("isLoggedIn")) {
        window.location.href = "login.html";
        return;
      }

      // Configurar interface
      this.setupUI();
      this.setupEventListeners();
      this.setupFormValidation();

      // NOVO: Testar conexão com Google Sheets
      console.log("Iniciando teste de conexão...");
      await sheetsAPI.testConnection();

      // Carregar dados iniciais
      await this.loadDashboard();

      // Configurar atualização automática
      this.setupAutoRefresh();
    } catch (error) {
      console.error("Erro ao inicializar aplicação:", error);
      toast.error("Erro ao carregar aplicação");
    }
  }

  setupUI() {
    // Configurar informações do usuário
    const userInfo = document.getElementById("userInfo");
    if (userInfo) {
      userInfo.textContent = `Bem-vindo, ${
        localStorage.getItem("username") || "Admin"
      }!`;
    }

    // Configurar máscaras de input
    this.setupInputMasks();

    // Configurar auto-complete de CEP
    this.setupCEPAutoComplete();
  }

  setupEventListeners() {
    // Navegação por abas
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // Formulário de cadastro
    const parceiroForm = document.getElementById("parceiroForm");
    if (parceiroForm) {
      parceiroForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleParceiroSubmit();
      });
    }

    // Busca
    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("searchInput");

    if (searchBtn) {
      searchBtn.addEventListener("click", () => this.handleSearch());
    }

    if (searchInput) {
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.handleSearch();
        }
      });

      // Busca em tempo real com debounce
      searchInput.addEventListener(
        "input",
        Utils.debounce(() => this.handleSearch(), 500)
      );
    }

    // Filtros
    document
      .getElementById("filterTipo")
      ?.addEventListener("change", () => this.handleSearch());
    document
      .getElementById("filterStatus")
      ?.addEventListener("change", () => this.handleSearch());

    // Botões de refresh
    document
      .getElementById("refreshDadosIniciais")
      ?.addEventListener("click", () => this.loadDadosIniciais());
    document
      .getElementById("refreshCadastroFinais")
      ?.addEventListener("click", () => this.loadCadastroFinais());
    document
      .getElementById("refreshDadosTreinamento")
      ?.addEventListener("click", () => this.loadDadosTreinamento());

    // Modal
    document
      .querySelector(".modal-close")
      ?.addEventListener("click", () => this.closeModal());
    document.getElementById("editModal")?.addEventListener("click", (e) => {
      if (e.target.id === "editModal") {
        this.closeModal();
      }
    });

    // Logout
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
      if (confirm("Deseja realmente sair do sistema?")) {
        localStorage.clear();
        window.location.href = "login.html";
      }
    });
  }

  setupInputMasks() {
    // Máscara para CPF
    const cpfInputs = document.querySelectorAll(
      'input[name="cpf"], input[name="cpfTestemunha"]'
    );
    cpfInputs.forEach((input) => {
      input.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "");
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
        e.target.value = value;
      });
    });

    // Máscara para CNPJ
    const cnpjInput = document.querySelector('input[name="cnpj"]');
    if (cnpjInput) {
      cnpjInput.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "");
        value = value.replace(
          /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
          "$1.$2.$3/$4-$5"
        );
        e.target.value = value;
      });
    }

    // Máscara para CEP
    const cepInput = document.querySelector('input[name="cep"]');
    if (cepInput) {
      cepInput.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "");
        value = value.replace(/(\d{5})(\d{3})/, "$1-$2");
        e.target.value = value;
      });
    }

    // Máscara para telefone
    const contatoInput = document.querySelector('input[name="contato"]');
    if (contatoInput) {
      contatoInput.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length <= 10) {
          value = value.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
        } else {
          value = value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
        }
        e.target.value = value;
      });
    }
  }

  setupCEPAutoComplete() {
    const cepInput = document.querySelector('input[name="cep"]');
    if (cepInput) {
      cepInput.addEventListener("blur", async (e) => {
        const cep = e.target.value.replace(/\D/g, "");
        if (cep.length === 8) {
          loading.show("Buscando CEP...");
          const data = await Utils.fetchCEP(cep);
          loading.hide();

          if (data) {
            document.querySelector('input[name="rua"]').value =
              data.logradouro || "";
            document.querySelector('input[name="bairro"]').value =
              data.bairro || "";
            document.querySelector('input[name="cidade"]').value =
              data.localidade || "";
            document.querySelector('select[name="uf"]').value = data.uf || "";
          }
        }
      });
    }
  }

  setupFormValidation() {
    const form = document.getElementById("parceiroForm");
    if (!form) return;

    // Validação em tempo real
    form.querySelectorAll("input, select").forEach((field) => {
      field.addEventListener("blur", () => this.validateField(field));
      field.addEventListener("input", () => this.clearFieldError(field));
    });
  }

  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = "";

    // Validações específicas por campo
    switch (field.name) {
      case "nome":
        if (!value) {
          isValid = false;
          errorMessage = "Nome é obrigatório";
        }
        break;

      case "cpf":
      case "cpfTestemunha":
        if (value && !Utils.validateCPF(value)) {
          isValid = false;
          errorMessage = "CPF inválido";
        }
        break;

      case "cnpj":
        if (value && !Utils.validateCNPJ(value)) {
          isValid = false;
          errorMessage = "CNPJ inválido";
        }
        break;

      case "email":
      case "emailTestemunha":
        if (value && !Utils.validateEmail(value)) {
          isValid = false;
          errorMessage = "E-mail inválido";
        }
        break;
    }

    // Aplicar estilo de erro
    if (!isValid) {
      field.classList.add("error");
      this.showFieldError(field, errorMessage);
    } else {
      field.classList.remove("error");
      this.clearFieldError(field);
    }

    return isValid;
  }

  showFieldError(field, message) {
    this.clearFieldError(field);
    const errorDiv = document.createElement("div");
    errorDiv.className = "field-error";
    errorDiv.textContent = message;
    errorDiv.style.color = "#dc3545";
    errorDiv.style.fontSize = "12px";
    errorDiv.style.marginTop = "5px";
    field.parentNode.appendChild(errorDiv);
  }

  clearFieldError(field) {
    const errorDiv = field.parentNode.querySelector(".field-error");
    if (errorDiv) {
      errorDiv.remove();
    }
  }

  switchTab(tabName) {
    // Atualizar botões
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");

    // Atualizar conteúdo
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active");
    });
    document.getElementById(tabName).classList.add("active");

    this.currentTab = tabName;

    // Carregar dados específicos da aba
    this.loadTabData(tabName);
  }

  async loadTabData(tabName) {
    try {
      switch (tabName) {
        case "dashboard":
          await this.loadDashboard();
          break;
        case "dados-iniciais":
          await this.loadDadosIniciais();
          break;
        case "cadastro-finais":
          await this.loadCadastroFinais();
          break;
        case "dados-treinamento":
          await this.loadDadosTreinamento();
          break;
      }
    } catch (error) {
      console.error(`Erro ao carregar dados da aba ${tabName}:`, error);
      toast.error("Erro ao carregar dados");
    }
  }

  async loadDashboard() {
    try {
      loading.show("Carregando dashboard...");

      // Carregar estatísticas
      const stats = await sheetsAPI.getStats();

      // Atualizar cards de estatísticas
      document.getElementById("totalParceiros").textContent =
        stats.totalParceiros;
      document.getElementById("emTreinamento").textContent =
        stats.emTreinamento;
      document.getElementById("parceirosAtivos").textContent =
        stats.parceirosAtivos;

      // Carregar lista de parceiros
      await this.loadParceirosList();
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      toast.error("Erro ao carregar dashboard");
    } finally {
      loading.hide();
    }
  }

  async loadParceirosList(query = "", filters = {}) {
    try {
      const parceiros = await sheetsAPI.searchParceiros(query, filters);
      const container = document.getElementById("parceirosList");

      if (!container) return;

      if (parceiros.length === 0) {
        container.innerHTML = `
                    <div class="empty-state">
                        <h3>Nenhum parceiro encontrado</h3>
                        <p>Tente ajustar os filtros de busca ou cadastre um novo parceiro.</p>
                    </div>
                `;
        return;
      }

      container.innerHTML = parceiros
        .map(
          (parceiro) => `
                <div class="parceiro-card">
                    <div class="parceiro-header">
                        <h3 class="parceiro-name">${Utils.sanitizeString(
                          parceiro.nome || "Nome não informado"
                        )}</h3>
                        <span class="parceiro-status status-${(
                          parceiro.status || "cadastrado"
                        )
                          .toLowerCase()
                          .replace(" ", "-")}">
                            ${parceiro.status || "Cadastrado"}
                        </span>
                    </div>

                    <div class="parceiro-info">
                        <div class="parceiro-info-item">
                            <span class="parceiro-info-label">CPF</span>
                            <span class="parceiro-info-value">${Utils.sanitizeString(
                              parceiro.cpf || "Não informado"
                            )}</span>
                        </div>
                        <div class="parceiro-info-item">
                            <span class="parceiro-info-label">E-mail</span>
                            <span class="parceiro-info-value">${Utils.sanitizeString(
                              parceiro.email || "Não informado"
                            )}</span>
                        </div>
                        <div class="parceiro-info-item">
                            <span class="parceiro-info-label">Cidade</span>
                            <span class="parceiro-info-value">${Utils.sanitizeString(
                              parceiro.cidade || "Não informado"
                            )} - ${Utils.sanitizeString(
            parceiro.uf || ""
          )}</span>
                        </div>
                        <div class="parceiro-info-item">
                            <span class="parceiro-info-label">Tipo</span>
                            <span class="parceiro-info-value">${Utils.sanitizeString(
                              parceiro.tipoParceria || "Não informado"
                            )}</span>
                        </div>
                    </div>

                    <div class="parceiro-actions">
                        <button class="btn btn-primary" onclick="app.editParceiro('${
                          parceiro.id
                        }')">
                            ✏️ Editar
                        </button>
                        <button class="btn btn-warning" onclick="app.viewParceiro('${
                          parceiro.id
                        }')">
                            👁️ Ver Detalhes
                        </button>
                        <button class="btn btn-danger" onclick="app.deleteParceiro('${
                          parceiro.id
                        }')">
                            🗑️ Excluir
                        </button>
                    </div>
                </div>
            `
        )
        .join("");
    } catch (error) {
      console.error("Erro ao carregar lista de parceiros:", error);
      toast.error("Erro ao carregar parceiros");
    }
  }

  async handleSearch() {
    const query = document.getElementById("searchInput")?.value || "";
    const filters = {
      tipo: document.getElementById("filterTipo")?.value || "",
      status: document.getElementById("filterStatus")?.value || "",
    };

    await this.loadParceirosList(query, filters);
  }

  async handleParceiroSubmit() {
    try {
      const form = document.getElementById("parceiroForm");
      const formData = new FormData(form);

      // Validar formulário
      let isValid = true;
      form
        .querySelectorAll("input[required], select[required]")
        .forEach((field) => {
          if (!this.validateField(field)) {
            isValid = false;
          }
        });

      if (!isValid) {
        toast.error("Por favor, corrija os erros no formulário");
        return;
      }

      loading.show("Salvando parceiro...");

      // Preparar dados
      const now = new Date();
      const parceiroData = [
        Utils.generateContractNumber(), // Número do contrato
        now.getFullYear(), // Ano
        now.getMonth() + 1, // Mês
        now.getDate(), // Dia
        formData.get("nome"),
        formData.get("rg"),
        formData.get("cpf"),
        formData.get("email"),
        formData.get("cnpj"),
        formData.get("cep"),
        formData.get("rua"),
        formData.get("numero"),
        formData.get("bairro"),
        formData.get("cidade"),
        formData.get("uf"),
        formData.get("razaoSocial"),
        formData.get("nomeComercial"),
        formData.get("nomeAcademico"),
        formData.get("nomeTestemunha"),
        formData.get("emailTestemunha"),
        formData.get("cpfTestemunha"),
        formData.get("contato"),
        formData.get("tipoParceria"),
        formData.get("captadoPor"),
      ];

      // Salvar dados
      if (this.currentEditId) {
        await sheetsAPI.updateRow(
          sheetsAPI.sheets.dadosIniciais,
          this.currentEditId,
          parceiroData
        );
        this.currentEditId = null;
      } else {
        await sheetsAPI.appendRow(sheetsAPI.sheets.dadosIniciais, parceiroData);
      }

      // Limpar formulário e atualizar interface
      form.reset();
      this.switchTab("dashboard");
    } catch (error) {
      console.error("Erro ao salvar parceiro:", error);
      toast.error("Erro ao salvar parceiro");
    } finally {
      loading.hide();
    }
  }

  async loadDadosIniciais() {
    try {
      loading.show("Carregando dados iniciais...");

      const data = await sheetsAPI.getAllData(sheetsAPI.sheets.dadosIniciais);
      const tbody = document.querySelector("#dadosIniciaisTable tbody");

      if (!tbody) return;

      if (data.length === 0) {
        tbody.innerHTML = `
                    <tr>
                        <td colspan="9" class="text-center">Nenhum dado encontrado</td>
                    </tr>
                `;
        return;
      }

      tbody.innerHTML = data
        .map(
          (item) => `
                <tr>
                    <td>${Utils.sanitizeString(item.numeroContrato || "")}</td>
                    <td>${item.dia}/${item.mes}/${item.ano}</td>
                    <td>${Utils.sanitizeString(item.nome || "")}</td>
                    <td>${Utils.sanitizeString(item.cpf || "")}</td>
                    <td>${Utils.sanitizeString(item.email || "")}</td>
                    <td>${Utils.sanitizeString(item.cidade || "")}</td>
                    <td>${Utils.sanitizeString(item.uf || "")}</td>
                    <td>${Utils.sanitizeString(item.tipoParceria || "")}</td>
                    <td class="actions">
                        <button class="btn btn-primary" onclick="app.editParceiro('${
                          item.id
                        }')">Editar</button>
                        <button class="btn btn-danger" onclick="app.deleteParceiro('${
                          item.id
                        }')">Excluir</button>
                    </td>
                </tr>
            `
        )
        .join("");
    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      loading.hide();
    }
  }

  async loadCadastroFinais() {
    try {
      loading.show("Carregando cadastros finais...");

      const data = await sheetsAPI.getAllData(sheetsAPI.sheets.cadastroFinais);
      const tbody = document.querySelector("#cadastroFinaisTable tbody");

      if (!tbody) return;

      if (data.length === 0) {
        tbody.innerHTML = `
                    <tr>
                        <td colspan="9" class="text-center">Nenhum dado encontrado</td>
                    </tr>
                `;
        return;
      }

      tbody.innerHTML = data
        .map(
          (item) => `
                <tr>
                    <td>${Utils.sanitizeString(item.nome || "")}</td>
                    <td>${Utils.sanitizeString(item.cidade || "")}</td>
                    <td>${Utils.sanitizeString(item.uf || "")}</td>
                    <td>${item.emailPolo ? "✅" : "❌"}</td>
                    <td>${item.sistemas ? "✅" : "❌"}</td>
                    <td>${item.portalParceiro ? "✅" : "❌"}</td>
                    <td>${item.pincelAtomico ? "✅" : "❌"}</td>
                    <td>${item.pastaDrive ? "✅" : "❌"}</td>
                    <td class="actions">
                        <button class="btn btn-primary" onclick="app.editCadastroFinal('${
                          item.id
                        }')">Editar</button>
                    </td>
                </tr>
            `
        )
        .join("");
    } catch (error) {
      console.error("Erro ao carregar cadastros finais:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      loading.hide();
    }
  }

  async loadDadosTreinamento() {
    try {
      loading.show("Carregando dados de treinamento...");

      const data = await sheetsAPI.getAllData(
        sheetsAPI.sheets.dadosTreinamento
      );
      const tbody = document.querySelector("#dadosTreinamentoTable tbody");

      if (!tbody) return;

      if (data.length === 0) {
        tbody.innerHTML = `
                    <tr>
                        <td colspan="10" class="text-center">Nenhum dado encontrado</td>
                    </tr>
                `;
        return;
      }

      tbody.innerHTML = data
        .map(
          (item) => `
                <tr>
                    <td>${Utils.sanitizeString(item.nome || "")}</td>
                    <td>${Utils.sanitizeString(item.cidade || "")}</td>
                    <td>${Utils.sanitizeString(item.uf || "")}</td>
                    <td>
                        <span class="parceiro-status status-${(
                          item.status || "cadastrado"
                        )
                          .toLowerCase()
                          .replace(" ", "-")}">
                            ${item.status || "Cadastrado"}
                        </span>
                    </td>
                    <td>${item.cadastro ? "✅" : "❌"}</td>
                    <td>${item.contatoLorraine ? "✅" : "❌"}</td>
                    <td>${Utils.sanitizeString(
                      item.treinamentoInicia || ""
                    )}</td>
                    <td>${item.cursoCademi ? "✅" : "❌"}</td>
                    <td>${item.treinamentoComercial ? "✅" : "❌"}</td>
                    <td class="actions">
                        <button class="btn btn-primary" onclick="app.editDadosTreinamento('${
                          item.id
                        }')">Editar</button>
                    </td>
                </tr>
            `
        )
        .join("");
    } catch (error) {
      console.error("Erro ao carregar dados de treinamento:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      loading.hide();
    }
  }

  async editParceiro(id) {
    try {
      loading.show("Carregando dados do parceiro...");

      const data = await sheetsAPI.getAllData(sheetsAPI.sheets.dadosIniciais);
      const parceiro = data.find((item) => item.id === id);

      if (!parceiro) {
        toast.error("Parceiro não encontrado");
        return;
      }

      // Preencher formulário
      this.currentEditId = id;
      this.fillForm(parceiro);
      this.switchTab("cadastro");
    } catch (error) {
      console.error("Erro ao carregar dados do parceiro:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      loading.hide();
    }
  }

  fillForm(data) {
    const form = document.getElementById("parceiroForm");
    if (!form) return;

    Object.keys(data).forEach((key) => {
      const field = form.querySelector(`[name="${key}"]`);
      if (field && data[key]) {
        field.value = data[key];
      }
    });
  }

  async deleteParceiro(id) {
    if (!confirm("Tem certeza que deseja excluir este parceiro?")) {
      return;
    }

    try {
      loading.show("Excluindo parceiro...");

      await sheetsAPI.deleteRow(sheetsAPI.sheets.dadosIniciais, id);

      // Atualizar interface
      if (this.currentTab === "dashboard") {
        await this.loadDashboard();
      } else {
        await this.loadTabData(this.currentTab);
      }
    } catch (error) {
      console.error("Erro ao excluir parceiro:", error);
      toast.error("Erro ao excluir parceiro");
    } finally {
      loading.hide();
    }
  }

  async viewParceiro(id) {
    try {
      loading.show("Carregando detalhes...");

      const data = await sheetsAPI.getAllData(sheetsAPI.sheets.dadosIniciais);
      const parceiro = data.find((item) => item.id === id);

      if (!parceiro) {
        toast.error("Parceiro não encontrado");
        return;
      }

      this.showParceiroModal(parceiro);
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
      toast.error("Erro ao carregar detalhes");
    } finally {
      loading.hide();
    }
  }

  showParceiroModal(parceiro) {
    const modal = document.getElementById("editModal");
    const modalBody = modal.querySelector(".modal-body");

    modalBody.innerHTML = `
            <div class="parceiro-details">
                <div class="detail-section">
                    <h4>📋 Dados Pessoais</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Nome:</label>
                            <span>${Utils.sanitizeString(
                              parceiro.nome || "Não informado"
                            )}</span>
                        </div>
                        <div class="detail-item">
                            <label>RG:</label>
                            <span>${Utils.sanitizeString(
                              parceiro.rg || "Não informado"
                            )}</span>
                        </div>
                        <div class="detail-item">
                            <label>CPF:</label>
                            <span>${Utils.sanitizeString(
                              parceiro.cpf || "Não informado"
                            )}</span>
                        </div>
                        <div class="detail-item">
                            <label>E-mail:</label>
                            <span>${Utils.sanitizeString(
                              parceiro.email || "Não informado"
                            )}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h4>🏢 Dados Empresariais</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>CNPJ:</label>
                            <span>${Utils.sanitizeString(
                              parceiro.cnpj || "Não informado"
                            )}</span>
                        </div>
                        <div class="detail-item">
                            <label>Razão Social:</label>
                            <span>${Utils.sanitizeString(
                              parceiro.razaoSocial || "Não informado"
                            )}</span>
                        </div>
                        <div class="detail-item">
                            <label>Nome Comercial:</label>
                            <span>${Utils.sanitizeString(
                              parceiro.nomeComercial || "Não informado"
                            )}</span>
                        </div>
                        <div class="detail-item">
                            <label>Tipo de Parceria:</label>
                            <span>${Utils.sanitizeString(
                              parceiro.tipoParceria || "Não informado"
                            )}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h4>📍 Endereço</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>CEP:</label>
                            <span>${Utils.sanitizeString(
                              parceiro.cep || "Não informado"
                            )}</span>
                        </div>
                        <div class="detail-item">
                            <label>Rua:</label>
                            <span>${Utils.sanitizeString(
                              parceiro.rua || "Não informado"
                            )}</span>
                        </div>
                        <div class="detail-item">
                            <label>Número:</label>
                            <span>${Utils.sanitizeString(
                              parceiro.numero || "Não informado"
                            )}</span>
                        </div>
                        <div class="detail-item">
                            <label>Bairro:</label>
                            <span>${Utils.sanitizeString(
                              parceiro.bairro || "Não informado"
                            )}</span>
                        </div>
                        <div class="detail-item">
                            <label>Cidade:</label>
                            <span>${Utils.sanitizeString(
                              parceiro.cidade || "Não informado"
                            )}</span>
                        </div>
                        <div class="detail-item">
                            <label>UF:</label>
                            <span>${Utils.sanitizeString(
                              parceiro.uf || "Não informado"
                            )}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h4>👥 Dados da Testemunha</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Nome:</label>
                            <span>${Utils.sanitizeString(
                              parceiro.nomeTestemunha || "Não informado"
                            )}</span>
                        </div>
                        <div class="detail-item">
                            <label>E-mail:</label>
                            <span>${Utils.sanitizeString(
                              parceiro.emailTestemunha || "Não informado"
                            )}</span>
                        </div>
                        <div class="detail-item">
                            <label>CPF:</label>
                            <span>${Utils.sanitizeString(
                              parceiro.cpfTestemunha || "Não informado"
                            )}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-actions">
                    <button class="btn btn-primary" onclick="app.editParceiro('${
                      parceiro.id
                    }'); app.closeModal();">
                        ✏️ Editar Parceiro
                    </button>
                    <button class="btn btn-secondary" onclick="app.closeModal()">
                        Fechar
                    </button>
                </div>
            </div>
        `;

    modal.style.display = "flex";
  }

  async editCadastroFinal(id) {
    try {
      loading.show("Carregando dados...");

      const data = await sheetsAPI.getAllData(sheetsAPI.sheets.cadastroFinais);
      const item = data.find((row) => row.id === id);

      if (!item) {
        toast.error("Registro não encontrado");
        return;
      }

      this.showCadastroFinalModal(item);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      loading.hide();
    }
  }

  showCadastroFinalModal(item) {
    const modal = document.getElementById("editModal");
    const modalBody = modal.querySelector(".modal-body");

    modalBody.innerHTML = `
            <form id="cadastroFinalForm" class="modal-form">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Nome:</label>
                        <input type="text" name="nome" value="${
                          item.nome || ""
                        }" readonly>
                    </div>
                    <div class="form-group">
                        <label>Cidade:</label>
                        <input type="text" name="cidade" value="${
                          item.cidade || ""
                        }" readonly>
                    </div>
                    <div class="form-group">
                        <label>UF:</label>
                        <input type="text" name="uf" value="${
                          item.uf || ""
                        }" readonly>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="emailPolo" ${
                              item.emailPolo ? "checked" : ""
                            }>
                            Solicitar criação de e-mail para o polo
                        </label>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="sistemas" ${
                              item.sistemas ? "checked" : ""
                            }>
                            Cadastros nos sistemas
                        </label>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="portalParceiro" ${
                              item.portalParceiro ? "checked" : ""
                            }>
                            Cadastro no portal do parceiro
                        </label>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="pincelAtomico" ${
                              item.pincelAtomico ? "checked" : ""
                            }>
                            Acesso ao Pincel Atômico
                        </label>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="pastaDrive" ${
                              item.pastaDrive ? "checked" : ""
                            }>
                            Criar pasta no Drive
                        </label>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="enviarCaptacao" ${
                              item.enviarCaptacao ? "checked" : ""
                            }>
                            Enviar para aba de captação
                        </label>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="direcionarLorraine" ${
                              item.direcionarLorraine ? "checked" : ""
                            }>
                            Direcionar para Lorraine
                        </label>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Salvar</button>
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                </div>
            </form>
        `;

    // Configurar evento de submit
    document
      .getElementById("cadastroFinalForm")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveCadastroFinal(item.id);
      });

    modal.style.display = "flex";
  }

  async saveCadastroFinal(id) {
    try {
      loading.show("Salvando...");

      const form = document.getElementById("cadastroFinalForm");
      const formData = new FormData(form);

      const data = [
        formData.get("nome"),
        formData.get("cidade"),
        formData.get("uf"),
        formData.get("emailPolo") ? "Sim" : "Não",
        formData.get("sistemas") ? "Sim" : "Não",
        formData.get("portalParceiro") ? "Sim" : "Não",
        formData.get("pincelAtomico") ? "Sim" : "Não",
        formData.get("pastaDrive") ? "Sim" : "Não",
        formData.get("enviarCaptacao") ? "Sim" : "Não",
        formData.get("direcionarLorraine") ? "Sim" : "Não",
      ];

      await sheetsAPI.updateRow(sheetsAPI.sheets.cadastroFinais, id, data);

      this.closeModal();
      await this.loadCadastroFinais();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar dados");
    } finally {
      loading.hide();
    }
  }

  async editDadosTreinamento(id) {
    try {
      loading.show("Carregando dados...");

      const data = await sheetsAPI.getAllData(
        sheetsAPI.sheets.dadosTreinamento
      );
      const item = data.find((row) => row.id === id);

      if (!item) {
        toast.error("Registro não encontrado");
        return;
      }

      this.showDadosTreinamentoModal(item);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      loading.hide();
    }
  }

  showDadosTreinamentoModal(item) {
    const modal = document.getElementById("editModal");
    const modalBody = modal.querySelector(".modal-body");

    modalBody.innerHTML = `
            <form id="dadosTreinamentoForm" class="modal-form">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Nome:</label>
                        <input type="text" name="nome" value="${
                          item.nome || ""
                        }" readonly>
                    </div>
                    <div class="form-group">
                        <label>Cidade:</label>
                        <input type="text" name="cidade" value="${
                          item.cidade || ""
                        }" readonly>
                    </div>
                    <div class="form-group">
                        <label>UF:</label>
                        <input type="text" name="uf" value="${
                          item.uf || ""
                        }" readonly>
                    </div>
                    <div class="form-group">
                        <label>Status:</label>
                        <select name="status">
                            <option value="Cadastrado" ${
                              item.status === "Cadastrado" ? "selected" : ""
                            }>Cadastrado</option>
                            <option value="Em Treinamento" ${
                              item.status === "Em Treinamento" ? "selected" : ""
                            }>Em Treinamento</option>
                            <option value="Ativo" ${
                              item.status === "Ativo" ? "selected" : ""
                            }>Ativo</option>
                            <option value="Inativo" ${
                              item.status === "Inativo" ? "selected" : ""
                            }>Inativo</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="cadastro" ${
                              item.cadastro ? "checked" : ""
                            }>
                            Cadastro realizado
                        </label>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="contatoLorraine" ${
                              item.contatoLorraine ? "checked" : ""
                            }>
                            Contato com Lorraine
                        </label>
                    </div>
                    <div class="form-group">
                        <label>Data início do treinamento:</label>
                        <input type="date" name="treinamentoInicia" value="${
                          item.treinamentoInicia || ""
                        }">
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="cursoCademi" ${
                              item.cursoCademi ? "checked" : ""
                            }>
                            Curso Cademi concluído
                        </label>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="treinamentoComercial" ${
                              item.treinamentoComercial ? "checked" : ""
                            }>
                            Treinamento comercial concluído
                        </label>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Salvar</button>
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                </div>
            </form>
        `;

    // Configurar evento de submit
    document
      .getElementById("dadosTreinamentoForm")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveDadosTreinamento(item.id);
      });

    modal.style.display = "flex";
  }

  async saveDadosTreinamento(id) {
    try {
      loading.show("Salvando...");

      const form = document.getElementById("dadosTreinamentoForm");
      const formData = new FormData(form);

      const data = [
        formData.get("nome"),
        formData.get("cidade"),
        formData.get("uf"),
        formData.get("status"),
        formData.get("cadastro") ? "Sim" : "Não",
        formData.get("contatoLorraine") ? "Sim" : "Não",
        formData.get("treinamentoInicia"),
        formData.get("cursoCademi") ? "Sim" : "Não",
        formData.get("treinamentoComercial") ? "Sim" : "Não",
      ];

      await sheetsAPI.updateRow(sheetsAPI.sheets.dadosTreinamento, id, data);

      this.closeModal();
      await this.loadDadosTreinamento();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar dados");
    } finally {
      loading.hide();
    }
  }

  closeModal() {
    const modal = document.getElementById("editModal");
    modal.style.display = "none";
  }

  setupAutoRefresh() {
    // Atualizar dados a cada 5 minutos
    setInterval(async () => {
      if (this.currentTab === "dashboard") {
        await this.loadDashboard();
      }
    }, 5 * 60 * 1000);
  }

  // Método para exportar dados
  async exportData(sheetName) {
    try {
      await sheetsAPI.exportToCSV(sheetName);
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      toast.error("Erro ao exportar dados");
    }
  }

  // Método para importar dados (futuro)
  async importData(file, sheetName) {
    try {
      loading.show("Importando dados...");

      // Implementar lógica de importação CSV
      // Por enquanto, apenas placeholder

      toast.info("Funcionalidade de importação será implementada em breve");
    } catch (error) {
      console.error("Erro ao importar dados:", error);
      toast.error("Erro ao importar dados");
    } finally {
      loading.hide();
    }
  }

  // Método para backup de dados
  async backupData() {
    try {
      loading.show("Criando backup...");

      const allData = {
        dadosIniciais: await sheetsAPI.getAllData(
          sheetsAPI.sheets.dadosIniciais
        ),
        cadastroFinais: await sheetsAPI.getAllData(
          sheetsAPI.sheets.cadastroFinais
        ),
        dadosTreinamento: await sheetsAPI.getAllData(
          sheetsAPI.sheets.dadosTreinamento
        ),
        timestamp: new Date().toISOString(),
      };

      const backupJson = JSON.stringify(allData, null, 2);
      const filename = `backup_parceiros_${
        new Date().toISOString().split("T")[0]
      }.json`;

      Utils.downloadFile(backupJson, filename, "application/json");

      toast.success("Backup criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar backup:", error);
      toast.error("Erro ao criar backup");
    } finally {
      loading.hide();
    }
  }
}

// Inicializar aplicação
let app;
document.addEventListener("DOMContentLoaded", () => {
  app = new PartnersApp();
});

// Adicionar estilos CSS para os detalhes do modal
const additionalStyles = `
<style>
.parceiro-details {
    max-width: 100%;
}

.detail-section {
    margin-bottom: 30px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
}

.detail-section h4 {
    margin-bottom: 15px;
    color: #333;
    border-bottom: 2px solid #667eea;
    padding-bottom: 5px;
}

.detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
}

.detail-item {
    display: flex;
    flex-direction: column;
}

.detail-item label {
    font-weight: 600;
    color: #666;
    font-size: 12px;
    text-transform: uppercase;
    margin-bottom: 5px;
}

.detail-item span {
    color: #333;
    font-size: 14px;
    padding: 8px;
    background: white;
    border-radius: 4px;
    border: 1px solid #ddd;
}

.detail-actions {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #ddd;
}

.modal-form .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.modal-form .form-group {
    display: flex;
    flex-direction: column;
}

.modal-form .form-group label {
    margin-bottom: 5px;
    font-weight: 500;
    color: #333;
}

.modal-form .form-group input,
.modal-form .form-group select {
    padding: 10px;
    border: 2px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
}

.modal-form .form-group input[type="checkbox"] {
    width: auto;
    margin-right: 8px;
}

.modal-form .form-group label:has(input[type="checkbox"]) {
    flex-direction: row;
    align-items: center;
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #666;
}

.empty-state h3 {
    margin-bottom: 10px;
    color: #333;
}

@media (max-width: 768px) {
    .detail-grid {
        grid-template-columns: 1fr;
    }

    .detail-actions {
        flex-direction: column;
    }

    .modal-form .form-grid {
        grid-template-columns: 1fr;
    }
}
</style>
`;

// Adicionar estilos ao head
document.head.insertAdjacentHTML("beforeend", additionalStyles);
