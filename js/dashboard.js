class DashboardManager {
  constructor() {
    this.api = new GoogleSheetsAPI();
    this.currentSection = "dashboard";
    this.partners = [];
    this.filteredPartners = [];
    this.currentPage = 1;
    this.partnersPerPage = 10;
    this.currentEditingPartner = null;

    this.init();
  }

  async init() {
    // Verificar autenticação
    if (!this.checkAuth()) {
      window.location.href = "index.html";
      return;
    }

    // Inicializar componentes
    this.initializeEventListeners();
    this.initializeFormValidation();

    // Carregar dados iniciais
    await this.loadInitialData();

    // Configurar auto-refresh
    this.setupAutoRefresh();
  }

  // Verificar autenticação
  checkAuth() {
    const token = localStorage.getItem("authToken");
    const loginTime = localStorage.getItem("loginTime");

    if (!token || !loginTime) {
      return false;
    }

    // Token válido por 8 horas
    const eightHours = 8 * 60 * 60 * 1000;
    const now = Date.now();

    if (now - parseInt(loginTime) > eightHours) {
      this.logout();
      return false;
    }

    return true;
  }

  // Logout
  logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("loginTime");
    window.location.href = "index.html";
  }

  // Inicializar event listeners
  initializeEventListeners() {
    // Sidebar toggle
    const sidebarToggle = document.getElementById("sidebarToggle");
    const mobileMenuToggle = document.getElementById("mobileMenuToggle");
    const sidebar = document.getElementById("sidebar");

    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
      });
    }

    if (mobileMenuToggle) {
      mobileMenuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("show");
      });
    }

    // Navigation links
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        this.switchSection(section);
      });
    });

    // Logout button
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        this.logout();
      });
    }

    // Add partner button
    const addPartnerBtn = document.getElementById("addPartnerBtn");
    if (addPartnerBtn) {
      addPartnerBtn.addEventListener("click", () => {
        this.openPartnerModal();
      });
    }

    // Modal controls
    this.initializeModalControls();

    // Search and filters
    this.initializeSearchAndFilters();

    // Pagination
    this.initializePagination();

    // Form submission
    const partnerForm = document.getElementById("partnerForm");
    if (partnerForm) {
      partnerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.savePartner();
      });
    }

    // CEP lookup
    const cepInput = document.getElementById("cep");
    if (cepInput) {
      cepInput.addEventListener(
        "blur",
        Utils.debounce(async (e) => {
          await this.handleCEPLookup(e.target.value);
        }, 500)
      );
    }

    // Format inputs
    this.initializeInputFormatting();
  }

  // Inicializar controles do modal
  initializeModalControls() {
    const modal = document.getElementById("partnerModal");
    const closeModal = document.getElementById("closeModal");
    const cancelBtn = document.getElementById("cancelBtn");

    if (closeModal) {
      closeModal.addEventListener("click", () => {
        this.closePartnerModal();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        this.closePartnerModal();
      });
    }

    // Fechar modal ao clicar fora
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closePartnerModal();
        }
      });
    }

    // Tecla ESC para fechar modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("show")) {
        this.closePartnerModal();
      }
    });
  }

  // Inicializar busca e filtros
  initializeSearchAndFilters() {
    const searchInput = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");
    const typeFilter = document.getElementById("typeFilter");

    if (searchInput) {
      searchInput.addEventListener(
        "input",
        Utils.debounce(() => {
          this.filterPartners();
        }, 300)
      );
    }

    if (statusFilter) {
      statusFilter.addEventListener("change", () => {
        this.filterPartners();
      });
    }

    if (typeFilter) {
      typeFilter.addEventListener("change", () => {
        this.filterPartners();
      });
    }
  }

  // Inicializar paginação
  initializePagination() {
    const prevPage = document.getElementById("prevPage");
    const nextPage = document.getElementById("nextPage");

    if (prevPage) {
      prevPage.addEventListener("click", () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.renderPartnersTable();
        }
      });
    }

    if (nextPage) {
      nextPage.addEventListener("click", () => {
        const totalPages = Math.ceil(
          this.filteredPartners.length / this.partnersPerPage
        );
        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.renderPartnersTable();
        }
      });
    }
  }

  // Inicializar formatação de inputs
  initializeInputFormatting() {
    // CPF
    const cpfInput = document.getElementById("cpf");
    if (cpfInput) {
      cpfInput.addEventListener("input", (e) => {
        e.target.value = this.formatCPFInput(e.target.value);
      });
    }

    // CPF Testemunha
    const cpfTestemunhaInput = document.getElementById("cpfTestemunha");
    if (cpfTestemunhaInput) {
      cpfTestemunhaInput.addEventListener("input", (e) => {
        e.target.value = this.formatCPFInput(e.target.value);
      });
    }

    // CNPJ
    const cnpjInput = document.getElementById("cnpj");
    if (cnpjInput) {
      cnpjInput.addEventListener("input", (e) => {
        e.target.value = this.formatCNPJInput(e.target.value);
      });
    }

    // CEP
    const cepInput = document.getElementById("cep");
    if (cepInput) {
      cepInput.addEventListener("input", (e) => {
        e.target.value = this.formatCEPInput(e.target.value);
      });
    }

    // Telefone
    const contatoInput = document.getElementById("contato");
    if (contatoInput) {
      contatoInput.addEventListener("input", (e) => {
        e.target.value = this.formatPhoneInput(e.target.value);
      });
    }
  }

  // Inicializar validação do formulário
  initializeFormValidation() {
    const form = document.getElementById("partnerForm");
    if (!form) return;

    // Validação em tempo real
    const inputs = form.querySelectorAll("input[required], select[required]");
    inputs.forEach((input) => {
      input.addEventListener("blur", () => {
        this.validateField(input);
      });

      input.addEventListener("input", () => {
        this.clearFieldError(input);
      });
    });

    // Validação de email
    const emailInput = document.getElementById("email");
    if (emailInput) {
      emailInput.addEventListener("blur", () => {
        this.validateEmail(emailInput);
      });
    }

    // Validação de CPF
    const cpfInput = document.getElementById("cpf");
    if (cpfInput) {
      cpfInput.addEventListener("blur", () => {
        this.validateCPF(cpfInput);
      });
    }

    // Validação de CNPJ
    const cnpjInput = document.getElementById("cnpj");
    if (cnpjInput) {
      cnpjInput.addEventListener("blur", () => {
        this.validateCNPJ(cnpjInput);
      });
    }
  }

  // Carregar dados iniciais
  async loadInitialData() {
    try {
      Utils.showLoading(true);

      // Testar conexão
      const connectionTest = await this.api.testConnection();
      if (!connectionTest.success) {
        throw new Error(
          "Erro de conexão com Google Sheets: " + connectionTest.error
        );
      }

      // Carregar parceiros
      await this.loadPartners();

      // Atualizar estatísticas
      await this.updateDashboardStats();

      Utils.showNotification("Dados carregados com sucesso!");
    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error);
      Utils.showNotification(
        "Erro ao carregar dados: " + error.message,
        "error"
      );
    } finally {
      Utils.showLoading(false);
    }
  }

  // Carregar parceiros
  async loadPartners() {
    try {
      this.partners = await this.api.getAllPartners();
      this.filteredPartners = [...this.partners];
      this.currentPage = 1;
      this.renderPartnersTable();
    } catch (error) {
      console.error("Erro ao carregar parceiros:", error);
      throw error;
    }
  }

  // Atualizar estatísticas do dashboard
  async updateDashboardStats() {
    try {
      const stats = await this.api.getPartnerStats();

      // Atualizar cards de estatísticas
      document.getElementById("totalPartners").textContent = stats.total;
      document.getElementById("activePartners").textContent = stats.active;
      document.getElementById("pendingPartners").textContent = stats.pending;
      document.getElementById("trainingPartners").textContent = stats.training;

      // Atualizar atividade recente
      this.renderRecentActivity(stats.recentActivity);
    } catch (error) {
      console.error("Erro ao atualizar estatísticas:", error);
    }
  }

  // Renderizar atividade recente
  renderRecentActivity(activities) {
    const container = document.getElementById("recentActivity");
    if (!container) return;

    if (activities.length === 0) {
      container.innerHTML =
        '<p class="text-gray-500">Nenhuma atividade recente.</p>';
      return;
    }

    container.innerHTML = activities
      .map(
        (activity) => `
            <div class="activity-item">
                <div class="activity-icon">👤</div>
                <div class="activity-content">
                    <p>${activity.message}</p>
                    <span class="activity-time">${Utils.formatDate(
                      activity.time
                    )}</span>
                </div>
            </div>
        `
      )
      .join("");
  }

  // Trocar seção ativa
  switchSection(sectionName) {
    // Atualizar navegação
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active");
    });
    document
      .querySelector(`[data-section="${sectionName}"]`)
      .classList.add("active");

    // Atualizar conteúdo
    document.querySelectorAll(".content-section").forEach((section) => {
      section.classList.remove("active");
    });
    document.getElementById(`${sectionName}Section`).classList.add("active");

    // Atualizar título
    const titles = {
      dashboard: "Dashboard",
      partners: "Parceiros",
      reports: "Relatórios",
    };
    document.getElementById("pageTitle").textContent =
      titles[sectionName] || sectionName;

    this.currentSection = sectionName;

    // Ações específicas por seção
    if (sectionName === "partners") {
      this.renderPartnersTable();
    } else if (sectionName === "reports") {
      this.renderReports();
    }
  }

  // Filtrar parceiros
  filterPartners() {
    const searchTerm = document
      .getElementById("searchInput")
      .value.toLowerCase();
    const statusFilter = document.getElementById("statusFilter").value;
    const typeFilter = document.getElementById("typeFilter").value;

    this.filteredPartners = this.partners.filter((partner) => {
      const matchesSearch =
        !searchTerm ||
        partner.nome.toLowerCase().includes(searchTerm) ||
        partner.cpf.includes(searchTerm) ||
        partner.cnpj.includes(searchTerm) ||
        partner.cidade.toLowerCase().includes(searchTerm);

      const matchesStatus =
        !statusFilter || this.getPartnerStatus(partner) === statusFilter;
      const matchesType = !typeFilter || partner.tipoParceria === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });

    this.currentPage = 1;
    this.renderPartnersTable();
  }

  // Obter status do parceiro (simulado)
  getPartnerStatus(partner) {
    // Em uma implementação real, isso viria dos dados
    const statuses = ["ativo", "pendente", "treinamento", "inativo"];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  // Renderizar tabela de parceiros
  renderPartnersTable() {
    const tbody = document.getElementById("partnersTableBody");
    const emptyState = document.getElementById("partnersTableEmpty");

    if (!tbody) return;

    if (this.filteredPartners.length === 0) {
      tbody.innerHTML = "";
      emptyState.style.display = "block";
      this.updatePaginationInfo(0, 0, 0);
      return;
    }

    emptyState.style.display = "none";

    // Calcular paginação
    const startIndex = (this.currentPage - 1) * this.partnersPerPage;
    const endIndex = startIndex + this.partnersPerPage;
    const paginatedPartners = this.filteredPartners.slice(startIndex, endIndex);

    // Renderizar linhas
    tbody.innerHTML = paginatedPartners
      .map((partner) => {
        const status = this.getPartnerStatus(partner);
        return `
                <tr>
                    <td>${partner.nome || "-"}</td>
                    <td>${partner.cpf || partner.cnpj || "-"}</td>
                    <td>${partner.cidade || "-"}</td>
                    <td>${partner.uf || "-"}</td>
                    <td>${Utils.capitalizeWords(
                      partner.tipoParceria || "-"
                    )}</td>
                    <td>
                        <span class="status-badge status-${status}">
                            ${Utils.capitalizeWords(status)}
                        </span>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-icon btn-edit" onclick="dashboardManager.editPartner(${
                              partner.rowIndex
                            })" title="Editar">
                                ✏️
                            </button>
                            <button class="btn-icon btn-delete" onclick="dashboardManager.deletePartner(${
                              partner.rowIndex
                            })" title="Excluir">
                                🗑️
                            </button>
                        </div>
                    </td>
                </tr>
            `;
      })
      .join("");

    // Atualizar informações de paginação
    const totalPages = Math.ceil(
      this.filteredPartners.length / this.partnersPerPage
    );
    this.updatePaginationInfo(
      this.currentPage,
      totalPages,
      this.filteredPartners.length
    );
  }

  // Atualizar informações de paginação
  updatePaginationInfo(currentPage, totalPages, totalItems) {
    const pageInfo = document.getElementById("pageInfo");
    const prevBtn = document.getElementById("prevPage");
    const nextBtn = document.getElementById("nextPage");

    if (pageInfo) {
      pageInfo.textContent = `Página ${currentPage} de ${totalPages} (${totalItems} itens)`;
    }

    if (prevBtn) {
      prevBtn.disabled = currentPage <= 1;
    }

    if (nextBtn) {
      nextBtn.disabled = currentPage >= totalPages;
    }
  }

  // Abrir modal de parceiro
  openPartnerModal(partner = null) {
    const modal = document.getElementById("partnerModal");
    const modalTitle = document.getElementById("modalTitle");
    const form = document.getElementById("partnerForm");

    this.currentEditingPartner = partner;

    if (partner) {
      modalTitle.textContent = "Editar Parceiro";
      this.populateForm(partner);
      // Mostrar seções adicionais para edição
      document.getElementById("cadastroFinaisSection").style.display = "block";
      document.getElementById("dadosTreinamentoSection").style.display =
        "block";
    } else {
      modalTitle.textContent = "Novo Parceiro";
      form.reset();
      // Ocultar seções adicionais para novo cadastro
      document.getElementById("cadastroFinaisSection").style.display = "none";
      document.getElementById("dadosTreinamentoSection").style.display = "none";
    }

    modal.classList.add("show");
    document.body.style.overflow = "hidden";

    // Focar no primeiro campo
    setTimeout(() => {
      const firstInput = form.querySelector('input:not([type="hidden"])');
      if (firstInput) firstInput.focus();
    }, 100);
  }

  // Fechar modal de parceiro
  closePartnerModal() {
    const modal = document.getElementById("partnerModal");
    modal.classList.remove("show");
    document.body.style.overflow = "";
    this.currentEditingPartner = null;
    this.clearFormErrors();
  }

  // Popular formulário com dados do parceiro
  populateForm(partner) {
    const form = document.getElementById("partnerForm");
    const inputs = form.querySelectorAll("input, select, textarea");

    inputs.forEach((input) => {
      const fieldName = input.name;
      if (partner[fieldName] !== undefined) {
        if (input.type === "checkbox") {
          input.checked =
            partner[fieldName] === true || partner[fieldName] === "SIM";
        } else {
          input.value = partner[fieldName] || "";
        }
      }
    });
  }

  // Salvar parceiro
  async savePartner() {
    const form = document.getElementById("partnerForm");
    const saveBtn = document.getElementById("saveBtn");
    const saveText = document.getElementById("saveText");
    const saveSpinner = document.getElementById("saveSpinner");

    // Validar formulário
    if (!this.validateForm()) {
      Utils.showNotification(
        "Por favor, corrija os erros no formulário.",
        "error"
      );
      return;
    }

    try {
      // Mostrar loading
      saveBtn.disabled = true;
      saveText.style.display = "none";
      saveSpinner.style.display = "block";

      // Coletar dados do formulário
      const formData = new FormData(form);
      const partnerData = {};

      for (let [key, value] of formData.entries()) {
        if (form.querySelector(`[name="${key}"]`).type === "checkbox") {
          partnerData[key] = form.querySelector(`[name="${key}"]`).checked;
        } else {
          partnerData[key] = value;
        }
      }

      // Salvar ou atualizar
      if (this.currentEditingPartner) {
        await this.api.updatePartner(
          this.currentEditingPartner.rowIndex,
          partnerData
        );
        Utils.showNotification("Parceiro atualizado com sucesso!");
      } else {
        const result = await this.api.addPartner(partnerData);
        Utils.showNotification(
          `Parceiro cadastrado com sucesso! Contrato: ${result.numeroContrato}`
        );
      }

      // Recarregar dados
      await this.loadPartners();
      await this.updateDashboardStats();

      // Fechar modal
      this.closePartnerModal();
    } catch (error) {
      console.error("Erro ao salvar parceiro:", error);
      Utils.showNotification(
        "Erro ao salvar parceiro: " + error.message,
        "error"
      );
    } finally {
      // Restaurar botão
      saveBtn.disabled = false;
      saveText.style.display = "block";
      saveSpinner.style.display = "none";
    }
  }

  // Editar parceiro
  editPartner(rowIndex) {
    const partner = this.partners.find((p) => p.rowIndex === rowIndex);
    if (partner) {
      this.openPartnerModal(partner);
    }
  }

  // Deletar parceiro
  async deletePartner(rowIndex) {
    const partner = this.partners.find((p) => p.rowIndex === rowIndex);
    if (!partner) return;

    const confirmed = await Utils.confirmAction(
      `Tem certeza que deseja excluir o parceiro "${partner.nome}"?`,
      "Confirmar Exclusão"
    );

    if (!confirmed) return;

    try {
      Utils.showLoading(true);

      await this.api.deletePartner(rowIndex);

      Utils.showNotification("Parceiro excluído com sucesso!");

      // Recarregar dados
      await this.loadPartners();
      await this.updateDashboardStats();
    } catch (error) {
      console.error("Erro ao excluir parceiro:", error);
      Utils.showNotification(
        "Erro ao excluir parceiro: " + error.message,
        "error"
      );
    } finally {
      Utils.showLoading(false);
    }
  }

  // Buscar CEP
  async handleCEPLookup(cep) {
    if (!cep || cep.replace(/\D/g, "").length !== 8) return;

    try {
      const addressData = await Utils.searchCEP(cep);

      // Preencher campos automaticamente
      document.getElementById("rua").value = addressData.rua || "";
      document.getElementById("bairro").value = addressData.bairro || "";
      document.getElementById("cidade").value = addressData.cidade || "";
      document.getElementById("uf").value = addressData.uf || "";

      Utils.showNotification("Endereço preenchido automaticamente!");
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      Utils.showNotification("CEP não encontrado.", "warning");
    }
  }

  // Formatação de inputs
  formatCPFInput(value) {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return value;
  }

  formatCNPJInput(value) {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 14) {
      return cleaned.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5"
      );
    }
    return value;
  }

  formatCEPInput(value) {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 8) {
      return cleaned.replace(/(\d{5})(\d{3})/, "$1-$2");
    }
    return value;
  }

  formatPhoneInput(value) {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 11) {
      if (cleaned.length === 11) {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
      } else if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
      }
    }
    return value;
  }

  // Validação de formulário
  validateForm() {
    const form = document.getElementById("partnerForm");
    let isValid = true;

    // Limpar erros anteriores
    this.clearFormErrors();

    // Validar campos obrigatórios
    const requiredFields = form.querySelectorAll("[required]");
    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        this.showFieldError(field, "Este campo é obrigatório.");
        isValid = false;
      }
    });

    // Validações específicas
    const emailField = document.getElementById("email");
    if (emailField.value && !Utils.validateEmail(emailField.value)) {
      this.showFieldError(emailField, "E-mail inválido.");
      isValid = false;
    }

    const cpfField = document.getElementById("cpf");
    if (cpfField.value && !Utils.validateCPF(cpfField.value)) {
      this.showFieldError(cpfField, "CPF inválido.");
      isValid = false;
    }

    const cnpjField = document.getElementById("cnpj");
    if (cnpjField.value && !Utils.validateCNPJ(cnpjField.value)) {
      this.showFieldError(cnpjField, "CNPJ inválido.");
      isValid = false;
    }

    return isValid;
  }

  // Validar campo individual
  validateField(field) {
    this.clearFieldError(field);

    if (field.hasAttribute("required") && !field.value.trim()) {
      this.showFieldError(field, "Este campo é obrigatório.");
      return false;
    }

    return true;
  }

  // Validar email
  validateEmail(field) {
    this.clearFieldError(field);

    if (field.value && !Utils.validateEmail(field.value)) {
      this.showFieldError(field, "E-mail inválido.");
      return false;
    }

    return true;
  }

  // Validar CPF
  validateCPF(field) {
    this.clearFieldError(field);

    if (field.value && !Utils.validateCPF(field.value)) {
      this.showFieldError(field, "CPF inválido.");
      return false;
    }

    return true;
  }

  // Validar CNPJ
  validateCNPJ(field) {
    this.clearFieldError(field);

    if (field.value && !Utils.validateCNPJ(field.value)) {
      this.showFieldError(field, "CNPJ inválido.");
      return false;
    }

    return true;
  }

  // Mostrar erro de campo
  showFieldError(field, message) {
    field.classList.add("error");

    // Remover mensagem de erro existente
    const existingError = field.parentNode.querySelector(".field-error");
    if (existingError) {
      existingError.remove();
    }

    // Adicionar nova mensagem de erro
    const errorDiv = document.createElement("div");
    errorDiv.className = "field-error";
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
            color: var(--error);
            font-size: 12px;
            margin-top: 4px;
        `;

    field.parentNode.appendChild(errorDiv);
  }

  // Limpar erro de campo
  clearFieldError(field) {
    field.classList.remove("error");
    const errorDiv = field.parentNode.querySelector(".field-error");
    if (errorDiv) {
      errorDiv.remove();
    }
  }

  // Limpar todos os erros do formulário
  clearFormErrors() {
    const form = document.getElementById("partnerForm");
    const errorFields = form.querySelectorAll(".error");
    const errorMessages = form.querySelectorAll(".field-error");

    errorFields.forEach((field) => field.classList.remove("error"));
    errorMessages.forEach((message) => message.remove());
  }

  // Renderizar relatórios
  renderReports() {
    // Implementação básica de relatórios
    const statusChart = document.getElementById("statusChart");
    const typeChart = document.getElementById("typeChart");

    if (statusChart) {
      statusChart.innerHTML = "<p>Gráfico de Status em desenvolvimento...</p>";
    }

    if (typeChart) {
      typeChart.innerHTML = "<p>Gráfico de Tipos em desenvolvimento...</p>";
    }
  }

  // Configurar auto-refresh
  setupAutoRefresh() {
    // Atualizar dados a cada 5 minutos
    setInterval(async () => {
      try {
        await this.loadPartners();
        await this.updateDashboardStats();
      } catch (error) {
        console.error("Erro no auto-refresh:", error);
      }
    }, 5 * 60 * 1000);
  }

  // Exportar dados
  async exportPartners() {
    try {
      if (this.filteredPartners.length === 0) {
        Utils.showNotification("Nenhum dado para exportar.", "warning");
        return;
      }

      const exportData = this.filteredPartners.map((partner) => ({
        Nome: partner.nome,
        CPF: partner.cpf,
        CNPJ: partner.cnpj,
        "E-mail": partner.email,
        Cidade: partner.cidade,
        UF: partner.uf,
        "Tipo de Parceria": partner.tipoParceria,
        Contato: partner.contato,
      }));

      Utils.exportToCSV(exportData, "parceiros.csv");
    } catch (error) {
      console.error("Erro ao exportar:", error);
      Utils.showNotification("Erro ao exportar dados.", "error");
    }
  }
}

// Inicializar aplicação quando o DOM estiver carregado
let dashboardManager;

document.addEventListener("DOMContentLoaded", () => {
  dashboardManager = new DashboardManager();
});

// Adicionar estilos para campos com erro
const errorStyles = document.createElement("style");
errorStyles.textContent = `
    .form-input.error,
    .form-select.error {
        border-color: var(--error) !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
    }
    
    .field-error {
        color: var(--error);
        font-size: 12px;
        margin-top: 4px;
        display: block;
    }
`;

document.head.appendChild(errorStyles);
