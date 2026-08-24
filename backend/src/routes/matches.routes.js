import { Router } from 'express';
import { getMatches, postMatches, updateScore} from '../controllers/matches.controller.js';

const router = Router();

router.get('/', getMatches);
router.post('/', postMatches);
router.patch('/:matchId/score', updateScore);
export default router;