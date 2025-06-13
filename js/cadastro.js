class CadastroParceiro {
  constructor() {
    this.form = document.getElementById("cadastroParceiro");
    this.init();
  }

  init() {
    // Verificar autenticação
    if (!auth.requireAuth()) return;

    // Event listeners
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));

    // Máscaras de input
    this.aplicarMascaras();

    // Busca CEP
    document
      .getElementById("cep")
      .addEventListener("blur", (e) => this.buscarCEP(e.target.value));

    // Validação de CPF
    document
      .getElementById("cpf")
      .addEventListener("blur", (e) => this.validarCPF(e.target.value));

    // Inicializar Google Sheets API
    sheetsAPI.init();
  }

  aplicarMascaras() {
    // Aplicar máscaras usando jQuery Mask Plugin
    $("#cpf, #cpfTestemunha").mask("000.000.000-00");
    $("#rg").mask("00.000.000-0");
    $("#cnpj").mask("00.000.000/0000-00");
    $("#cep").mask("00000-000");
    $("#contato").mask("(00) 00000-0000");
  }

  async buscarCEP(cep) {
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length === 8) {
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cepLimpo}/json/`
        );
        const data = await response.json();

        if (!data.erro) {
          document.getElementById("rua").value = data.logradouro;
          document.getElementById("bairro").value = data.bairro;
          document.getElementById("cidade").value = data.localidade;
          document.getElementById("uf").value = data.uf;

          // Focar no campo número
          document.getElementById("numero").focus();
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    }
  }

  validarCPF(cpf) {
    const cpfLimpo = cpf.replace(/\D/g, "");
    const input = document.getElementById("cpf");

    if (cpfLimpo.length === 11) {
      if (!this.isCPFValido(cpfLimpo)) {
        input.setCustomValidity("CPF inválido");
        input.classList.add("is-invalid");
      } else {
        input.setCustomValidity("");
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");
      }
    }
  }

  isCPFValido(cpf) {
    // Validação básica de CPF
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (!this.form.checkValidity()) {
      e.stopPropagation();
      this.form.classList.add("was-validated");
      return;
    }

    const spinner = document.getElementById("saveSpinner");
    const submitBtn = e.target.querySelector('button[type="submit"]');

    try {
      // Mostrar loading
      spinner.classList.remove("d-none");
      submitBtn.disabled = true;

      // Coletar dados do formulário
      const parceiro = this.coletarDadosFormulario();

      // Salvar no Google Sheets
      await sheetsAPI.adicionarDadosIniciais(parceiro);

      // Mostrar sucesso
      await Swal.fire({
        icon: "success",
        title: "Sucesso!",
        text: "Parceiro cadastrado com sucesso!",
        timer: 2000,
        showConfirmButton: false,
      });

      // Limpar formulário
      this.limparFormulario();
    } catch (error) {
      console.error("Erro ao salvar parceiro:", error);

      Swal.fire({
        icon: "error",
        title: "Erro!",
        text: "Erro ao cadastrar parceiro. Tente novamente.",
        confirmButtonText: "OK",
      });
    } finally {
      // Esconder loading
      spinner.classList.add("d-none");
      submitBtn.disabled = false;
    }
  }

  coletarDadosFormulario() {
    return {
      nome: document.getElementById("nome").value,
      rg: document.getElementById("rg").value,
      cpf: document.getElementById("cpf").value,
      email: document.getElementById("email").value,
      cnpj: document.getElementById("cnpj").value,
      cep: document.getElementById("cep").value,
      rua: document.getElementById("rua").value,
      numero: document.getElementById("numero").value,
      bairro: document.getElementById("bairro").value,
      cidade: document.getElementById("cidade").value,
      uf: document.getElementById("uf").value,
      razaoSocial: document.getElementById("razaoSocial").value,
      nomeComercial: document.getElementById("nomeComercial").value,
      nomeAcademico: document.getElementById("nomeAcademico").value,
      nomeTestemunha: document.getElementById("nomeTestemunha").value,
      emailTestemunha: document.getElementById("emailTestemunha").value,
      cpfTestemunha: document.getElementById("cpfTestemunha").value,
      contato: document.getElementById("contato").value,
      tipoParceria: document.getElementById("tipoParceria").value,
      captadoPor: document.getElementById("captadoPor").value,
    };
  }

  limparFormulario() {
    this.form.reset();
    this.form.classList.remove("was-validated");

    // Remover classes de validação
    this.form.querySelectorAll(".is-valid, .is-invalid").forEach((input) => {
      input.classList.remove("is-valid", "is-invalid");
    });
  }
}

// Função global para limpar formulário
function limparFormulario() {
  if (cadastroParceiro) {
    cadastroParceiro.limparFormulario();
  }
}

// Inicializar quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
  window.cadastroParceiro = new CadastroParceiro();
});
