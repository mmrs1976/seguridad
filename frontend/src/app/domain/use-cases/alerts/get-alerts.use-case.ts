import { Observable } from 'rxjs';
import { AlertRepository } from '../../ports/alert.repository';
import { AlertEntity } from '../../entities/alert.entity';

export class GetAlertsUseCase {
  constructor(private readonly alertRepository: AlertRepository) {}

  execute(): Observable<AlertEntity[]> {
    return this.alertRepository.getAlerts();
  }
}
