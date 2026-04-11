import APIError from "../../../utils/APIError.js";
import mongoose from "mongoose";

export default class WorkoutService {
    constructor(workoutModel, workoutExerciseModel, setModel, routineService, userService, exerciseService) {
        this.workoutModel = workoutModel;
        this.workoutExerciseModel = workoutExerciseModel;
        this.setModel = setModel;
        this.routineService = routineService;
        this.userService = userService;
        this.exerciseService = exerciseService;
    }

    supportsTransactions() {
        const topologyType = mongoose.connection.client?.topology?.description?.type;

        return topologyType === 'ReplicaSetWithPrimary' || topologyType === 'Sharded';
    }

    async createWorkout(userId, description, routineId, exercises) {
        // Validate user and exercises in parallel
        await Promise.all([
            this.validateUser(userId),
            this.validateExercises(exercises)
        ]);

        const session = await mongoose.startSession();
        const useTransaction = this.supportsTransactions();
        let workoutId = null;
        let workoutExerciseDocs = [];
        let setDocs = [];
        let setIdsByExerciseIndex = [];

        try {
            if (useTransaction) {
                session.startTransaction();
            }

            // Create workout
            const workout = await this.workoutModel.create([{
                userId,
                description,
                routineId: routineId || null
            }], useTransaction ? { session } : undefined);

            workoutId = workout[0]._id;

            // Pre-generate IDs for sets first
            setIdsByExerciseIndex = exercises.map(() => new mongoose.Types.ObjectId());

            // Pre-build set documents
            setDocs = exercises.map((ex, index) => ({
                _id: setIdsByExerciseIndex[index],
                sets: Array.isArray(ex.sets) ? ex.sets : []
            }));

            // Build workout exercises with setsId references
            workoutExerciseDocs = exercises.map((ex, index) => ({
                workoutId,
                exerciseId: ex.exerciseId,
                mode: ex.mode,
                orderIndex: index,
                setsId: setIdsByExerciseIndex[index]
            }));

            // Insert all in parallel
            if (useTransaction) {
                await Promise.all([
                    this.workoutExerciseModel.insertMany(workoutExerciseDocs, { session }),
                    setDocs.length > 0 ? this.setModel.insertMany(setDocs, { session }) : Promise.resolve()
                ]);

                await session.commitTransaction();
            } else {
                await Promise.all([
                    this.workoutExerciseModel.insertMany(workoutExerciseDocs),
                    setDocs.length > 0 ? this.setModel.insertMany(setDocs) : Promise.resolve()
                ]);
            }

            return {
                _id: workoutId,
                userId,
                description,
                routineId: routineId || null,
                exercises: workoutExerciseDocs.map((ex, index) => ({
                    _id: ex._id,
                    exerciseId: ex.exerciseId,
                    mode: ex.mode,
                    orderIndex: ex.orderIndex,
                    setsId: ex.setsId,
                    sets: exercises[index].sets
                }))
            };

        } catch (error) {
            if (useTransaction && session.inTransaction()) {
                await session.abortTransaction();
            } else if (workoutId) {
                // Cleanup on error for non-transaction mode
                await Promise.allSettled([
                    this.workoutExerciseModel.deleteMany({ workoutId }),
                    this.setModel.deleteMany({ _id: { $in: setIdsByExerciseIndex } }),
                    this.workoutModel.deleteOne({ _id: workoutId })
                ]);
            }

            throw error;
        } finally {
            session.endSession();
        }
    }

    async validateExercises(exercises) {
        if (!Array.isArray(exercises) || !exercises.length) {
            throw new APIError(400, 'exercises must be a non-empty array');
        }

        const validationPromises = exercises.map((ex) => 
            this.exerciseService.getExerciseById(ex.exerciseId)
        );

        const validatedExercises = await Promise.all(validationPromises);

        validatedExercises.forEach((exercise, index) => {
            if (!exercise) {
                throw new APIError(404, `Exercise with ID ${exercises[index].exerciseId} not found`);
            }
        });
    }

    async validateUser(userId) {
        const user = await this.userService.getUserById(userId);
        if (!user) {
            throw new APIError(404, `User with ID ${userId} not found`);
        }
        return user;
    }

    async getWorkoutById(workoutId, userId) {
        const [workout, exercises] = await Promise.all([
            this.workoutModel.findOne({ _id: workoutId, userId }),
            this.workoutExerciseModel.find({ workoutId })
                .populate(
                    {
                        path: 'exerciseId',
                        select: 'name description primaryMuscle equipments media movementType'
                    }
                )
                .populate(
                    {
                        path: 'setsId',
                        select: 'sets'
                    }
                )
                .select('-__v -createdAt -updatedAt')
                .sort({ orderIndex: 1 })
        ]);

        if(!workout) {
            throw new APIError(404, 'Workout not found');
        }

        return { workout, exercises };
    }
    
    async updateWorkout(workoutId, updateData) {

    }

    async deleteWorkout(workoutId) {

    }

    async addExerciseToWorkout(workoutId, exerciseData) {

    }

    async removeExerciseFromWorkout(workoutId, workoutExerciseId) {

    }

    async updateExerciseInWorkout(workoutId, workoutExerciseId, updateData) {

    }

    async addSetToExercise(workoutId, workoutExerciseId, setData) {

    }

    async updateSetInExercise(workoutId, workoutExerciseId, setId, updateData) {

    }

    async removeSetFromExercise(workoutId, workoutExerciseId, setId) {

    }

    async completeWorkout(workoutId) {

    }

    async getWorkoutSummary(workoutId) {

    }

    async getWorkoutsByUser(userId, filters) {

    }

    async getWorkoutsByRoutine(routineId) {

    }
}