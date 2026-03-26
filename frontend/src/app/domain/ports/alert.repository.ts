import { Observable } from 'rxjs';
import { AlertEntity } from '../entities/alert.entity';

export interface AlertRepository {
  getAlerts(): Observable<AlertEntity[]>;
  getAlertById(id: string): Observable<AlertEntity>;
}

export const ALERT_REPOSITORY = 'ALERT_REPOSITORY';
