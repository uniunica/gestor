class Dashboard {
  constructor() {
    this.charts = {};
    this.stats = {
      total: 0,
      ativos: 0,
      emTreinamento: 0,
      novosMes: 0,
    };
    this.init();
  }

  init() {
    // Verificar autenticação
    if (!auth.requireAuth()) return;

    // Exibir nome do usuário
    this.exibirNomeUsuario();

    // Carregar estatísticas
    this.carregarEstatisticas();

    // Inicializar gráficos
    this.inicializarGraficos();

    // Carregar últimos parceiros
    this.carregarUltimosParceiros();

    // Inicializar Google Sheets API
    sheetsAPI.init();
  }

  exibirNomeUsuario() {
    const currentUser = JSON.parse(
      localStorage.getItem("currentUser") ||
        sessionStorage.getItem("currentUser")
    );
    if (currentUser) {
      document.getElementById("userName").textContent = currentUser.name;
    }
  }

  async carregarEstatisticas() {
    try {
      // Simular dados ou buscar do Google Sheets
      const parceiros = await this.obterDadosParceiros();

      this.stats.total = parceiros.length;
      this.stats.ativos = parceiros.filter((p) => p.status === "Ativo").length;
      this.stats.emTreinamento = parceiros.filter(
        (p) => p.status === "Em Treinamento"
      ).length;
      this.stats.novosMes = this.contarNovosMes(parceiros);

      this.atualizarCardsEstatisticas();
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
      // Usar dados mock em caso de erro
      this.usarDadosMock();
    }
  }

  async obterDadosParceiros() {
    // Tentar buscar do Google Sheets
    try {
      return await sheetsAPI.buscarParceiros();
    } catch (error) {
      // Retornar dados mock se falhar
      return this.gerarDadosMock();
    }
  }

  gerarDadosMock() {
    return [
      {
        nome: "João Silva",
        cidade: "São Paulo",
        uf: "SP",
        status: "Ativo",
        tipoParceria: "Polo EAD",
        mes: 11,
        ano: 2024,
      },
      {
        nome: "Maria Santos",
        cidade: "Rio de Janeiro",
        uf: "RJ",
        status: "Em Treinamento",
        tipoParceria: "Polo Presencial",
        mes: 11,
        ano: 2024,
      },
      {
        nome: "Pedro Oliveira",
        cidade: "Belo Horizonte",
        uf: "MG",
        status: "Ativo",
        tipoParceria: "Representante Comercial",
        mes: 10,
        ano: 2024,
      },
      {
        nome: "Ana Costa",
        cidade: "Salvador",
        uf: "BA",
        status: "Aguardando",
        tipoParceria: "Parceiro Estratégico",
        mes: 11,
        ano: 2024,
      },
      {
        nome: "Carlos Lima",
        cidade: "Fortaleza",
        uf: "CE",
        status: "Ativo",
        tipoParceria: "Polo EAD",
        mes: 11,
        ano: 2024,
      },
    ];
  }

  contarNovosMes(parceiros) {
    const mesAtual = new Date().getMonth() + 1;
    const anoAtual = new Date().getFullYear();

    return parceiros.filter(
      (p) => parseInt(p.mes) === mesAtual && parseInt(p.ano) === anoAtual
    ).length;
  }

  atualizarCardsEstatisticas() {
    document.getElementById("totalParceiros").textContent = this.stats.total;
    document.getElementById("parceirosAtivos").textContent = this.stats.ativos;
    document.getElementById("emTreinamento").textContent =
      this.stats.emTreinamento;
    document.getElementById("novosMes").textContent = this.stats.novosMes;

    // Animação nos números
    this.animarNumeros();
  }

  animarNumeros() {
    const elementos = [
      "totalParceiros",
      "parceirosAtivos",
      "emTreinamento",
      "novosMes",
    ];

    elementos.forEach((id) => {
      const elemento = document.getElementById(id);
      const valorFinal = parseInt(elemento.textContent);
      let valorAtual = 0;

      const incremento = valorFinal / 20;
      const timer = setInterval(() => {
        valorAtual += incremento;
        if (valorAtual >= valorFinal) {
          elemento.textContent = valorFinal;
          clearInterval(timer);
        } else {
          elemento.textContent = Math.floor(valorAtual);
        }
      }, 50);
    });
  }

  async inicializarGraficos() {
    // Gráfico de Parceiros por Mês
    await this.criarGraficoParceirosPorMes();

    // Gráfico de Tipos de Parceria
    await this.criarGraficoTiposParceria();
  }

  async criarGraficoParceirosPorMes() {
    const ctx = document.getElementById("parceirosPorMes").getContext("2d");

    // Dados dos últimos 6 meses
    const meses = ["Jun", "Jul", "Ago", "Set", "Out", "Nov"];
    const dados = [12, 19, 15, 25, 22, 30]; // Dados mock

    this.charts.parceirosPorMes = new Chart(ctx, {
      type: "line",
      data: {
        labels: meses,
        datasets: [
          {
            label: "Novos Parceiros",
            data: dados,
            borderColor: "#4e73df",
            backgroundColor: "rgba(78, 115, 223, 0.1)",
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#4e73df",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(0, 0, 0, 0.1)",
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
        elements: {
          point: {
            hoverRadius: 8,
          },
        },
      },
    });
  }

  async criarGraficoTiposParceria() {
    const ctx = document.getElementById("tiposParceria").getContext("2d");

    const dados = {
      labels: ["Polo EAD", "Polo Presencial", "Representante", "Estratégico"],
      datasets: [
        {
          data: [45, 30, 15, 10], // Dados mock
          backgroundColor: ["#4e73df", "#1cc88a", "#36b9cc", "#f6c23e"],
          borderWidth: 0,
        },
      ],
    };

    this.charts.tiposParceria = new Chart(ctx, {
      type: "doughnut",
      data: dados,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 20,
              usePointStyle: true,
            },
          },
        },
        cutout: "60%",
      },
    });
  }

  async carregarUltimosParceiros() {
    try {
      const parceiros = await this.obterDadosParceiros();

      // Ordenar por data mais recente e pegar os últimos 5
      const ultimosParceiros = parceiros
        .sort((a, b) => {
          const dataA = new Date(a.ano, a.mes - 1, a.dia);
          const dataB = new Date(b.ano, b.mes - 1, b.dia);
          return dataB - dataA;
        })
        .slice(0, 5);

      this.preencherTabelaUltimosParceiros(ultimosParceiros);
    } catch (error) {
      console.error("Erro ao carregar últimos parceiros:", error);
    }
  }

  preencherTabelaUltimosParceiros(parceiros) {
    const tbody = document.querySelector("#ultimosParceiros tbody");
    tbody.innerHTML = "";

    parceiros.forEach((parceiro) => {
      const statusClass = this.obterClasseStatus(parceiro.status);
      const dataFormatada = this.formatarData(
        parceiro.ano,
        parceiro.mes,
        parceiro.dia
      );

      const row = `
                <tr>
                    <td>${parceiro.nome}</td>
                    <td>${parceiro.cidade}</td>
                    <td>${parceiro.uf}</td>
                    <td>${parceiro.tipoParceria}</td>
                    <td>${dataFormatada}</td>
                    <td><span class="badge bg-${statusClass}">${parceiro.status}</span></td>
                </tr>
            `;

      tbody.insertAdjacentHTML("beforeend", row);
    });
  }

  obterClasseStatus(status) {
    const classes = {
      Ativo: "success",
      "Em Treinamento": "warning",
      Aguardando: "info",
      Inativo: "secondary",
    };
    return classes[status] || "secondary";
  }

  formatarData(ano, mes, dia) {
    if (!ano || !mes || !dia) return "";
    return `${String(dia).padStart(2, "0")}/${String(mes).padStart(
      2,
      "0"
    )}/${ano}`;
  }

  usarDadosMock() {
    this.stats = {
      total: 25,
      ativos: 18,
      emTreinamento: 5,
      novosMes: 8,
    };
    this.atualizarCardsEstatisticas();
  }

  // Método para atualizar dados em tempo real
  atualizarDashboard() {
    this.carregarEstatisticas();
    this.carregarUltimosParceiros();

    // Atualizar gráficos se necessário
    if (this.charts.parceirosPorMes) {
      this.charts.parceirosPorMes.update();
    }
    if (this.charts.tiposParceria) {
      this.charts.tiposParceria.update();
    }
  }
}

// Inicializar dashboard quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
  window.dashboard = new Dashboard();

  // Atualizar dashboard a cada 5 minutos
  setInterval(() => {
    if (window.dashboard) {
      window.dashboard.atualizarDashboard();
    }
  }, 300000); // 5 minutos
});
