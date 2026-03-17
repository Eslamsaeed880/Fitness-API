import APIError from "../../../utils/APIError.js";
import mongoose from "mongoose";

export default class RoutineService {
    constructor(RoutineModel, routineExerciseModel, routineExerciseSetModel, exerciseService) {
        this.Routine = RoutineModel;
        this.RoutineExercise = routineExerciseModel;
        this.RoutineExerciseSet = routineExerciseSetModel;
        this.exerciseService = exerciseService;
    }

    async createRoutine(userId, routineData, exercisesData) {
        const session = await mongoose.startSession();

        try {
            session.startTransaction();

            // Create routine
            const routine = await this.Routine.create([{
                userId,
                name: routineData.name,
                description: routineData.description,
                isPublic: routineData.isPublic
            }], { session });

            const routineId = routine[0]._id;

            // Pre-generate set IDs (IMPORTANT)
            const routineExerciseSetDocs = exercisesData.map((exerciseData) => {
                const _id = new mongoose.Types.ObjectId();

                return {
                    _id,
                    sets: Array.isArray(exerciseData.sets) ? exerciseData.sets : []
                };
            });

            // Build exercises using pre-generated IDs
            const routineExerciseDocs = exercisesData.map((exerciseData, index) => ({
                routineId,
                exerciseId: exerciseData.exerciseId,
                orderIndex: index, // safer than trusting client
                setsId: routineExerciseSetDocs[index]._id
            }));

            // Insert BOTH in parallel
            await Promise.all([
                this.RoutineExerciseSet.insertMany(routineExerciseSetDocs, { session }),
                this.RoutineExercise.insertMany(routineExerciseDocs, { session })
            ]);

            await session.commitTransaction();

            return {
                routineId,
                userId,
                name: routineData.name,
                description: routineData.description,
                isPublic: routineData.isPublic,
                exercises: exercisesData.map((ex, index) => ({
                    exerciseId: ex.exerciseId,
                    orderIndex: index,
                    setsId: routineExerciseSetDocs[index]._id,
                    sets: ex.sets
                }))
            };

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async getRoutineById(routineId, userId) {
        const [routine, exercises] = await Promise.all([
            this.Routine.findById(routineId),
            this.RoutineExercise.find({ routineId })
                .populate({
                    path: 'exerciseId',
                    select: 'name description primaryMuscle equipment media movementType`'
                })
                .populate('setsId')
                .select('-__v -createdAt -updatedAt')
                .sort({ orderIndex: 1 })
        ]);

        if (!routine) {
            throw new APIError(404, 'Routine not found');
        }

        if (!routine.isPublic && routine.userId.toString() !== userId.toString()) {
            throw new APIError(403, 'Access denied');
        }

        const structuredRoutine = {
            _id: routine._id,
            userId: routine.userId,
            name: routine.name,
            description: routine.description,
            exercises   
        };

        return structuredRoutine;
    }

    async updateRoutine(routineId, userId, routineData) {
        const routine = await this.Routine.findById(routineId);
        
        if (!routine) {
            throw new APIError(404, 'Routine not found');
        }

        if (routine.userId.toString() !== userId.toString()) {
            throw new APIError(403, 'Access denied');
        }

        routine.name = routineData.name || routine.name;
        routine.description = routineData.description || routine.description;
        routine.isPublic = routineData.isPublic !== undefined ? routineData.isPublic : routine.isPublic;

        await routine.save();

        return routine;
    }
}