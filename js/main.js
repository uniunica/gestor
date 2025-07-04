class SGPSystem {
  constructor() {
    this.currentPage = "inicio";
    this.isLoading = false;
    this.lastUpdate = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadInitialData();
    this.updateLastUpdateTime();
    this.setupAutoRefresh();
  }

  setupEventListeners() {
    // Menu toggle for mobile
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");

    menuToggle?.addEventListener("click", () => {
      sidebar.classList.toggle("active");
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", (e) => {
      if (
        window.innerWidth <= 768 &&
        !sidebar.contains(e.target) &&
        !menuToggle.contains(e.target) &&
        sidebar.classList.contains("active")
      ) {
        sidebar.classList.remove("active");
      }
    });

    // Menu items navigation
    const menuItems = document.querySelectorAll(".menu-item");
    menuItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        const page = item.dataset.page;
        this.navigateToPage(page);

        // Close mobile menu
        if (window.innerWidth <= 768) {
          sidebar.classList.remove("active");
        }
      });
    });

    // Quick action buttons
    const actionButtons = document.querySelectorAll(".action-btn");
    actionButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const page = btn.dataset.page;
        if (page) {
          this.navigateToPage(page);
        }
      });
    });

    // Refresh button
    const refreshBtn = document.getElementById("refreshBtn");
    refreshBtn?.addEventListener("click", () => {
      this.refreshCurrentPage();
    });

    // Window resize handler
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        sidebar.classList.remove("active");
      }
    });
  }

  async navigateToPage(pageName) {
    if (this.isLoading || pageName === this.currentPage) return;

    this.showLoading();

    try {
      // Update active menu item
      this.updateActiveMenuItem(pageName);

      // Update page title
      this.updatePageTitle(pageName);

      // Load page content
      await this.loadPageContent(pageName);

      this.currentPage = pageName;
    } catch (error) {
      console.error("Erro ao navegar para a página:", error);
      this.showError("Erro ao carregar a página");
    } finally {
      this.hideLoading();
    }
  }

  updateActiveMenuItem(pageName) {
    const menuItems = document.querySelectorAll(".menu-item");
    menuItems.forEach((item) => {
      item.classList.remove("active");
      if (item.dataset.page === pageName) {
        item.classList.add("active");
      }
    });
  }

  updatePageTitle(pageName) {
    const titles = {
      inicio: "Início",
      dashboard: "Dashboard",
      polos: "Polos Ativos",
      parceiros: "Lista de Parceiros",
      consulta: "Consulta",
      relatorios: "Relatórios",
      estrategia: "Estratégia",
      mapas: "Mapas",
    };

    const pageTitle = document.getElementById("pageTitle");
    if (pageTitle) {
      pageTitle.textContent = titles[pageName] || "SGP";
    }
  }

  async loadPageContent(pageName) {
    const contentArea = document.getElementById("contentArea");

    // Hide all page contents
    const allPages = contentArea.querySelectorAll(".page-content");
    allPages.forEach((page) => page.classList.remove("active"));

    // Check if page content already exists
    let pageContent = document.getElementById(pageName);

    if (!pageContent) {
      // Load page content dynamically
      pageContent = await this.createPageContent(pageName);
      contentArea.appendChild(pageContent);
    }

    // Show the requested page
    pageContent.classList.add("active");

    // Initialize page-specific functionality
    this.initializePageFeatures(pageName);
  }

  async createPageContent(pageName) {
    const pageDiv = document.createElement("div");
    pageDiv.className = "page-content";
    pageDiv.id = pageName;

    try {
      const response = await fetch(`pages/${pageName}.html`);
      if (response.ok) {
        pageDiv.innerHTML = await response.text();
      } else {
        pageDiv.innerHTML = this.getDefaultPageContent(pageName);
      }
    } catch (error) {
      console.error(`Erro ao carregar página ${pageName}:`, error);
      pageDiv.innerHTML = this.getDefaultPageContent(pageName);
    }

    return pageDiv;
  }

  getDefaultPageContent(pageName) {
    const defaultContents = {
      dashboard: `
                <div class="dashboard-container">
                    <h2><i class="fas fa-chart-pie"></i> Dashboard</h2>
                    <div class="dashboard-grid">
                        <div class="card">
                            <h3>Métricas Principais</h3>
                            <div id="mainMetrics">Carregando dados...</div>
                        </div>
                        <div class="card">
                            <h3>Gráficos</h3>
                            <div id="chartContainer">Carregando gráficos...</div>
                        </div>
                    </div>
                </div>
            `,
      polos: `
                <div class="polos-container">
                    <h2><i class="fas fa-map-marker-alt"></i> Polos Ativos</h2>
                    <div class="card">
                        <div class="table-container">
                            <table id="polosTable">
                                <thead>
                                    <tr>
                                        <th>Polo</th>
                                        <th>Cidade</th>
                                        <th>Estado</th>
                                        <th>Status</th>
                                        <th>Parceiros</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td colspan="5">Carregando dados...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `,
      parceiros: `
                <div class="parceiros-container">
                    <h2><i class="fas fa-handshake"></i> Lista de Parceiros</h2>
                    <div class="card">
                        <div class="table-container">
                            <table id="parceirosTable">
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>Empresa</th>
                                        <th>Polo</th>
                                        <th>Status</th>
                                        <th>Contato</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td colspan="5">Carregando dados...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `,
      consulta: `
                <div class="consulta-container">
                    <h2><i class="fas fa-search"></i> Consulta</h2>
                    <div class="card">
                        <div class="search-form">
                            <input type="text" id="searchInput" placeholder="Digite sua consulta...">
                            <button class="btn" onclick="sgp.performSearch()">Buscar</button>
                        </div>
                        <div id="searchResults" class="mt-3">
                            <!-- Resultados aparecerão aqui -->
                        </div>
                    </div>
                </div>
            `,
      relatorios: `
                <div class="relatorios-container">
                    <h2><i class="fas fa-file-alt"></i> Relatórios</h2>
                    <div class="card">
                        <div class="reports-grid">
                            <button class="btn" onclick="sgp.generateReport('parceiros')">
                                <i class="fas fa-users"></i> Relatório de Parceiros
                            </button>
                            <button class="btn" onclick="sgp.generateReport('polos')">
                                <i class="fas fa-map"></i> Relatório de Polos
                            </button>
                            <button class="btn" onclick="sgp.generateReport('performance')">
                                <i class="fas fa-chart-line"></i> Relatório de Performance
                            </button>
                        </div>
                    </div>
                </div>
            `,
      estrategia: `
                <div class="estrategia-container">
                    <h2><i class="fas fa-chess"></i> Estratégia</h2>
                    <div class="card">
                        <h3>Planejamento Estratégico</h3>
                        <p>Ferramentas de análise estratégica para expansão de negócios.</p>
                        <div id="strategyContent">Carregando conteúdo estratégico...</div>
                    </div>
                </div>
            `,
      mapas: `
                <div class="mapas-container">
                    <h2><i class="fas fa-globe"></i> Mapas</h2>
                    <div class="card">
                        <div id="mapContainer" style="height: 400px; background: #f0f0f0; display: flex; align-items: center; justify-content: center;">
                            <p>Mapa interativo será carregado aqui</p>
                        </div>
                    </div>
                </div>
            `,
    };

    return (
      defaultContents[pageName] ||
      '<div class="card"><h2>Página em desenvolvimento</h2></div>'
    );
  }

  initializePageFeatures(pageName) {
    switch (pageName) {
      case "dashboard":
        this.loadDashboardData();
        break;
      case "polos":
        this.loadPolosData();
        break;
      case "parceiros":
        this.loadParceirosData();
        break;
      case "mapas":
        this.initializeMap();
        break;
    }
  }

  async loadInitialData() {
    try {
      // Load initial statistics for home page
      await this.loadHomeStats();
      await this.loadRecentUpdates();
    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error);
    }
  }

  async loadHomeStats() {
    // Simulate API calls - replace with actual Google Sheets API calls
    const stats = {
      totalParceiros: 45,
      totalPolos: 12,
      crescimento: "+15%",
    };

    document.getElementById("totalParceiros").textContent =
      stats.totalParceiros;
    document.getElementById("totalPolos").textContent = stats.totalPolos;
    document.getElementById("crescimento").textContent = stats.crescimento;
  }

  async loadRecentUpdates() {
    const updates = [
      {
        title: "Novo Polo Ativado",
        description: "Polo de São Paulo foi ativado com sucesso",
        date: "2025-01-15",
      },
      {
        title: "Atualização do Sistema",
        description: "Nova versão do SGP com melhorias de performance",
        date: "2025-01-10",
      },
      {
        title: "Novos Parceiros",
        description: "5 novos parceiros adicionados ao sistema",
        date: "2025-01-08",
      },
    ];

    const updatesList = document.getElementById("updatesList");
    if (updatesList) {
      updatesList.innerHTML = updates
        .map(
          (update) => `
                <div class="update-item">
                    <h4>${update.title}</h4>
                    <p>${update.description}</p>
                    <div class="update-date">${this.formatDate(
                      update.date
                    )}</div>
                </div>
            `
        )
        .join("");
    }
  }

  async loadDashboardData() {
    // Implement dashboard data loading
    console.log("Loading dashboard data...");
  }

  async loadPolosData() {
    // Implement polos data loading from Google Sheets
    console.log("Loading polos data...");
  }

  async loadParceirosData() {
    // Implement parceiros data loading from Google Sheets
    console.log("Loading parceiros data...");
  }

  initializeMap() {
    // Initialize map functionality
    console.log("Initializing map...");
  }

  performSearch() {
    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");

    if (searchInput && searchResults) {
      const query = searchInput.value.trim();
      if (query) {
        searchResults.innerHTML = `<p>Buscando por: "${query}"...</p>`;
        // Implement actual search functionality
      }
    }
  }

  generateReport(type) {
    console.log(`Generating ${type} report...`);
    // Implement report generation
  }

  async refreshCurrentPage() {
    await this.navigateToPage(this.currentPage);
    this.updateLastUpdateTime();
  }

  updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const updateTimeElement = document.getElementById("updateTime");
    if (updateTimeElement) {
      updateTimeElement.textContent = timeString;
    }

    this.lastUpdate = now;
  }

  setupAutoRefresh() {
    // Auto-refresh every 5 minutes
    setInterval(() => {
      if (this.currentPage === "inicio") {
        this.loadInitialData();
      }
      this.updateLastUpdateTime();
    }, 300000);
  }

  showLoading() {
    this.isLoading = true;
    const loadingOverlay = document.getElementById("loadingOverlay");
    if (loadingOverlay) {
      loadingOverlay.classList.add("active");
    }
  }

  hideLoading() {
    this.isLoading = false;
    const loadingOverlay = document.getElementById("loadingOverlay");
    if (loadingOverlay) {
      loadingOverlay.classList.remove("active");
    }
  }

  showError(message) {
    // Implement error display
    console.error(message);
    alert(message); // Replace with better error handling
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}

// Initialize the system when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.sgp = new SGPSystem();
});
