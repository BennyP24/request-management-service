import request from 'supertest';
import { app } from '../index';
import { clearStore } from '../storage/requestStore';
import { requesterToken, approverToken } from './helpers';

beforeEach(() => {
  clearStore();
});

async function createReq(application = 'MyApp') {
  const res = await request(app)
    .post('/requests')
    .set('Authorization', `Bearer ${requesterToken}`)
    .send({ application });
  return res.body as { id: string; application: string; createdBy: string; status: string };
}

async function approveReq(id: string) {
  await request(app)
    .post(`/requests/${id}/approve`)
    .set('Authorization', `Bearer ${approverToken}`);
}

describe('AI routes authorization', () => {
  describe('when no token is provided', () => {
    it('then it returns 401', async () => {
      const res = await request(app).get('/ai/summary');
      expect(res.status).toBe(401);
    });
  });

  describe('when a requester token is provided', () => {
    it('then it returns 403', async () => {
      const res = await request(app)
        .get('/ai/summary')
        .set('Authorization', `Bearer ${requesterToken}`);
      expect(res.status).toBe(403);
    });
  });
});

describe('GET /ai/summary', () => {
  describe('given the store is empty', () => {
    it('then it returns zero pending with empty lists', async () => {
      const res = await request(app)
        .get('/ai/summary')
        .set('Authorization', `Bearer ${approverToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        totalPending: 0,
        summary: 'No pending access requests.',
        applications: [],
        createdBy: [],
      });
    });
  });

  describe('given two pending requests', () => {
    it('then it reflects both in the counts', async () => {
      await createReq('AppA');
      await createReq('AppB');
      const res = await request(app)
        .get('/ai/summary')
        .set('Authorization', `Bearer ${approverToken}`);
      expect(res.status).toBe(200);
      expect(res.body.totalPending).toBe(2);
      expect(res.body.applications).toEqual(expect.arrayContaining(['AppA', 'AppB']));
      expect(res.body.summary).toMatch(/2 pending/i);
    });
  });

  describe('given two requests with the same application', () => {
    it('then it deduplicates the application list', async () => {
      await createReq('AppA');
      await createReq('AppA');
      const res = await request(app)
        .get('/ai/summary')
        .set('Authorization', `Bearer ${approverToken}`);
      expect(res.body.totalPending).toBe(2);
      expect(res.body.applications).toEqual(['AppA']);
    });
  });

  describe('given one approved and one pending request', () => {
    it('then it excludes the approved request from the pending count', async () => {
      const r1 = await createReq('AppA');
      await createReq('AppB');
      await approveReq(r1.id);
      const res = await request(app)
        .get('/ai/summary')
        .set('Authorization', `Bearer ${approverToken}`);
      expect(res.body.totalPending).toBe(1);
      expect(res.body.applications).toEqual(['AppB']);
    });
  });

  describe('given a denied request', () => {
    it('then it excludes the denied request from the pending count', async () => {
      const r1 = await createReq('AppA');
      await request(app)
        .post(`/requests/${r1.id}/deny`)
        .set('Authorization', `Bearer ${approverToken}`);
      const res = await request(app)
        .get('/ai/summary')
        .set('Authorization', `Bearer ${approverToken}`);
      expect(res.body.totalPending).toBe(0);
    });
  });
});

describe('POST /ai/analyze', () => {
  describe('given neither requestId nor request is provided', () => {
    it('then it returns 400', async () => {
      const res = await request(app)
        .post('/ai/analyze')
        .set('Authorization', `Bearer ${approverToken}`)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('given requestId is not a string', () => {
    it('then it returns 400', async () => {
      const res = await request(app)
        .post('/ai/analyze')
        .set('Authorization', `Bearer ${approverToken}`)
        .send({ requestId: 123 });
      expect(res.status).toBe(400);
    });
  });

  describe('given an inline request object missing application', () => {
    it('then it returns 400', async () => {
      const res = await request(app)
        .post('/ai/analyze')
        .set('Authorization', `Bearer ${approverToken}`)
        .send({ request: { createdBy: 'alice' } });
      expect(res.status).toBe(400);
    });
  });

  describe('given an inline request object missing createdBy', () => {
    it('then it returns 400', async () => {
      const res = await request(app)
        .post('/ai/analyze')
        .set('Authorization', `Bearer ${approverToken}`)
        .send({ request: { application: 'MyApp' } });
      expect(res.status).toBe(400);
    });
  });

  describe('given an existing request id', () => {
    it('then it returns a risk result', async () => {
      const r = await createReq('MyApp');
      const res = await request(app)
        .post('/ai/analyze')
        .set('Authorization', `Bearer ${approverToken}`)
        .send({ requestId: r.id });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('riskLevel');
      expect(res.body).toHaveProperty('reason');
    });
  });

  describe('given a requestId that does not exist', () => {
    it('then it returns 404', async () => {
      const res = await request(app)
        .post('/ai/analyze')
        .set('Authorization', `Bearer ${approverToken}`)
        .send({ requestId: 'does-not-exist' });
      expect(res.status).toBe(404);
    });
  });

  describe('given a standard application', () => {
    it('then it returns riskLevel "low"', async () => {
      const res = await request(app)
        .post('/ai/analyze')
        .set('Authorization', `Bearer ${approverToken}`)
        .send({ request: { application: 'DocumentPortal', createdBy: 'alice' } });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ riskLevel: 'low', reason: 'Standard access request' });
    });
  });

  describe('given an application containing "internal"', () => {
    it('then it returns riskLevel "medium"', async () => {
      const res = await request(app)
        .post('/ai/analyze')
        .set('Authorization', `Bearer ${approverToken}`)
        .send({ request: { application: 'internal-dashboard', createdBy: 'alice' } });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ riskLevel: 'medium', reason: 'Internal or critical application' });
    });
  });

  describe('given an application containing "admin"', () => {
    it('then it returns riskLevel "high"', async () => {
      const res = await request(app)
        .post('/ai/analyze')
        .set('Authorization', `Bearer ${approverToken}`)
        .send({ request: { application: 'admin-panel', createdBy: 'alice' } });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ riskLevel: 'high', reason: 'Sensitive application or admin requester' });
    });
  });

  describe('given a requester whose name contains "admin"', () => {
    it('then it returns riskLevel "high"', async () => {
      const res = await request(app)
        .post('/ai/analyze')
        .set('Authorization', `Bearer ${approverToken}`)
        .send({ request: { application: 'DocumentPortal', createdBy: 'admin-user' } });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ riskLevel: 'high', reason: 'Sensitive application or admin requester' });
    });
  });
});
