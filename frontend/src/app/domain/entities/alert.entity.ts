export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AlertEntity {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  createdAt: Date;
  resolved: boolean;
}
