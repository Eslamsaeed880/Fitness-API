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

            // Pre-generate IDs for workout exercises and sets
            workoutExerciseDocs = exercises.map((ex, index) => ({
                _id: new mongoose.Types.ObjectId(),
                exerciseData: ex,
                index
            }));

            // Build all documents at once
            workoutExerciseDocs = workoutExerciseDocs.map((exDoc) => ({
                _id: exDoc._id,
                workoutId,
                exerciseId: exDoc.exerciseData.exerciseId,
                mode: exDoc.exerciseData.mode,
                orderIndex: exDoc.index
            }));

            // Pre-build set documents referencing the pre-generated exercise IDs
            setDocs = [];
            exercises.forEach((ex, index) => {
                const sets = Array.isArray(ex.sets) ? ex.sets : [];
                sets.forEach((set, setIndex) => {
                    setDocs.push({
                        workoutExerciseId: workoutExerciseDocs[index]._id,
                        ...set,
                        orderIndex: setIndex
                    });
                });
            });

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
                exercises: workoutExerciseDocs,
                sets: setDocs
            };

        } catch (error) {
            if (useTransaction && session.inTransaction()) {
                await session.abortTransaction();
            } else if (workoutId) {
                // Cleanup on error for non-transaction mode
                await Promise.allSettled([
                    this.workoutExerciseModel.deleteMany({ workoutId }),
                    this.setModel.deleteMany({ workoutExerciseId: { $in: workoutExerciseDocs.map(doc => doc._id) } }),
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

    async getWorkoutById(workoutId) {

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