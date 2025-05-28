import express from 'express';
import { getTags, createTag, updateTag, deleteTag } from '../controllers/tagController.js';

const router = express.Router();

router.get('/', getTags as any);
router.post('/', createTag as any);
router.put('/:id', updateTag as any);
router.delete('/:id', deleteTag as any);

export default router;
