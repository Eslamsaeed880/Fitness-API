import APIError from "../../../utils/APIError.js";

export default class RoutineService {
    constructor(RoutineModel, routineExerciseModel, routineExerciseSetModel, exerciseService) {
        this.Routine = RoutineModel;
        this.RoutineExercise = routineExerciseModel;
        this.RoutineExerciseSet = routineExerciseSetModel;
        this.exerciseService = exerciseService;
    }

    async createRoutine(userId, routineData, exercisesData) {
        const routine = new this.Routine({ ...routineData, userId });
        await routine.save();

        for (const exerciseData of exercisesData) {
            const exercise = await this.exerciseService.getExerciseById(exerciseData.exerciseId);

            if (!exercise) {
                throw new APIError(400, `Exercise with ID ${exerciseData.exerciseId} not found.`);
            }

            const routineExercise = new this.RoutineExercise({
                routineId: routine._id,
                exerciseId: exercise._id,
                orderIndex: exerciseData.orderIndex || 0
            });

            await routineExercise.save();
            
            for (const setData of exerciseData.sets) {
                const routineExerciseSet = new this.RoutineExerciseSet({
                    setIndex: setData.setIndex || 0,
                    routineExerciseId: routineExercise._id,
                    type: setData.type || 'normal',
                    targetReps: setData.targetReps || 0,
                    targetWeightKg: setData.targetWeightKg || 0,
                    restSeconds: setData.restSeconds || 0
                });

                await routineExerciseSet.save();
            }
        }

        return {
            routineId: routine._id,
            name: routine.name,
            description: routine.description,
            isPublic: routine.isPublic,
            exercises: exercisesData.map(ex => ({
                exerciseId: ex.exerciseId,
                orderIndex: ex.orderIndex,
                sets: ex.sets
            }))
        }
    }
}