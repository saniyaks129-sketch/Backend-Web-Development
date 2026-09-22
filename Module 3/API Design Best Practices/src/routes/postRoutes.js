import express from 'express';
import * as postController from '../controllers/postsController.js'; // Adjust path if controller is named differently

const router = express.Router();

router.get('/posts', postController.getPosts);
router.get('/posts/debug-error', postController.triggerDemoError);
router.get('/posts/:id', postController.getPostById);
router.post('/posts', postController.createPost);
router.post('/posts/:id/likes', postController.likePost);

export default router;