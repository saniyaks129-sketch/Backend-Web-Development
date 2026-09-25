const postsRepo = require('../repositories/postsRepo');
const votesRepo = require('../repositories/votesRepo');
const AppError = require('../utils/AppError');

exports.castVote = async (postId, userId) => {
  // 1. Check if post exists
  const post = await postsRepo.findById(postId);
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  // 2. Check if user already voted
  const existingVote = await votesRepo.find(postId, userId);
  if (existingVote) {
    throw new AppError('You have already voted on this post', 409);
  }

  // 3. Perform write
  return votesRepo.insert(postId, userId);
};