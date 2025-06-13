class AuthManager {
  constructor() {
    this.users = [
      {
        email: "admin@sistema.com",
        password: "admin123",
        role: "admin",
        name: "Administrador",
      },
      {
        email: "gestor@sistema.com",
        password: "gestor123",
        role: "manager",
        name: "Gestor",
      },
    ];
    this.currentUser = null;
    this.init();
  }

  init() {
    // Verificar se já está logado
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
      if (window.location.pathname.includes("login.html")) {
        window.location.href = "dashboard.html";
      }
    }

    // Event listeners
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    }
  }

  async handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const rememberMe = document.getElementById("rememberMe").checked;
    const spinner = document.getElementById("loginSpinner");

    // Mostrar loading
    spinner.classList.remove("d-none");

    try {
      // Simular delay de autenticação
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const user = this.users.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        this.currentUser = { ...user };
        delete this.currentUser.password;

        if (rememberMe) {
          localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
        } else {
          sessionStorage.setItem(
            "currentUser",
            JSON.stringify(this.currentUser)
          );
        }

        this.showSuccess("Login realizado com sucesso!");
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1500);
      } else {
        this.showError("Email ou senha incorretos");
      }
    } catch (error) {
      this.showError("Erro ao fazer login. Tente novamente.");
    } finally {
      spinner.classList.add("d-none");
    }
  }

  logout() {
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");
    this.currentUser = null;
    window.location.href = "login.html";
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }

  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = "login.html";
      return false;
    }
    return true;
  }

  showSuccess(message) {
    Swal.fire({
      icon: "success",
      title: "Sucesso!",
      text: message,
      timer: 2000,
      showConfirmButton: false,
    });
  }

  showError(message) {
    Swal.fire({
      icon: "error",
      title: "Erro!",
      text: message,
    });
  }
}

// Inicializar autenticação
const auth = new AuthManager();
