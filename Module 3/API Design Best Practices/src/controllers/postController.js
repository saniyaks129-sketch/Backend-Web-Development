import { sendSuccess, sendError } from '../utils/response.js';
import * as postService from '../services/postService.js'; // Adjust path if service file is named differently

// GET /posts (List posts with capped pagination)
export async function getPosts(req, res, next) {
  try {
    const rawPage = parseInt(req.query.page, 10) || 1;
    const rawLimit = parseInt(req.query.limit, 10) || 10;

    // Cap limit server-side (max 100)
    const page = Math.max(1, rawPage);
    const limit = Math.min(Math.max(1, rawLimit), 100);

    const { posts, total } = await postService.findPosts({ page, limit });
    const pages = Math.ceil(total / limit) || 1;

    return sendSuccess(res, 200, posts, {
      page,
      limit,
      total,
      pages,
    });
  } catch (err) {
    next(err);
  }
}

// GET /posts/:id (Fetch single post)
export async function getPostById(req, res, next) {
  try {
    const { id } = req.params;
    const post = await postService.findPostById(id);

    if (!post) {
      return sendError(res, 404, 'NOT_FOUND', 'Post not found');
    }

    return sendSuccess(res, 200, post);
  } catch (err) {
    next(err);
  }
}

// POST /posts (Create post)
export async function createPost(req, res, next) {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Title and content are required');
    }

    const newPost = await postService.createPost({ title, content });
    return sendSuccess(res, 201, newPost);
  } catch (err) {
    next(err);
  }
}

// POST /posts/:id/likes (Like post)
export async function likePost(req, res, next) {
  try {
    const { id } = req.params;
    const updatedPost = await postService.likePost(id);

    if (!updatedPost) {
      return sendError(res, 404, 'NOT_FOUND', 'Post not found');
    }

    return sendSuccess(res, 200, updatedPost);
  } catch (err) {
    next(err);
  }
}

// GET /posts/debug-error (Safe internal-failure route)
export async function triggerDemoError(req, res, next) {
  try {
    throw new Error('Database connection failed internally');
  } catch (err) {
    next(err);
  }
}