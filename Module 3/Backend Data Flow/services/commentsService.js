const postsRepo = require('../repositories/postsRepo');
const commentsRepo = require('../repositories/commentsRepo');
const AppError = require('../utils/AppError');

exports.addComment = async (postId, userId, body) => {
  // --- CHECKS FIRST ---
  const post = await postsRepo.findById(postId);
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  if (post.locked) {
    throw new AppError('Post is locked for new comments', 409);
  }

  // --- WRITES LAST ---
  const comment = await commentsRepo.insert({
    postId,
    authorId: userId,
    body,
  });

  await postsRepo.incrementCommentCount(postId);

  return comment;
};