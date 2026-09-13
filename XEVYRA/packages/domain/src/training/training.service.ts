
export interface PRCandidate {
  exerciseId: string;
  exerciseName: string;
  weightKg: number;
  reps: number;
  estimated1RM: number;
}

export class TrainingDomainService {
  /**
   * Calculates total volume in kg from completed working sets
   */
  public static calculateVolume(sets: Array<{ weightKg: number; reps: number; isCompleted: boolean }>): number {
    return sets
      .filter((s) => s.isCompleted && s.weightKg > 0 && s.reps > 0)
      .reduce((total, s) => total + s.weightKg * s.reps, 0);
  }

  /**
   * Calculates Estimated 1RM using the validated Brzycki formula
   * 1RM = Weight × (36 / (37 - Reps))
   */
  public static calculateEstimated1RM(weightKg: number, reps: number): number {
    if (weightKg <= 0 || reps <= 0) return 0;
    if (reps === 1) return weightKg;
    if (reps > 36) return weightKg; // Boundary safety

    const raw1RM = weightKg * (36 / (37 - reps));
    return Math.round(raw1RM * 10) / 10;
  }

  /**
   * Detects new PRs by comparing current performance against existing personal records
   */
  public static detectPersonalRecords(
    exerciseId: string,
    exerciseName: string,
    completedSets: Array<{ weightKg: number; reps: number; isCompleted: boolean }>,
    currentBest1RM: number = 0
  ): PRCandidate | null {
    let bestCandidate: PRCandidate | null = null;
    let highest1RM = currentBest1RM;

    for (const set of completedSets) {
      if (!set.isCompleted || set.weightKg <= 0 || set.reps <= 0) continue;

      const estimated1RM = this.calculateEstimated1RM(set.weightKg, set.reps);
      if (estimated1RM > highest1RM) {
        highest1RM = estimated1RM;
        bestCandidate = {
          exerciseId,
          exerciseName,
          weightKg: set.weightKg,
          reps: set.reps,
          estimated1RM,
        };
      }
    }

    return bestCandidate;
  }
}
