import { Router, Request, Response } from 'express';
import * as requestService from '../services/requestService';
import * as aiService from '../services/aiService';
import { validateAnalyzeBody } from '../middleware';
import { AppError } from '../middleware';
import { AccessRequest } from '../models';

const router = Router();

router.get('/summary', (_req: Request, res: Response) => {
  const pending = requestService.getPendingRequests();
  const result = aiService.summarize(pending);
  res.json(result);
});

router.post('/analyze', validateAnalyzeBody, (req: Request, res: Response) => {
  let targetRequest = req.body.request;
  if (req.body.requestId) {
    const found = requestService.findById(req.body.requestId);
    if (!found) {
      throw new AppError(404, `Request with id "${req.body.requestId}" not found`);
    }
    targetRequest = found;
  }
  if (!targetRequest?.application || !targetRequest?.createdBy) {
    throw new AppError(400, 'Request object must have "application" and "createdBy" when using "request" field');
  }
  const result = aiService.analyze(targetRequest as AccessRequest);
  res.json(result);
});

export default router;
