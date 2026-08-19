import type { ProfessorDashboardDTO } from "../types/professorDashboard";
import { DASHBOARD_MOCK } from "../pages/ProfessorDashboard/mocks";

const ATRASO_MOCK_MS = 500;

// Mock: endpoint de dashboard do professor ainda não existe na API.
// Quando existir, trocar o corpo por Api.get<ProfessorDashboardDTO>("/Professor/dashboard").
export async function getProfessorDashboard(): Promise<ProfessorDashboardDTO> {
  return new Promise((resolve) => setTimeout(() => resolve(DASHBOARD_MOCK), ATRASO_MOCK_MS));
}
