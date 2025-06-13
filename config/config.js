// Configurações do sistema
const CONFIG = {
    // Google Sheets
    GOOGLE_SHEETS: {
        SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',
        API_KEY: 'YOUR_API_KEY_HERE',
        CLIENT_ID: 'YOUR_CLIENT_ID_HERE',
        SCOPES: 'https://www.googleapis.com/auth/spreadsheets'
    },
    
    // Configurações da aplicação
    APP: {
        NAME: 'Sistema de Gerenciamento de Parceiros',
        VERSION: '1.0.0',
        AUTHOR: 'Sua Empresa',
        DEBUG: true
    },
    
    // URLs das APIs
    APIS: {
        VIACEP: 'https://viacep.com.br/ws/',
        GOOGLE_SHEETS: 'https://sheets.googleapis.com/v4/spreadsheets/'
    },
    
    // Configurações de validação
    VALIDATION: {
        CPF_REQUIRED: true,
        EMAIL_REQUIRED: true,
        PHONE_REQUIRED: true,
        ADDRESS_REQUIRED: true
    },
    
    // Tipos de parceria disponíveis
    PARTNERSHIP_TYPES: [
        'Polo Presencial',
        'Polo EAD',
        'Representante Comercial',
        'Parceiro Estratégico'
    ],
    
    // Estados brasileiros
    STATES: [
        { code: 'AC', name: 'Acre' },
        { code: 'AL', name: 'Alagoas' },
        { code: 'AP', name: 'Amapá' },
        { code: 'AM', name: 'Amazonas' },
        { code: 'BA', name: 'Bahia' },
        { code: 'CE', name: 'Ceará' },
        { code: 'DF', name: 'Distrito Federal' },
        { code: 'ES', name: 'Espírito Santo' },
        { code: 'GO', name: 'Goiás' },
        { code: 'MA', name: 'Maranhão' },
        { code: 'MT', name: 'Mato Grosso' },
        { code: 'MS', name: 'Mato Grosso do Sul' },
        { code: 'MG', name: 'Minas Gerais' },
        { code: 'PA', name: 'Pará' },
        { code: 'PB', name: 'Paraíba' },
        { code: 'PR', name: 'Paraná' },
        { code: 'PE', name: 'Pernambuco' },
        { code: 'PI', name: 'Piauí' },
        { code: 'RJ', name: 'Rio de Janeiro' },
        { code: 'RN', name: 'Rio Grande do Norte' },
        { code: 'RS', name: 'Rio Grande do Sul' },
        { code: 'RO', name: 'Rondônia' },
        { code: 'RR', name: 'Roraima' },
        { code: 'SC', name: 'Santa Catarina' },
        { code: 'SP', name: 'São Paulo' },
        { code: 'SE', name: 'Sergipe' },
        { code: 'TO', name: 'Tocantins' }
    ]
};

// Exportar configurações
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}