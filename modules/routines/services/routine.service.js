import APIError from "../../../utils/APIError.js";

export default class RoutineService {
    constructor(RoutineModel, routineExerciseModel, routineExerciseSetModel, exerciseService) {
        this.Routine = RoutineModel;
        this.RoutineExercise = routineExerciseModel;
        this.RoutineExerciseSet = routineExerciseSetModel;
        this.exerciseService = exerciseService;
    }

    ensureExercisesPayload(exercisesData) {
        if (!Array.isArray(exercisesData) || exercisesData.length === 0) {
            throw new APIError(400, 'At least one exercise is required to create a routine.');
        }
    }

    async validateExerciseIds(exercisesData) {
        // Validate all referenced exercises in one query to avoid N lookups.
        const uniqueExerciseIds = [...new Set(exercisesData.map((exercise) => String(exercise.exerciseId)))];

        const existingExercises = await this.exerciseService.Exercise
            .find({ _id: { $in: uniqueExerciseIds } })
            .select('_id')
            .lean();

        const existingExerciseIds = new Set(existingExercises.map((exercise) => String(exercise._id)));

        for (const exerciseId of uniqueExerciseIds) {
            if (!existingExerciseIds.has(exerciseId)) {
                throw new APIError(400, `Exercise with ID ${exerciseId} not found.`);
            }
        }
    }

    buildRoutineExerciseDocs(routineId, exercisesData) {
        return exercisesData.map((exerciseData) => ({
            routineId,
            exerciseId: exerciseData.exerciseId,
            orderIndex: exerciseData.orderIndex || 0
        }));
    }

    buildRoutineExerciseSetDocs(exercisesData, routineExercises) {
        // Build a flat list of set docs so we can insert all sets in one bulk write.
        return exercisesData.flatMap((exerciseData, index) => {
            const sets = Array.isArray(exerciseData.sets) ? exerciseData.sets : [];
            const routineExercise = routineExercises[index];

            return sets.map((setData) => ({
                setIndex: setData.setIndex || 0,
                routineExerciseId: routineExercise._id,
                type: setData.type || 'normal',
                targetReps: setData.targetReps || 0,
                targetWeightKg: setData.targetWeightKg || 0,
                restSeconds: setData.restSeconds || 0
            }));
        });
    }

    formatCreateRoutineResponse(routine, exercisesData) {
        return {
            routineId: routine._id,
            name: routine.name,
            description: routine.description,
            isPublic: routine.isPublic,
            exercises: exercisesData.map((exercise) => ({
                exerciseId: exercise.exerciseId,
                orderIndex: exercise.orderIndex,
                sets: exercise.sets
            }))
        };
    }

    async createRoutine(userId, routineData, exercisesData) {
        this.ensureExercisesPayload(exercisesData);

        // Create parent routine first, then attach routine exercises and sets.
        const routine = new this.Routine({ ...routineData, userId });
        await routine.save();

        await this.validateExerciseIds(exercisesData);

        const routineExerciseDocs = this.buildRoutineExerciseDocs(routine._id, exercisesData);

        // Bulk insert routine-exercise links for better write performance.
        const routineExercises = await this.RoutineExercise.insertMany(routineExerciseDocs);

        const routineExerciseSetDocs = this.buildRoutineExerciseSetDocs(exercisesData, routineExercises);

        if (routineExerciseSetDocs.length > 0) {
            await this.RoutineExerciseSet.insertMany(routineExerciseSetDocs);
        }

        return this.formatCreateRoutineResponse(routine, exercisesData);
    }
}