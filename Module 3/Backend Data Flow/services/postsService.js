const postsRepo = require('../repositories/postsRepo');
const AppError = require('../utils/AppError');

const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

exports.editPost = async (postId, userId, changes) => {
  // 1. Fetch
  const post = await postsRepo.findById(postId);

  // 2. Guards (in strict order)
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  if (post.authorId !== userId) {
    throw new AppError('You can only edit your own post', 403);
  }

  const ageMs = Date.now() - new Date(post.createdAt).getTime();
  if (ageMs > EDIT_WINDOW_MS) {
    throw new AppError('Post can no longer be edited', 403);
  }

  // 3. Act
  return postsRepo.update(postId, changes);
};