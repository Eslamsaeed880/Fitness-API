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
            throw new APIError(500, 'Failed to add personal records');
        }
    }

}