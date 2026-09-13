import { ValueObject } from '../common/entity.js';
import { DomainError, Result } from '../common/result.js';

export type MaintenanceDataConfidence =
  | 'INSUFFICIENT'     // 0-2 days logged
  | 'PRELIMINARY'      // 3-6 days logged
  | 'INITIAL'          // 7-13 days logged
  | 'MORE_RELIABLE'    // 14-27 days logged
  | 'STRONGER_TREND';  // 28+ days logged

export interface DailyLogPoint {
  dateString: string;
  caloriesLogged: number;
  bodyWeightKg?: number;
}

export interface MaintenanceCalorieAnalysisProps {
  userId: string;
  daysAnalyzed: number;
  confidence: MaintenanceDataConfidence;
  averageDailyCalories: number;
  averageBodyWeightKg?: number;
  weightChangeKg?: number;
  weightTrendDescription: string;
  estimatedMaintenanceCalories: number;
  calculatedAt: Date;
  recommendations: string[];
}

export class MaintenanceCalorieAnalysis extends ValueObject<MaintenanceCalorieAnalysisProps> {
  get userId(): string {
    return this.props.userId;
  }
  get daysAnalyzed(): number {
    return this.props.daysAnalyzed;
  }
  get confidence(): MaintenanceDataConfidence {
    return this.props.confidence;
  }
  get averageDailyCalories(): number {
    return this.props.averageDailyCalories;
  }
  get averageBodyWeightKg(): number | undefined {
    return this.props.averageBodyWeightKg;
  }
  get weightChangeKg(): number | undefined {
    return this.props.weightChangeKg;
  }
  get weightTrendDescription(): string {
    return this.props.weightTrendDescription;
  }
  get estimatedMaintenanceCalories(): number {
    return this.props.estimatedMaintenanceCalories;
  }
  get recommendations(): string[] {
    return this.props.recommendations;
  }

  private constructor(props: MaintenanceCalorieAnalysisProps) {
    super(props);
  }

  public static create(props: MaintenanceCalorieAnalysisProps): Result<MaintenanceCalorieAnalysis, DomainError> {
    if (props.daysAnalyzed < 0) {
      return Result.fail(new DomainError('Days analyzed cannot be negative', 'INVALID_DAYS'));
    }
    return Result.ok(new MaintenanceCalorieAnalysis(props));
  }
}
