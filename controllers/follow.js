import Follow from '../models/follow.js';

export const follow = async (req, res) => {
    try {
        const { followingId } = req.body;
        const followerId  = req.user.id;

        const newFollow = new Follow({
            followerId,
            followingId
        });

        await newFollow.save();
        res.status(201).json(newFollow);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const unfollow = async (req, res) => {
    try {
        const followerId = req.user.id;
        const { followingId } = req.body;

        const deletedFollow = await Follow.findOneAndDelete({
            followerId,
            followingId
        });

        if (!deletedFollow) {
            return res.status(404).json({ message: 'Follow relationship not found' });
        }

        res.status(200).json({ message: 'Unfollowed successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getFollowers = async (req, res) => {
    try {
        const userId = req.user.id;

        const followers = await Follow.find({ followingId: userId }).populate('followerId', 'username email');

        res.status(200).json(followers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getFollowing = async (req, res) => {
    try {
        const userId = req.user.id;

        const following = await Follow.find({ followerId: userId }).populate('followingId', 'username email');

        res.status(200).json(following);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
