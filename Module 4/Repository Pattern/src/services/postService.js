import * as postRepo from '../repositories/postRepository.js';

export async function getAllPosts() {
  return postRepo.findAll();
}

export async function getPostById(id) {
  const post = postRepo.findById(id);
  if (!post) {
    const error = new Error('Post not found');
    error.status = 404;
    throw error;
  }
  return post;
}

export async function createPost(data) {
  return postRepo.create(data);
}

export async function updatePost(id, patch) {
  const updated = postRepo.update(id, patch);
  if (!updated) {
    const error = new Error('Post not found');
    error.status = 404;
    throw error;
  }
  return updated;
}

export async function deletePost(id) {
  const removed = postRepo.remove(id);
  if (!removed) {
    const error = new Error('Post not found');
    error.status = 404;
    throw error;
  }
  return true;
}