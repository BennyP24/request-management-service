import { Router, Request, Response } from 'express';
import * as requestService from '../services/requestService';
import { validateCreateRequest, validateDecisionBody } from '../middleware';

/** Routes for creating, listing, approving, and denying access requests. */
const router = Router();

router.post('/', validateCreateRequest, (req: Request, res: Response) => {
  const { application, createdBy } = req.body;
  const created = requestService.create({ application, createdBy });
  res.status(201).json(created);
});

router.get('/', (_req: Request, res: Response) => {
  const requests = requestService.findAll();
  res.json(requests);
});

router.post('/:id/approve', validateDecisionBody, (req: Request, res: Response) => {
  const updated = requestService.approve(req.params.id, req.body?.decisionBy);
  res.json(updated);
});

router.post('/:id/deny', validateDecisionBody, (req: Request, res: Response) => {
  const updated = requestService.deny(req.params.id, req.body?.decisionBy);
  res.json(updated);
});

export default router;
