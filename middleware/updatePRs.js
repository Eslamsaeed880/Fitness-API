import ExercisePR from '../models/exercisePR.js';

export const updateExercisePRs = async (userId, workoutData) => {
    try {
        for (const exercise of workoutData.exercises) {
            const completedSets = exercise.sets.filter(set => 
                set.isCompleted
            );

            if (completedSets.length === 0) {
                continue;
            }

            const maxWeight = Math.max(...completedSets.map(set => set.weightKg));
            const maxReps = Math.max(...completedSets.map(set => set.reps));

            let existingPR = await ExercisePR.findOne({
                userId: userId,
                exerciseId: exercise.exerciseId
            });

            let prUpdated = false;

            if (!existingPR) {
                existingPR = new ExercisePR({
                    userId: userId,
                    exerciseId: exercise.exerciseId,
                    maxWeightKg: maxWeight,
                    maxReps: maxReps,
                    achievedAt: new Date()
                });
                prUpdated = true;
            } else {
                if (maxWeight > existingPR.maxWeightKg) {
                    existingPR.maxWeightKg = maxWeight;
                    existingPR.achievedAt = new Date();
                    prUpdated = true;
                }

                if (maxReps > existingPR.maxReps) {
                    existingPR.maxReps = maxReps;
                    existingPR.achievedAt = new Date();
                    prUpdated = true;
                }
            }

            if (prUpdated) {
                await existingPR.save();
            }
        }
    } catch (error) {
        console.error('Error updating exercise PRs:', error);
        throw error;
    }
};