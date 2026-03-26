export interface SurveyData {
  section1?: Record<string, unknown>;
  section2?: Record<string, unknown>;
  section3?: Record<string, unknown>;
  section4?: Record<string, unknown>;
  section5?: Record<string, unknown>;
}

export interface SurveyResponseEntity {
  data: SurveyData | null;
  status: 'draft' | 'submitted' | null;
  submittedAt: string | null;
}
