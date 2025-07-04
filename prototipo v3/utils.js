// Utilitários gerais para o sistema
class Utils {
  // Formatação de CPF
  static formatCPF(cpf) {
    if (!cpf) return "";
    const cleaned = cpf.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return cpf;
  }

  // Formatação de CNPJ
  static formatCNPJ(cnpj) {
    if (!cnpj) return "";
    const cleaned = cnpj.replace(/\D/g, "");
    if (cleaned.length === 14) {
      return cleaned.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5"
      );
    }
    return cnpj;
  }

  // Formatação de CEP
  static formatCEP(cep) {
    if (!cep) return "";
    const cleaned = cep.replace(/\D/g, "");
    if (cleaned.length === 8) {
      return cleaned.replace(/(\d{5})(\d{3})/, "$1-$2");
    }
    return cep;
  }

  // Formatação de telefone
  static formatPhone(phone) {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return phone;
  }

  // Validação de CPF
  static validateCPF(cpf) {
    const cleaned = cpf.replace(/\D/g, "");

    if (cleaned.length !== 11 || /^(\d)\1{10}$/.test(cleaned)) {
      return false;
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned.charAt(i)) * (10 - i);
    }

    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleaned.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned.charAt(i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;

    return remainder === parseInt(cleaned.charAt(10));
  }

  // Validação de CNPJ
  static validateCNPJ(cnpj) {
    const cleaned = cnpj.replace(/\D/g, "");

    if (cleaned.length !== 14 || /^(\d)\1{13}$/.test(cleaned)) {
      return false;
    }

    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleaned.charAt(i)) * weights1[i];
    }

    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;

    if (digit1 !== parseInt(cleaned.charAt(12))) return false;

    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleaned.charAt(i)) * weights2[i];
    }

    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;

    return digit2 === parseInt(cleaned.charAt(13));
  }

  // Validação de email
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Debounce para otimizar pesquisas
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

  // Formatação de data para exibição
  static formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  }

  // Formatação de data para input
  static formatDateForInput(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  }

  // Geração de número de contrato
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

  // Capitalizar primeira letra de cada palavra
  static capitalizeWords(str) {
    if (!str) return "";
    return str.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  }

  // Remover acentos
  static removeAccents(str) {
    if (!str) return "";
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  // Busca de CEP via API
  static async searchCEP(cep) {
    try {
      const cleanCEP = cep.replace(/\D/g, "");
      if (cleanCEP.length !== 8) {
        throw new Error("CEP deve ter 8 dígitos");
      }

      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCEP}/json/`
      );
      const data = await response.json();

      if (data.erro) {
        throw new Error("CEP não encontrado");
      }

      return {
        cep: data.cep,
        rua: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        uf: data.uf,
      };
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      throw error;
    }
  }

  // Mostrar notificação
  static showNotification(message, type = "success", duration = 3000) {
    // Remover notificação existente
    const existing = document.querySelector(".notification");
    if (existing) {
      existing.remove();
    }

    // Criar nova notificação
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${
                  type === "success" ? "✅" : type === "error" ? "❌" : "⚠️"
                }</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

    // Adicionar estilos
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: ${
              type === "success"
                ? "#10B981"
                : type === "error"
                ? "#EF4444"
                : "#F59E0B"
            };
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideInRight 0.3s ease-out;
            max-width: 400px;
        `;

    // Adicionar ao body
    document.body.appendChild(notification);

    // Event listener para fechar
    const closeBtn = notification.querySelector(".notification-close");
    closeBtn.addEventListener("click", () => {
      notification.remove();
    });

    // Auto remover
    if (duration > 0) {
      setTimeout(() => {
        if (notification.parentNode) {
          notification.style.animation = "slideOutRight 0.3s ease-in";
          setTimeout(() => notification.remove(), 300);
        }
      }, duration);
    }
  }

  // Confirmar ação
  static async confirmAction(message, title = "Confirmar") {
    return new Promise((resolve) => {
      // Criar modal de confirmação
      const modal = document.createElement("div");
      modal.className = "modal show";
      modal.innerHTML = `
                <div class="modal-content" style="max-width: 400px;">
                    <div class="modal-header">
                        <h2>${title}</h2>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="cancelConfirm">Cancelar</button>
                        <button class="btn btn-primary" id="confirmAction">Confirmar</button>
                    </div>
                </div>
            `;

      document.body.appendChild(modal);

      // Event listeners
      modal.querySelector("#cancelConfirm").addEventListener("click", () => {
        modal.remove();
        resolve(false);
      });

      modal.querySelector("#confirmAction").addEventListener("click", () => {
        modal.remove();
        resolve(true);
      });

      // Fechar ao clicar fora
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.remove();
          resolve(false);
        }
      });
    });
  }

  // Loading state
  static showLoading(show = true) {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) {
      overlay.classList.toggle("show", show);
    }
  }

  // Scroll suave
  static smoothScrollTo(element) {
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  // Copiar para clipboard
  static async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showNotification("Copiado para a área de transferência!");
      return true;
    } catch (error) {
      console.error("Erro ao copiar:", error);
      return false;
    }
  }

  // Exportar dados para CSV
  static exportToCSV(data, filename = "dados.csv") {
    if (!data || data.length === 0) {
      this.showNotification("Nenhum dado para exportar", "warning");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((header) => `"${row[header] || ""}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    this.showNotification("Arquivo exportado com sucesso!");
  }
}

// Adicionar estilos para notificações
const notificationStyles = document.createElement("style");
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .notification-icon {
        font-size: 18px;
    }
    
    .notification-message {
        flex: 1;
        font-weight: 500;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.2s;
    }
    
    .notification-close:hover {
        background: rgba(255, 255, 255, 0.2);
    }
`;

document.head.appendChild(notificationStyles);
