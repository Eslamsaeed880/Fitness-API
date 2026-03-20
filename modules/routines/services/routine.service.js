import APIError from "../../../utils/APIError.js";
import mongoose from "mongoose";
import redis from "../../../infrastructure/cache/redis.js";
import LikedRoutine from "../models/likedRoutine.model.js";
import CommentedRoutine from "../models/commentedRoutine.model.js";

export default class RoutineService {
    constructor(RoutineModel, routineExerciseModel, routineExerciseSetModel, exerciseService, userService) {
        this.Routine = RoutineModel;
        this.RoutineExercise = routineExerciseModel;
        this.RoutineExerciseSet = routineExerciseSetModel;
        this.exerciseService = exerciseService;
        this.userService = userService;
    }

    async validateExerciseIds(exercisesData) {
        if (!Array.isArray(exercisesData) || !exercisesData.length) {
            throw new APIError(400, 'exercises must be a non-empty array');
        }

        const rawExerciseIds = exercisesData.map((exercise, index) => {
            if (!exercise?.exerciseId) {
                throw new APIError(400, `exerciseId is required for exercise at index ${index}`);
            }

            return exercise.exerciseId.toString();
        });

        const invalidIds = rawExerciseIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
        if (invalidIds.length) {
            throw new APIError(400, `Invalid exerciseId(s): ${invalidIds.join(', ')}`);
        }

        const uniqueExerciseIds = [...new Set(rawExerciseIds)].map(id => new mongoose.Types.ObjectId(id));
        const existingExercises = await this.exerciseService.Exercise.find({ _id: { $in: uniqueExerciseIds } })
            .select('_id')
            .lean();

        const existingIds = new Set(existingExercises.map(exercise => exercise._id.toString()));
        const missingIds = [...new Set(rawExerciseIds)].filter(id => !existingIds.has(id));

        if (missingIds.length) {
            throw new APIError(404, `Exercise(s) not found: ${missingIds.join(', ')}`);
        }
    }

    async getAllRoutines(page = 1, limit = 10, filter = {}, sortBy = 'createdAt', sortOrder = 'desc', searchQuery = '', primaryMuscle, equipment, movementType) {
        const skip = (page - 1) * limit;
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const baseMatch = Object.keys(filter).length ? { ...filter, isPublic: true } : { isPublic: true };

        if (searchQuery) {
            baseMatch.$or = [
                { name: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } }
            ];
        }

        const filterStages = [
            { $match: baseMatch },
            {
                $lookup: {
                    from: 'routineexercises',
                    localField: '_id',
                    foreignField: 'routineId',
                    as: 'exercises'
                }
            },
            {
                $lookup: {
                    from: 'exercises',
                    localField: 'exercises.exerciseId',
                    foreignField: '_id',
                    as: 'exerciseDetails'
                }
            }
        ];

        if (primaryMuscle) {
            filterStages.push({ $match: { 'exerciseDetails.primaryMuscle': primaryMuscle } });
        }

        if (equipment) {
            filterStages.push({ $match: { 'exerciseDetails.equipments': equipment } });
        }

        if (movementType) {
            filterStages.push({ $match: { 'exerciseDetails.movementType': movementType } });
        }

        const routines = await this.Routine.aggregate([
            ...filterStages,
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: {
                    path: '$user',
                    preserveNullAndEmptyArrays: true
                }
            },
            { $sort: sortOptions },
            { $skip: skip },
            { $limit: limit },
        ]);

        const [{ totalRoutines = 0 } = {}] = await this.Routine.aggregate([
            ...filterStages,
            { $count: 'totalRoutines' }
        ]);
        const totalPages = Math.ceil(totalRoutines / limit);

        return {
            routines: routines.map(routine => ({
                _id: routine._id,
                userId: routine.userId,
                username: routine.user?.username || null,
                name: routine.name,
                description: routine.description,
                isPublic: routine.isPublic
            })),
            pages: totalPages,
            currentPage: page,
            totalRoutines
        };
    }

    async createRoutine(userId, routineData, exercisesData) {
        const [session] = await Promise.all([
            mongoose.startSession(),
            this.validateExerciseIds(exercisesData)
        ]);

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
            likes: routine.likes || 0,
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

    async updateRoutineExercises(routineId, userId, exercisesData) {
        const [routine] = await Promise.all([
            this.Routine.findById(routineId),
            this.validateExerciseIds(exercisesData)
        ]);
        
        if (!routine) {
            throw new APIError(404, 'Routine not found');
        }

        if (routine.userId.toString() !== userId.toString()) {
            throw new APIError(403, 'Access denied');
        }

        const existingExercises = await this.RoutineExercise.find({ routineId }).select('setsId');
        const existingSetIds = existingExercises
            .map(exercise => exercise.setsId)
            .filter(Boolean);

        // For simplicity, delete existing exercises and sets, then re-create
        await Promise.all([
            this.RoutineExercise.deleteMany({ routineId }),
            this.RoutineExerciseSet.deleteMany({ _id: { $in: existingSetIds } })
        ]);

        // Re-create exercises and sets
        const routineExerciseSetDocs = exercisesData.map((exerciseData) => {
            const _id = new mongoose.Types.ObjectId();

            return {
                _id,
                sets: Array.isArray(exerciseData.sets) ? exerciseData.sets : []
            };
        });

        const routineExerciseDocs = exercisesData.map((exerciseData, index) => ({
            routineId,
            exerciseId: exerciseData.exerciseId,
            orderIndex: index,
            setsId: routineExerciseSetDocs[index]._id
        }));

        await Promise.all([
            this.RoutineExerciseSet.insertMany(routineExerciseSetDocs),
            this.RoutineExercise.insertMany(routineExerciseDocs)
        ]);

        return await this.getRoutineById(routineId, userId);
    }

    async deleteRoutine(routineId, userId) {
        const [routine, exercises] = await Promise.all([
            this.Routine.findById(routineId),
            this.RoutineExercise.find({ routineId }).select('setsId')
        ]);

        if (!routine) {
            throw new APIError(404, 'Routine not found');
        }

        if (routine.userId.toString() !== userId.toString()) {
            throw new APIError(403, 'Access denied');
        }

        const setIds = exercises
            .map(exercise => exercise.setsId)
            .filter(Boolean);

        await Promise.all([
            this.RoutineExercise.deleteMany({ routineId }),
            this.RoutineExerciseSet.deleteMany({ _id: { $in: setIds } }),
            routine.deleteOne(),
            LikedRoutine.deleteMany({ routineId }), 
            CommentedRoutine.deleteMany({ routineId })
        ]);

        return {};
    }

    async likeRoutine(routineId, userId) {
        const routine = await this.Routine.findById(routineId).select('_id likes');

        if (!routine) {
            throw new APIError(404, 'Routine not found');
        }

        await redis.del(`routines:liked:user:${userId.toString()}`); // Invalidate user's liked routines cache

        const existingLike = await LikedRoutine.findOne({ userId, routineId }).select('_id');
        if (existingLike) {
            throw new APIError(400, 'You have already liked this routine');
        }

        await Promise.all([
            LikedRoutine.create({ userId, routineId }),
            this.Routine.updateOne({ _id: routineId }, { $inc: { likes: 1 } })
        ]);

        const updatedRoutine = await this.Routine.findById(routineId).select('likes');

        return {
            routineId,
            likeCount: updatedRoutine?.likes || 0,
            liked: true
        };
    }

    async unlikeRoutine(routineId, userId) {
        const routine = await this.Routine.findById(routineId).select('_id likes');

        if (!routine) {
            throw new APIError(404, 'Routine not found');
        }

        await redis.del(`routines:liked:user:${userId.toString()}`); // Invalidate user's liked routines cache

        const deleteResult = await LikedRoutine.deleteOne({ userId, routineId });
        if (!deleteResult.deletedCount) {
            throw new APIError(400, 'You have not liked this routine');
        }

        await this.Routine.updateOne({ _id: routineId, likes: { $gt: 0 } }, { $inc: { likes: -1 } });
        const updatedRoutine = await this.Routine.findById(routineId).select('likes');

        return {
            routineId,
            likeCount: updatedRoutine?.likes || 0,
            liked: false
        };
    }

    async getLikedRoutinesByUser(userId) {
        const userIdString = userId.toString();
        
        const cachedKey = `routines:liked:user:${userIdString}`;
        const doesExistInCache = await redis.exists(cachedKey);

        if (doesExistInCache) {
            const cachedData = await redis.get(cachedKey);
            console.log(` --- Get Liked Routines: Cache hit for user ${userIdString}`);
            return JSON.parse(cachedData);
        }

        console.log(` --- Get Liked Routines: Cache miss for user ${userIdString}, querying database`);
        const likedRoutines = await LikedRoutine.find({ userId }).select('routineId -_id');
        const routineIds = likedRoutines.map(doc => doc.routineId);

        const routines = await this.Routine.find({ _id: { $in: routineIds } }).select('name description');

        await redis.set(cachedKey, JSON.stringify(routines), 'EX', 60 * 5); // cache for 5 minutes

        return routines;
    }

    async createComment(routineId, userId, comment) {
        const [routine, user] = await Promise.all([
            this.Routine.findById(routineId).select('_id'),
            this.userService.getUserById(userId)
        ]);

        if (!routine) {
            throw new APIError(404, 'Routine not found');
        }

        if (!user) {
            throw new APIError(404, 'User not found');
        }

        const [newComment, ] = await Promise.all([
            CommentedRoutine.create({ routineId, userId, comment }),
            this.Routine.updateOne({ _id: routineId }, { $inc: { comments: 1 } })
        ]);

        return newComment;
    }

    async deleteComment(routineId, commentId, userId) {
        const [comment, user] = await Promise.all([
            CommentedRoutine.findById(commentId).where({ routineId, userId }).select('userId routineId'),
            this.userService.getUserById(userId)
        ]);

        if (!comment) {
            throw new APIError(404, 'Comment not found');
        }

        if (!user) {
            throw new APIError(404, 'User not found');
        }

        await Promise.all([
            comment.deleteOne(),
            this.Routine.updateOne({ _id: comment.routineId }, { $inc: { comments: -1 } })
        ]);

        return {};
    }

    async getCommentsByRoutineId(routineId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const comments = await CommentedRoutine.find({ routineId })
            .populate({ path: 'userId', select: 'username' })
            .select('comment createdAt updatedAt userId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalComments = await CommentedRoutine.countDocuments({ routineId });
        const totalPages = Math.ceil(totalComments / limit);

        return {
            comments: comments.map(c => ({
                _id: c._id,
                userId: c.userId._id,
                username: c.userId.username,
                comment: c.comment,
                createdAt: c.createdAt,
                updatedAt: c.updatedAt
            })),
            pages: totalPages,
            currentPage: page,
            totalComments
        };
    }
}