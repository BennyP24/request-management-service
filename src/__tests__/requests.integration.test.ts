import request from 'supertest';
import { app } from '../index';
import { clearStore } from '../storage/requestStore';
import { requesterToken, approverToken, expiredToken, tokenFor } from './helpers';

beforeEach(() => {
  clearStore();
});

async function createReq(application = 'MyApp') {
  return request(app)
    .post('/requests')
    .set('Authorization', `Bearer ${requesterToken}`)
    .send({ application });
}

describe('GET /health', () => {
  describe('when the health endpoint is called', () => {
    it('then it returns 200 with status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });
});

describe('unknown routes', () => {
  describe('when an unregistered path is requested', () => {
    it('then it returns 404 with an error', async () => {
      const res = await request(app).get('/this-does-not-exist');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });
});

describe('POST /auth/login', () => {
  describe('given valid credentials for a requester', () => {
    it('then it returns a token and user with role requester', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ username: 'requester1', password: 'pass123' });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toMatchObject({ username: 'requester1', role: 'requester' });
    });
  });

  describe('given valid credentials for an approver', () => {
    it('then it returns a token and user with role approver', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ username: 'approver1', password: 'pass123' });
      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({ username: 'approver1', role: 'approver' });
    });
  });

  describe('given an incorrect password', () => {
    it('then it returns 401', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ username: 'requester1', password: 'wrong' });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });
  });

  describe('given a non-existent username', () => {
    it('then it returns 401 with the same message to avoid enumeration', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ username: 'nobody', password: 'pass123' });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });
  });

  describe('given missing fields', () => {
    it('then it returns 400', async () => {
      const res = await request(app).post('/auth/login').send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });
});

describe('Authentication & Authorization', () => {
  describe('when no token is provided', () => {
    it('then it returns 401 on protected routes', async () => {
      const res = await request(app).get('/requests');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Authentication required');
    });
  });

  describe('when an expired token is provided', () => {
    it('then it returns 401 with token expired message', async () => {
      const res = await request(app)
        .get('/requests')
        .set('Authorization', `Bearer ${expiredToken()}`);
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Token expired');
    });
  });

  describe('when an invalid token is provided', () => {
    it('then it returns 401', async () => {
      const res = await request(app)
        .get('/requests')
        .set('Authorization', 'Bearer bad.token.here');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid token');
    });
  });

  describe('when a malformed Authorization header is provided', () => {
    it('then it returns 401 with invalid token format', async () => {
      const res = await request(app)
        .get('/requests')
        .set('Authorization', 'NotBearer token');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid token format');
    });
  });

  describe('when a requester tries to access approver-only routes', () => {
    it('then it returns 403 on POST /requests/:id/approve', async () => {
      const res = await request(app)
        .post('/requests/some-id/approve')
        .set('Authorization', `Bearer ${requesterToken}`);
      expect(res.status).toBe(403);
    });

    it('then it returns 403 on POST /requests/:id/deny', async () => {
      const res = await request(app)
        .post('/requests/some-id/deny')
        .set('Authorization', `Bearer ${requesterToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('when an approver tries to create a request', () => {
    it('then it returns 403', async () => {
      const res = await request(app)
        .post('/requests')
        .set('Authorization', `Bearer ${approverToken}`)
        .send({ application: 'MyApp' });
      expect(res.status).toBe(403);
    });
  });
});

describe('POST /requests', () => {
  describe('given a valid body and requester token', () => {
    it('then it returns 201 with requesterId and createdBy set from the token', async () => {
      const res = await createReq('Payroll');
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        application: 'Payroll',
        requesterId: '1',
        createdBy: 'requester1',
        status: 'pending',
        decisionBy: null,
        decisionAt: null,
      });
      expect(res.body.id).toBeDefined();
      expect(res.body.createdAt).toBeDefined();
    });
  });

  describe('given application has surrounding whitespace', () => {
    it('then it trims the field before persisting', async () => {
      const res = await request(app)
        .post('/requests')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({ application: '  Portal  ' });
      expect(res.status).toBe(201);
      expect(res.body.application).toBe('Portal');
    });
  });

  describe('given application is missing', () => {
    it('then it returns 400', async () => {
      const res = await request(app)
        .post('/requests')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('given application is an empty string', () => {
    it('then it returns 400', async () => {
      const res = await request(app)
        .post('/requests')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({ application: '   ' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });
});

describe('GET /requests', () => {
  describe('given no requests exist', () => {
    it('then it returns an empty array', async () => {
      const res = await request(app)
        .get('/requests')
        .set('Authorization', `Bearer ${approverToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('given two requests have been created', () => {
    it('then it returns both requests', async () => {
      await createReq('AppA');
      await createReq('AppB');
      const res = await request(app)
        .get('/requests')
        .set('Authorization', `Bearer ${approverToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });

  describe('given filtering by status', () => {
    it('then it returns only matching requests', async () => {
      const created = (await createReq('AppA')).body;
      await createReq('AppB');
      await request(app)
        .post(`/requests/${created.id}/approve`)
        .set('Authorization', `Bearer ${approverToken}`);

      const res = await request(app)
        .get('/requests?status=pending')
        .set('Authorization', `Bearer ${approverToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].application).toBe('AppB');
    });
  });

  describe('given filtering by createdBy', () => {
    it('then it returns only matching requests', async () => {
      await createReq('AppA');
      const res = await request(app)
        .get('/requests?createdBy=requester1')
        .set('Authorization', `Bearer ${approverToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].createdBy).toBe('requester1');
    });
  });

  describe('given a requester fetches their own requests', () => {
    it('then it returns only their requests, ignoring createdBy query param', async () => {
      await createReq('AppA');
      const requester2Token = tokenFor('requester', 'requester2');
      await request(app)
        .post('/requests')
        .set('Authorization', `Bearer ${requester2Token}`)
        .send({ application: 'AppB' });

      const res = await request(app)
        .get('/requests')
        .set('Authorization', `Bearer ${requesterToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].createdBy).toBe('requester1');
      expect(res.body[0].application).toBe('AppA');
    });
  });

  describe('given a requester tries to override createdBy filter', () => {
    it('then it still returns only their own requests', async () => {
      await createReq('AppA');
      const res = await request(app)
        .get('/requests?createdBy=requester2')
        .set('Authorization', `Bearer ${requesterToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].createdBy).toBe('requester1');
    });
  });
});

describe('POST /requests/:id/approve', () => {
  describe('given a pending request', () => {
    it('then it returns the updated record with decisionBy from token', async () => {
      const created = (await createReq()).body;
      const res = await request(app)
        .post(`/requests/${created.id}/approve`)
        .set('Authorization', `Bearer ${approverToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: created.id, status: 'approved', decisionBy: 'approver1' });
      expect(res.body.decisionAt).toBeDefined();
    });
  });

  describe('given no request exists for the id', () => {
    it('then it returns 404', async () => {
      const res = await request(app)
        .post('/requests/non-existent-id/approve')
        .set('Authorization', `Bearer ${approverToken}`);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('given a request that is already approved', () => {
    it('then it returns 400', async () => {
      const created = (await createReq()).body;
      await request(app)
        .post(`/requests/${created.id}/approve`)
        .set('Authorization', `Bearer ${approverToken}`);
      const res = await request(app)
        .post(`/requests/${created.id}/approve`)
        .set('Authorization', `Bearer ${approverToken}`);
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/already approved/i);
    });
  });

  describe('given a request that is already denied', () => {
    it('then it returns 400', async () => {
      const created = (await createReq()).body;
      await request(app)
        .post(`/requests/${created.id}/deny`)
        .set('Authorization', `Bearer ${approverToken}`);
      const res = await request(app)
        .post(`/requests/${created.id}/approve`)
        .set('Authorization', `Bearer ${approverToken}`);
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/already denied/i);
    });
  });
});

describe('POST /requests/:id/deny', () => {
  describe('given a pending request', () => {
    it('then it returns the updated record with decisionBy from token', async () => {
      const created = (await createReq()).body;
      const res = await request(app)
        .post(`/requests/${created.id}/deny`)
        .set('Authorization', `Bearer ${approverToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: created.id, status: 'denied', decisionBy: 'approver1' });
      expect(res.body.decisionAt).toBeDefined();
    });
  });

  describe('given no request exists for the id', () => {
    it('then it returns 404', async () => {
      const res = await request(app)
        .post('/requests/non-existent-id/deny')
        .set('Authorization', `Bearer ${approverToken}`);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('given a request that is already denied', () => {
    it('then it returns 400', async () => {
      const created = (await createReq()).body;
      await request(app)
        .post(`/requests/${created.id}/deny`)
        .set('Authorization', `Bearer ${approverToken}`);
      const res = await request(app)
        .post(`/requests/${created.id}/deny`)
        .set('Authorization', `Bearer ${approverToken}`);
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/already denied/i);
    });
  });

  describe('given a request that is already approved', () => {
    it('then it returns 400', async () => {
      const created = (await createReq()).body;
      await request(app)
        .post(`/requests/${created.id}/approve`)
        .set('Authorization', `Bearer ${approverToken}`);
      const res = await request(app)
        .post(`/requests/${created.id}/deny`)
        .set('Authorization', `Bearer ${approverToken}`);
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/already approved/i);
    });
  });
});
