// Utilitários e Helpers
class Utils {
  // Validação de CPF
  static validateCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, "");
    if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;

    cpf = cpf.split("").map((el) => +el);
    const rest = (count) =>
      ((cpf
        .slice(0, count - 12)
        .reduce((soma, el, index) => soma + el * (count - index), 0) *
        10) %
        11) %
      10;

    return rest(10) === cpf[9] && rest(11) === cpf[10];
  }

  // Validação de CNPJ
  static validateCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g, "");

    if (cnpj.length !== 14) return false;

    // Elimina CNPJs invalidos conhecidos
    if (
      cnpj === "00000000000000" ||
      cnpj === "11111111111111" ||
      cnpj === "22222222222222" ||
      cnpj === "33333333333333" ||
      cnpj === "44444444444444" ||
      cnpj === "55555555555555" ||
      cnpj === "66666666666666" ||
      cnpj === "77777777777777" ||
      cnpj === "88888888888888" ||
      cnpj === "99999999999999"
    )
      return false;

    // Valida DVs
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(1))) return false;

    return true;
  }

  // Validação de email
  static validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Formatação de CPF
  static formatCPF(cpf) {
    cpf = cpf.replace(/\D/g, "");
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  // Formatação de CNPJ
  static formatCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, "");
    return cnpj.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5"
    );
  }

  // Formatação de CEP
  static formatCEP(cep) {
    cep = cep.replace(/\D/g, "");
    return cep.replace(/(\d{5})(\d{3})/, "$1-$2");
  }

  // Formatação de telefone
  static formatPhone(phone) {
    phone = phone.replace(/\D/g, "");
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (phone.length === 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return phone;
  }

  // Buscar CEP
  static async fetchCEP(cep) {
    try {
      cep = cep.replace(/\D/g, "");
      if (cep.length !== 8) throw new Error("CEP inválido");

      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) throw new Error("CEP não encontrado");

      return data;
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      return null;
    }
  }

  // Gerar número de contrato
  static generateContractNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");

    return `${year}${month}${day}${random}`;
  }

  // Formatação de data
  static formatDate(date) {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("pt-BR");
  }

  // Formatação de data e hora
  static formatDateTime(date) {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleString("pt-BR");
  }

  // Debounce para otimizar buscas
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Sanitizar string para evitar XSS
  static sanitizeString(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // Capitalizar primeira letra
  static capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // Capitalizar nome completo
  static capitalizeName(name) {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => this.capitalize(word))
      .join(" ");
  }

  // Gerar ID único
  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Converter objeto para query string
  static objectToQueryString(obj) {
    return Object.keys(obj)
      .map(
        (key) => encodeURIComponent(key) + "=" + encodeURIComponent(obj[key])
      )
      .join("&");
  }

  // Download de arquivo
  static downloadFile(data, filename, type = "text/plain") {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // Copiar texto para clipboard
  static async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fallback para navegadores mais antigos
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        return true;
      } catch (err) {
        return false;
      } finally {
        document.body.removeChild(textArea);
      }
    }
  }
}

// Sistema de Notificações Toast
class ToastManager {
  constructor() {
    this.container = document.getElementById("toastContainer");
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "toastContainer";
      this.container.className = "toast-container";
      document.body.appendChild(this.container);
    }
  }

  show(message, type = "info", duration = 5000) {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-message">${Utils.sanitizeString(
                  message
                )}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;

    this.container.appendChild(toast);

    // Auto remove após duração especificada
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, duration);

    return toast;
  }

  success(message, duration = 5000) {
    return this.show(message, "success", duration);
  }

  error(message, duration = 7000) {
    return this.show(message, "error", duration);
  }

  warning(message, duration = 6000) {
    return this.show(message, "warning", duration);
  }

  info(message, duration = 5000) {
    return this.show(message, "info", duration);
  }
}

// Sistema de Loading
class LoadingManager {
  constructor() {
    this.overlay = document.getElementById("loadingOverlay");
    if (!this.overlay) {
      this.createOverlay();
    }
    this.isLoading = false;
  }

  createOverlay() {
    this.overlay = document.createElement("div");
    this.overlay.id = "loadingOverlay";
    this.overlay.className = "loading-overlay";
    this.overlay.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Carregando...</p>
            </div>
        `;
    document.body.appendChild(this.overlay);
  }

  show(message = "Carregando...") {
    if (this.isLoading) return;

    this.isLoading = true;
    const messageElement = this.overlay.querySelector("p");
    if (messageElement) {
      messageElement.textContent = message;
    }
    this.overlay.style.display = "flex";
  }

  hide() {
    if (!this.isLoading) return;

    this.isLoading = false;
    this.overlay.style.display = "none";
  }
}

// Instâncias globais
const toast = new ToastManager();
const loading = new LoadingManager();
