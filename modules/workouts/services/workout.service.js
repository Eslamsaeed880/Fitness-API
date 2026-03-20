import APIError from "../../../utils/APIError.js";

export default class WorkoutService {
    constructor(workoutModel, workoutExerciseModel, setModel, routineService) {
        this.workoutModel = workoutModel;
        this.workoutExerciseModel = workoutExerciseModel;
        this.setModel = setModel;
        this.routineService = routineService;
    }

    async createWorkout(userId) {

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