import APIError from "../../../utils/APIError.js";

export default class PersonalRecordService {
    constructor(PersonalRecordModel) {
        this.PersonalRecordModel = PersonalRecordModel;
    }

    async addPersonalRecord(userId, exercises) {
        try {
            /* 
                exercises: [
                    {
                        exerciseId: 'exerciseId1',
                        weightKg: 100,
                        reps: 5,
                        volume: 500
                    },
                    ...
                ]
            */

            if (!Array.isArray(exercises) || exercises.length === 0) {
                return { success: true, modifiedCount: 0 };
            }

            const operations = exercises.map(ex => ({
                updateOne: {
                    filter: { userId, exerciseId: ex.exerciseId },
                    update: { 
                        $max: { weightKg: ex.weightKg, reps: ex.reps, volume: ex.volume } 
                    },
                    upsert: true
                }
            }));

            await this.PersonalRecordModel.bulkWrite(operations);
            return { success: true };
            

        } catch (err) {
            console.error('Error in addPersonalRecord:', err);
            throw new APIError(500, 'Failed to add personal records');
        }
    }

    async getPersonalRecordsForUser(userId) {
        try {
            return await this.PersonalRecordModel.find({ userId })
                .populate('exerciseId', 'name description') 
                .sort({ createdAt: -1 })
                .lean();

        } catch (err) {
            console.error('Error in getPersonalRecordsForUser:', err);
            throw new APIError(500, 'Failed to fetch personal records');
        }
    }

    async getPersonalrecordForExercise(userId, exerciseId) {
        try {
            return await this.PersonalRecordModel.findOne({ userId, exerciseId })
                .populate('exerciseId', 'name description')
                .lean();

        } catch (err) {
            console.error('Error in getPersonalrecordForExercise:', err);
            throw new APIError(500, 'Failed to fetch personal record for exercise');
        }
    }

    async deletePersonalRecord(userId, personalRecordId) {
        try {
            const result = await this.PersonalRecordModel.deleteOne({ userId, _id: personalRecordId });
            return { success: result.deletedCount > 0 };
        } catch (err) {
            console.error('Error in deletePersonalRecord:', err);
            throw new APIError(500, 'Failed to delete personal record');
        }
    }

    async updatePersonalRecord(userId, personalRecordId, updates) {
        try {
            const pr = await this.PersonalRecordModel.findOne({ userId, _id: personalRecordId });
            if (!pr) {
                throw new APIError(404, 'Personal record not found');
            }

            pr.weightKg = updates.weightKg !== undefined ? updates.weightKg : pr.weightKg;
            pr.reps = updates.reps !== undefined ? updates.reps : pr.reps;
            pr.volume = updates.volume !== undefined ? updates.volume : pr.volume;

            await pr.save();
        } catch (err) {
            console.error('Error in updatePersonalRecord:', err);
            if (err instanceof APIError) {
                throw err;
            }
            throw new APIError(500, 'Failed to update personal record');
        }
    }

}