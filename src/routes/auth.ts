import { Router, Request, Response } from 'express';
import { validateLoginBody } from '../middleware';
import * as authService from '../services/authService';

const router = Router();

router.post('/login', validateLoginBody, (req: Request, res: Response) => {
  const { username, password } = req.body;
  const result = authService.login(username, password);
  res.json(result);
});

export default router;
