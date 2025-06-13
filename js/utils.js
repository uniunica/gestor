// Utilitários gerais do sistema
class Utils {
    
    // Formatação de documentos
    static formatarCPF(cpf) {
        if (!cpf) return '';
        const numeros = cpf.replace(/\D/g, '');
        return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    static formatarCNPJ(cnpj) {
        if (!cnpj) return '';
        const numeros = cnpj.replace(/\D/g, '');
        return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }

    static formatarCEP(cep) {
        if (!cep) return '';
        const numeros = cep.replace(/\D/g, '');
        return numeros.replace(/(\d{5})(\d{3})/, '$1-$2');
    }

    static formatarTelefone(telefone) {
        if (!telefone) return '';
        const numeros = telefone.replace(/\D/g, '');
        if (numeros.length === 11) {
            return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (numeros.length === 10) {
            return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return telefone;
    }

    // Validações
    static validarCPF(cpf) {
        const numeros = cpf.replace(/\D/g, '');
        
        if (numeros.length !== 11 || /^(\d)\1{10}$/.test(numeros)) {
            return false;
        }

        let soma = 0;
        let resto;

        for (let i = 1; i <= 9; i++) {
            soma += parseInt(numeros.substring(i - 1, i)) * (11 - i);
        }

        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(numeros.substring(9, 10))) return false;

        soma = 0;
        for (let i = 1; i <= 10; i++) {
            soma += parseInt(numeros.substring(i - 1, i)) * (12 - i);
        }

        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(numeros.substring(10, 11))) return false;

        return true;
    }

    static validarCNPJ(cnpj) {
        const numeros = cnpj.replace(/\D/g, '');
        
        if (numeros.length !== 14) return false;
        if (/^(\d)\1{13}$/.test(numeros)) return false;

        let tamanho = numeros.length - 2;
        let numeros_verificacao = numeros.substring(0, tamanho);
        let digitos = numeros.substring(tamanho);
        let soma = 0;
        let pos = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
            soma += numeros_verificacao.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }

        let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado !== parseInt(digitos.charAt(0))) return false;

        tamanho = tamanho + 1;
        numeros_verificacao = numeros.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
            soma += numeros_verificacao.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }

        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado !== parseInt(digitos.charAt(1))) return false;

        return true;
    }

    static validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Manipulação de datas
    static formatarData(data) {
        if (!data) return '';
        
        if (typeof data === 'string') {
            data = new Date(data);
        }
        
        return data.toLocaleDateString('pt-BR');
    }

    static formatarDataHora(data) {
        if (!data) return '';
        
        if (typeof data === 'string') {
            data = new Date(data);
        }
        
        return data.toLocaleString('pt-BR');
    }

    static obterDataAtual() {
        return new Date();
    }

    static obterMesAtual() {
        return new Date().getMonth() + 1;
    }

    static obterAnoAtual() {
        return new Date().getFullYear();
    }

    // Manipulação de strings
    static capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    static removerAcentos(str) {
        if (!str) return '';
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    static gerarSlug(str) {
        if (!str) return '';
        return this.removerAcentos(str)
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    // Utilitários de array
    static ordenarPorNome(array, campo = 'nome') {
        return array.sort((a, b) => {
            const nomeA = a[campo] ? a[campo].toLowerCase() : '';
            const nomeB = b[campo] ? b[campo].toLowerCase() : '';
            return nomeA.localeCompare(nomeB);
        });
    }

    static filtrarPorTexto(array, texto, campos = ['nome']) {
        if (!texto) return array;
        
        const textoLower = texto.toLowerCase();
        return array.filter(item => {
            return campos.some(campo => {
                const valor = item[campo];
                return valor && valor.toLowerCase().includes(textoLower);
            });
        });
    }

    // Utilitários de localStorage
    static salvarLocal(chave, valor) {
        try {
            localStorage.setItem(chave, JSON.stringify(valor));
            return true;
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
            return false;
        }
    }

    static carregarLocal(chave) {
        try {
            const valor = localStorage.getItem(chave);
            return valor ? JSON.parse(valor) : null;
        } catch (error) {
            console.error('Erro ao carregar do localStorage:', error);
            return null;
        }
    }

    static removerLocal(chave) {
        try {
            localStorage.removeItem(chave);
            return true;
        } catch (error) {
            console.error('Erro ao remover do localStorage:', error);
            return false;
        }
    }

    // Utilitários de notificação
    static mostrarSucesso(titulo, texto) {
        return Swal.fire({
            icon: 'success',
            title: titulo,
            text: texto,
            timer: 3000,
            showConfirmButton: false
        });
    }

    static mostrarErro(titulo, texto) {
        return Swal.fire({
            icon: 'error',
            title: titulo,
            text: texto
        });
    }

    static mostrarAviso(titulo, texto) {
        return Swal.fire({
            icon: 'warning',
            title: titulo,
            text: texto
        });
    }

    static mostrarInfo(titulo, texto) {
        return Swal.fire({
            icon: 'info',
            title: titulo,
            text: texto
        });
    }

    static confirmar(titulo, texto) {
        return Swal.fire({
            title: titulo,
            text: texto,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });
    }

    // Utilitários de loading
    static mostrarLoading(texto = 'Carregando...') {
        return Swal.fire({
            title: texto,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }

    static esconderLoading() {
        Swal.close();
    }

    // Utilitários de exportação
    static exportarCSV(dados, nomeArquivo = 'dados.csv') {
        if (!dados || dados.length === 0) {
            this.mostrarAviso('Aviso', 'Não há dados para exportar');
            return;
        }

        const cabecalhos = Object.keys(dados[0]);
        const csv = [
            cabecalhos.join(','),
            ...dados.map(row => 
                cabecalhos.map(header => 
                    JSON.stringify(row[header] || '')
                ).join(',')
            )
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', nomeArquivo);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    // Utilitários de debounce
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

    // Utilitários de URL
    static obterParametroURL(nome) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(nome);
    }

    static definirParametroURL(nome, valor) {
        const url = new URL(window.location);
        url.searchParams.set(nome, valor);
        window.history.pushState({}, '', url);
    }

    // Utilitários de dispositivo
    static isMobile() {
        return window.innerWidth <= 768;
    }

    static isTablet() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    }

    static isDesktop() {
        return window.innerWidth > 1024;
    }
}

// Disponibilizar globalmente
window.Utils = Utils;