# Sistema de Gerenciamento de Parceiros

Sistema web completo para gerenciamento de parceiros integrado com Google Sheets, desenvolvido com HTML5, CSS3 e JavaScript puro.

## 🚀 Funcionalidades

- **Autenticação simples** (Admin/Admin123)
- **Dashboard interativo** com estatísticas
- **Cadastro completo de parceiros** com validação
- **Gestão de fluxo de trabalho** (Dados Iniciais → Cadastro Finais → Treinamento)
- **Busca e filtros avançados**
- **Integração com Google Sheets**
- **Interface responsiva**
- **Exportação de dados**
- **Sistema de notificações**

## 📁 Estrutura do Projeto

sistema-parceiros/ ├── index.html # Página principal ├── login.html # Página de login ├── css/ │ └── style.css # Estilos principais ├── js/ │ ├── app.js # Aplicação principal │ ├── auth.js # Sistema de autenticação │ ├── sheets-api.js # Integração Google Sheets │ └── utils.js # Utilitários e helpers └── README.md # Documentação

## ⚙️ Configuração

### 1. Google Sheets API

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a Google Sheets API
4. Crie credenciais (API Key)
5. Configure as permissões da planilha

### 2. Configurar o Sistema

1. Abra o arquivo `js/sheets-api.js`
2. Substitua as variáveis de configuração:

```javascript
this.apiKey = 'SUA_API_KEY_AQUI';
this.spreadsheetId = 'SEU_SPREADSHEET_ID_AQUI';
