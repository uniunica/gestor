class LoginManager {
  constructor() {
    this.form = document.getElementById("loginForm");
    this.usernameInput = document.getElementById("username");
    this.passwordInput = document.getElementById("password");
    this.errorDiv = document.getElementById("loginError");
    this.loginText = document.getElementById("loginText");
    this.loginSpinner = document.getElementById("loginSpinner");

    this.init();
  }

  init() {
    // Verificar se já está logado
    if (this.isLoggedIn()) {
      window.location.href = "dashboard.html";
      return;
    }

    // Event listeners
    this.form.addEventListener("submit", (e) => this.handleLogin(e));

    // Limpar erro ao digitar
    this.usernameInput.addEventListener("input", () => this.clearError());
    this.passwordInput.addEventListener("input", () => this.clearError());
  }

  async handleLogin(event) {
    event.preventDefault();

    const username = this.usernameInput.value.trim();
    const password = this.passwordInput.value.trim();

    // Validação básica
    if (!username || !password) {
      this.showError("Por favor, preencha todos os campos.");
      return;
    }

    this.setLoadingState(true);

    try {
      // Simular delay de autenticação
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verificar credenciais
      if (username === "admin" && password === "admin123") {
        // Login bem-sucedido
        this.setAuthToken();
        this.showSuccess("Login realizado com sucesso!");

        // Redirecionar após 1 segundo
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);
      } else {
        this.showError("Usuário ou senha incorretos.");
      }
    } catch (error) {
      this.showError("Erro interno. Tente novamente.");
      console.error("Erro no login:", error);
    } finally {
      this.setLoadingState(false);
    }
  }

  setLoadingState(loading) {
    const submitBtn = this.form.querySelector('button[type="submit"]');

    if (loading) {
      submitBtn.disabled = true;
      this.loginText.style.display = "none";
      this.loginSpinner.style.display = "block";
    } else {
      submitBtn.disabled = false;
      this.loginText.style.display = "block";
      this.loginSpinner.style.display = "none";
    }
  }

  showError(message) {
    this.errorDiv.textContent = message;
    this.errorDiv.style.display = "block";
    this.errorDiv.className = "alert alert-error";
  }

  showSuccess(message) {
    this.errorDiv.textContent = message;
    this.errorDiv.style.display = "block";
    this.errorDiv.className = "alert alert-success";
  }

  clearError() {
    this.errorDiv.style.display = "none";
  }

  setAuthToken() {
    const token = btoa(`admin:${Date.now()}`);
    localStorage.setItem("authToken", token);
    localStorage.setItem("loginTime", Date.now().toString());
  }

  isLoggedIn() {
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

  logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("loginTime");
  }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  new LoginManager();
});
