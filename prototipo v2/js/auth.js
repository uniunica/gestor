// Sistema de Autenticação
class AuthSystem {
  constructor() {
    this.init();
  }

  init() {
    // Verificar se já está logado
    if (this.isLoggedIn() && window.location.pathname.includes("login.html")) {
      window.location.href = "index.html";
      return;
    }

    // Se não está logado e não está na página de login
    if (
      !this.isLoggedIn() &&
      !window.location.pathname.includes("login.html")
    ) {
      window.location.href = "login.html";
      return;
    }

    // Configurar eventos de login
    if (window.location.pathname.includes("login.html")) {
      this.setupLoginForm();
    } else {
      this.setupLogout();
    }
  }

  setupLoginForm() {
    const loginForm = document.getElementById("loginForm");
    const errorDiv = document.getElementById("loginError");

    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }
  }

  setupLogout() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        this.logout();
      });
    }
  }

  handleLogin() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorDiv = document.getElementById("loginError");

    // Validação simples
    if (username === "Admin" && password === "Admin123") {
      // Login bem-sucedido
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("loginTime", new Date().getTime());
      localStorage.setItem("username", username);

      window.location.href = "index.html";
    } else {
      // Login falhou
      errorDiv.textContent = "Usuário ou senha incorretos!";
      errorDiv.style.display = "block";

      // Limpar erro após 3 segundos
      setTimeout(() => {
        errorDiv.style.display = "none";
      }, 3000);
    }
  }

  isLoggedIn() {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const loginTime = localStorage.getItem("loginTime");

    if (!isLoggedIn || !loginTime) {
      return false;
    }

    // Verificar se a sessão não expirou (24 horas)
    const currentTime = new Date().getTime();
    const sessionDuration = 24 * 60 * 60 * 1000; // 24 horas em ms

    if (currentTime - parseInt(loginTime) > sessionDuration) {
      this.logout();
      return false;
    }

    return true;
  }

  logout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loginTime");
    localStorage.removeItem("username");
    window.location.href = "login.html";
  }

  getUsername() {
    return localStorage.getItem("username") || "Admin";
  }
}

// Inicializar sistema de autenticação
document.addEventListener("DOMContentLoaded", () => {
  new AuthSystem();
});
