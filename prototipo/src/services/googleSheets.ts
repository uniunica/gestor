import { InitialData, FinalRegistration, TrainingData } from "../types/partner";

class GoogleSheetsAPI {
  private baseUrl = "https://sheets.googleapis.com/v4/spreadsheets";
  private spreadsheetId =
    import.meta.env.VITE_GOOGLE_SHEETS_ID || "your-spreadsheet-id";
  private apiKey = import.meta.env.VITE_GOOGLE_API_KEY || "your-api-key";

  async addInitialData(data: InitialData): Promise<void> {
    // Simulate API call to Google Sheets
    console.log("Adding initial data to Google Sheets:", data);

    const values = [
      [
        data.contractNumber,
        data.year,
        data.month,
        data.day,
        data.name,
        data.rg,
        data.cpf,
        data.email,
        data.cnpj,
        data.cep,
        data.street,
        data.number,
        data.neighborhood,
        data.city,
        data.state,
        data.companyName,
        data.tradeName,
        data.academicName,
        data.witnessName,
        data.witnessEmail,
        data.witnessCpf,
        data.contact,
        data.partnershipType,
        data.capturedBy,
      ],
    ];

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In a real implementation, you would make an actual API call:
    /*
    const response = await fetch(
      `${this.baseUrl}/${this.spreadsheetId}/values/DADOS INICIAIS!A:X:append?valueInputOption=USER_ENTERED&key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          values
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update Google Sheets');
    }
    */
  }

  async updateFinalRegistration(data: FinalRegistration): Promise<void> {
    console.log("Updating final registration in Google Sheets:", data);

    const values = [
      [
        data.name,
        data.city,
        data.state,
        data.createEmail ? "SIM" : "NÃO",
        data.systemRegistration ? "SIM" : "NÃO",
        data.partnerPortalAccess ? "SIM" : "NÃO",
        data.pincelAccess ? "SIM" : "NÃO",
        data.createDriveFolder ? "SIM" : "NÃO",
        data.sendToCaptation ? "SIM" : "NÃO",
        data.directToLorraine ? "SIM" : "NÃO",
      ],
    ];

    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  async updateTrainingData(data: TrainingData): Promise<void> {
    console.log("Updating training data in Google Sheets:", data);

    const values = [
      [
        data.name,
        data.city,
        data.state,
        data.status.toUpperCase(),
        data.registration ? "SIM" : "NÃO",
        data.lorrainContact ? "SIM" : "NÃO",
        data.trainingStart
          ? data.trainingStart.toISOString().split("T")[0]
          : "",
        data.cademiCourse ? "SIM" : "NÃO",
        data.commercialTraining ? "SIM" : "NÃO",
      ],
    ];

    await new Promise((resolve) => setTimeout(resolve, 800));
  }
}

export const GoogleSheetsService = new GoogleSheetsAPI();
