import APIError from "../../../utils/APIError.js";

export default class RoutineService {
    constructor(RoutineModel, routineExerciseModel, routineExerciseSetModel, exerciseService) {
        this.Routine = RoutineModel;
        this.RoutineExercise = routineExerciseModel;
        this.RoutineExerciseSet = routineExerciseSetModel;
        this.exerciseService = exerciseService;
    }

    async createRoutine(userId, routineData, exercisesData) {
        const routine = new this.Routine({
            userId,
            name: routineData.name,
            description: routineData.description,
            isPublic: routineData.isPublic
        });

        await routine.save();

        for (const exerciseData of exercisesData) {
            const routineExercise = new this.RoutineExercise({
                routineId: routine._id,
                exerciseId: exerciseData.exerciseId,
                orderIndex: exerciseData.orderIndex
            });

            const routineExerciseSet = new this.RoutineExerciseSet({
                sets: exerciseData.sets
            });

            await routineExerciseSet.save();

            routineExercise.setsId = routineExerciseSet._id;
            await routineExercise.save();
        }

        const structuredRoutine = {
            userId,
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
        return structuredRoutine;
    }
}