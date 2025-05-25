import express from 'express';
import { getTodos, createTodo, updateTodo, toggleTodo, deleteTodo } from '../controllers/todoController.js';

const router = express.Router();

router.get('/', getTodos as any);
router.post('/', createTodo as any);
router.put('/:id', updateTodo as any);
router.patch('/:id/toggle', toggleTodo as any);
router.delete('/:id', deleteTodo as any);

export default router;