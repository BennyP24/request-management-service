import { Router, Request, Response } from 'express';
import * as requestService from '../services/requestService';
import { authenticate, authorize, validateCreateRequest } from '../middleware';
import { RequestStatus } from '../models';

const router = Router();

router.post('/', authenticate, authorize('requester'), validateCreateRequest, (req: Request, res: Response) => {
  const created = requestService.create({ application: req.body.application }, req.user!.userId, req.user!.username);
  res.status(201).json(created);
});

router.get('/', authenticate, authorize('approver', 'requester'), (req: Request, res: Response) => {
  const filters: requestService.FindAllFilters = {};

  if (req.user!.role === 'requester') {
    filters.createdBy = req.user!.username;
  } else if (typeof req.query.createdBy === 'string') {
    filters.createdBy = req.query.createdBy;
  }

  if (typeof req.query.status === 'string') {
    filters.status = req.query.status as RequestStatus;
  }
  const requests = requestService.findAll(filters);
  res.json(requests);
});

router.post('/:id/approve', authenticate, authorize('approver'), (req: Request, res: Response) => {
  const updated = requestService.approve(req.params.id, req.user!.username);
  res.json(updated);
});

router.post('/:id/deny', authenticate, authorize('approver'), (req: Request, res: Response) => {
  const updated = requestService.deny(req.params.id, req.user!.username);
  res.json(updated);
});

export default router;
