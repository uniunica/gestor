class GestaoParceiros {
  constructor() {
    this.dataTable = null;
    this.parceiros = [];
    this.parceiroSelecionado = null;
    this.init();
  }

  init() {
    // Verificar autenticação
    if (!auth.requireAuth()) return;

    // Inicializar DataTable
    this.inicializarDataTable();

    // Carregar dados
    this.carregarParceiros();

    // Inicializar Google Sheets API
    sheetsAPI.init();
  }

  inicializarDataTable() {
    this.dataTable = $("#tabelaParceiros").DataTable({
      language: {
        url: "https://cdn.datatables.net/plug-ins/1.13.4/i18n/pt-BR.json",
      },
      responsive: true,
      pageLength: 25,
      order: [[7, "desc"]], // Ordenar por data de cadastro
      columnDefs: [
        {
          targets: 8, // Coluna de ações
          orderable: false,
          searchable: false,
          render: function (data, type, row) {
            return `
                            <div class="btn-group" role="group">
                                <button type="button" class="btn btn-sm btn-outline-primary" 
                                        onclick="gestaoParceiros.editarParceiro('${row[0]}')" 
                                        title="Editar">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-outline-info" 
                                        onclick="gestaoParceiros.atualizarStatus('${row[0]}')" 
                                        title="Atualizar Status">
                                    <i class="fas fa-tasks"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-outline-success" 
                                        onclick="gestaoParceiros.visualizarParceiro('${row[0]}')" 
                                        title="Visualizar">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        `;
          },
        },
        {
          targets: 6, // Coluna de status
          render: function (data, type, row) {
            const statusClass = {
              Ativo: "success",
              "Em Treinamento": "warning",
              Aguardando: "info",
              Inativo: "secondary",
            };

            const badgeClass = statusClass[data] || "secondary";
            return `<span class="badge bg-${badgeClass}">${data}</span>`;
          },
        },
      ],
    });
  }

  async carregarParceiros() {
    try {
      // Mostrar loading
      this.mostrarLoading(true);

      // Buscar dados do Google Sheets
      this.parceiros = await sheetsAPI.buscarParceiros();

      // Processar dados para a tabela
      const dadosTabela = this.parceiros.map((parceiro) => [
        parceiro.nome,
        this.formatarCPF(parceiro.cpf),
        parceiro.email,
        parceiro.cidade,
        parceiro.uf,
        parceiro.tipoParceria,
        this.obterStatus(parceiro), // Função para determinar status
        this.formatarData(parceiro.ano, parceiro.mes, parceiro.dia),
        parceiro.numeroContrato, // Para identificação nas ações
      ]);

      // Atualizar DataTable
      this.dataTable.clear().rows.add(dadosTabela).draw();
    } catch (error) {
      console.error("Erro ao carregar parceiros:", error);
      this.mostrarErro("Erro ao carregar dados dos parceiros");
    } finally {
      this.mostrarLoading(false);
    }
  }

  formatarCPF(cpf) {
    if (!cpf) return "";
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  formatarData(ano, mes, dia) {
    if (!ano || !mes || !dia) return "";
    return `${String(dia).padStart(2, "0")}/${String(mes).padStart(
      2,
      "0"
    )}/${ano}`;
  }

  obterStatus(parceiro) {
    // Lógica para determinar status baseado nos dados
    // Pode ser expandida conforme necessário
    return "Ativo"; // Placeholder
  }

  editarParceiro(numeroContrato) {
    const parceiro = this.parceiros.find(
      (p) => p.numeroContrato === numeroContrato
    );
    if (!parceiro) return;

    this.parceiroSelecionado = parceiro;

    // Preencher formulário de edição
    document.getElementById("editNome").value = parceiro.nome;
    document.getElementById("editEmail").value = parceiro.email;
    document.getElementById("editCidade").value = parceiro.cidade;
    document.getElementById("editUF").value = parceiro.uf;
    document.getElementById("editTipoParceria").value = parceiro.tipoParceria;

    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById("modalEdicao"));
    modal.show();
  }

  atualizarStatus(numeroContrato) {
    const parceiro = this.parceiros.find(
      (p) => p.numeroContrato === numeroContrato
    );
    if (!parceiro) return;

    this.parceiroSelecionado = parceiro;

    // Mostrar modal de status
    const modal = new bootstrap.Modal(document.getElementById("modalStatus"));
    modal.show();
  }

  visualizarParceiro(numeroContrato) {
    const parceiro = this.parceiros.find(
      (p) => p.numeroContrato === numeroContrato
    );
    if (!parceiro) return;

    // Criar modal de visualização
    const modalContent = `
            <div class="modal fade" id="modalVisualizacao" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-user me-2"></i>Detalhes do Parceiro
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6 class="text-primary">Dados Pessoais</h6>
                                    <p><strong>Nome:</strong> ${
                                      parceiro.nome
                                    }</p>
                                    <p><strong>CPF:</strong> ${this.formatarCPF(
                                      parceiro.cpf
                                    )}</p>
                                    <p><strong>RG:</strong> ${parceiro.rg}</p>
                                    <p><strong>Email:</strong> ${
                                      parceiro.email
                                    }</p>
                                    <p><strong>Contato:</strong> ${
                                      parceiro.contato
                                    }</p>
                                </div>
                                <div class="col-md-6">
                                    <h6 class="text-primary">Endereço</h6>
                                    <p><strong>CEP:</strong> ${parceiro.cep}</p>
                                    <p><strong>Rua:</strong> ${parceiro.rua}, ${
      parceiro.numero
    }</p>
                                    <p><strong>Bairro:</strong> ${
                                      parceiro.bairro
                                    }</p>
                                    <p><strong>Cidade:</strong> ${
                                      parceiro.cidade
                                    } - ${parceiro.uf}</p>
                                </div>
                            </div>
                            <hr>
                            <div class="row">
                                <div class="col-md-6">
                                    <h6 class="text-primary">Dados da Empresa</h6>
                                    <p><strong>CNPJ:</strong> ${
                                      parceiro.cnpj
                                    }</p>
                                    <p><strong>Razão Social:</strong> ${
                                      parceiro.razaoSocial
                                    }</p>
                                    <p><strong>Nome Comercial:</strong> ${
                                      parceiro.nomeComercial
                                    }</p>
                                </div>
                                <div class="col-md-6">
                                    <h6 class="text-primary">Parceria</h6>
                                    <p><strong>Tipo:</strong> ${
                                      parceiro.tipoParceria
                                    }</p>
                                    <p><strong>Captado por:</strong> ${
                                      parceiro.captadoPor
                                    }</p>
                                    <p><strong>Data Cadastro:</strong> ${this.formatarData(
                                      parceiro.ano,
                                      parceiro.mes,
                                      parceiro.dia
                                    )}</p>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

    // Remover modal anterior se existir
    const modalAnterior = document.getElementById("modalVisualizacao");
    if (modalAnterior) {
      modalAnterior.remove();
    }

    // Adicionar novo modal
    document.body.insertAdjacentHTML("beforeend", modalContent);

    // Mostrar modal
    const modal = new bootstrap.Modal(
      document.getElementById("modalVisualizacao")
    );
    modal.show();
  }

  async salvarEdicao() {
    // Implementar lógica de salvamento
    // Atualizar Google Sheets
    console.log("Salvando edição...");
  }

  async salvarStatus() {
    // Implementar lógica de atualização de status
    console.log("Atualizando status...");
  }

  aplicarFiltros() {
    const nome = document.getElementById("filtroNome").value;
    const cidade = document.getElementById("filtroCidade").value;
    const uf = document.getElementById("filtroUF").value;
    const tipo = document.getElementById("filtroTipo").value;
    const status = document.getElementById("filtroStatus").value;

    // Aplicar filtros no DataTable
    this.dataTable
      .column(0)
      .search(nome)
      .column(3)
      .search(cidade)
      .column(4)
      .search(uf)
      .column(5)
      .search(tipo)
      .column(6)
      .search(status)
      .draw();
  }

  limparFiltros() {
    document.getElementById("filtroNome").value = "";
    document.getElementById("filtroCidade").value = "";
    document.getElementById("filtroUF").value = "";
    document.getElementById("filtroTipo").value = "";
    document.getElementById("filtroStatus").value = "";

    this.dataTable.search("").columns().search("").draw();
  }

  exportarDados() {
    // Implementar exportação para Excel/CSV
    console.log("Exportando dados...");
  }

  mostrarLoading(mostrar) {
    // Implementar indicador de loading
    if (mostrar) {
      console.log("Carregando...");
    } else {
      console.log("Carregamento concluído");
    }
  }

  mostrarErro(mensagem) {
    Swal.fire({
      icon: "error",
      title: "Erro!",
      text: mensagem,
    });
  }
}

// Funções globais
function aplicarFiltros() {
  gestaoParceiros.aplicarFiltros();
}

function limparFiltros() {
  gestaoParceiros.limparFiltros();
}

function exportarDados() {
  gestaoParceiros.exportarDados();
}

function atualizarTabela() {
  gestaoParceiros.carregarParceiros();
}

function salvarEdicao() {
  gestaoParceiros.salvarEdicao();
}

function salvarStatus() {
  gestaoParceiros.salvarStatus();
}

// Inicializar quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
  window.gestaoParceiros = new GestaoParceiros();
});
