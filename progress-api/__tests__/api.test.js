const request = require('supertest');
const createApp = require('../app');
const path = require('path');
const fs = require('fs');

describe('Progress API', () => {
  let app;
  const testDbPath = ':memory:';

  beforeEach(() => {
    app = createApp(testDbPath);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });

  describe('POST /api/progress', () => {
    it('should save progress for a new item', async () => {
      const res = await request(app)
        .post('/api/progress')
        .send({
          planName: 'python',
          itemText: 'w0r0',
          completed: true
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.id).toBeDefined();
    });

    it('should return 400 when planName is missing', async () => {
      const res = await request(app)
        .post('/api/progress')
        .send({
          itemText: 'w0r0',
          completed: true
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('planName and itemText are required');
    });

    it('should return 400 when itemText is missing', async () => {
      const res = await request(app)
        .post('/api/progress')
        .send({
          planName: 'python',
          completed: true
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('planName and itemText are required');
    });

    it('should update existing item on duplicate', async () => {
      await request(app)
        .post('/api/progress')
        .send({
          planName: 'python',
          itemText: 'w0r0',
          completed: true
        });

      const res = await request(app)
        .post('/api/progress')
        .send({
          planName: 'python',
          itemText: 'w0r0',
          completed: false
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/progress/:planName', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/progress')
        .send({ planName: 'python', itemText: 'w0r0', completed: true });

      await request(app)
        .post('/api/progress')
        .send({ planName: 'python', itemText: 'w0r1', completed: false });

      await request(app)
        .post('/api/progress')
        .send({ planName: 'rust', itemText: 'w0r0', completed: true });
    });

    it('should return all progress for a specific plan', async () => {
      const res = await request(app).get('/api/progress/python');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].item_text).toBe('w0r0');
      expect(res.body[0].completed).toBe(1);
      expect(res.body[1].item_text).toBe('w0r1');
      expect(res.body[1].completed).toBe(0);
    });

    it('should not return progress from other plans', async () => {
      const res = await request(app).get('/api/progress/python');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body.every(item => item.item_text !== 'rust-item')).toBe(true);
    });

    it('should return empty array for plan with no progress', async () => {
      const res = await request(app).get('/api/progress/nonexistent');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('Progress toggling', () => {
    it('should toggle completion status', async () => {
      await request(app)
        .post('/api/progress')
        .send({ planName: 'python', itemText: 'w0r0', completed: true });

      let res = await request(app).get('/api/progress/python');
      expect(res.body[0].completed).toBe(1);
      expect(res.body[0].completed_at).toBeTruthy();

      await request(app)
        .post('/api/progress')
        .send({ planName: 'python', itemText: 'w0r0', completed: false });

      res = await request(app).get('/api/progress/python');
      expect(res.body[0].completed).toBe(0);
      expect(res.body[0].completed_at).toBeNull();
    });
  });

  describe('Multiple plans isolation', () => {
    it('should keep different plans separate', async () => {
      await request(app)
        .post('/api/progress')
        .send({ planName: 'python', itemText: 'task1', completed: true });

      await request(app)
        .post('/api/progress')
        .send({ planName: 'rust', itemText: 'task1', completed: false });

      const pythonRes = await request(app).get('/api/progress/python');
      const rustRes = await request(app).get('/api/progress/rust');

      expect(pythonRes.body[0].completed).toBe(1);
      expect(rustRes.body[0].completed).toBe(0);
    });
  });

  describe('Progress percentage tracking', () => {
    it('should save and retrieve progress percentage', async () => {
      await request(app)
        .post('/api/progress')
        .send({
          planName: 'books',
          itemText: 'python-backend',
          completed: false,
          progressPercentage: 45.5
        });

      const res = await request(app).get('/api/progress/books');

      expect(res.status).toBe(200);
      expect(res.body[0].progress_percentage).toBe(45.5);
      expect(res.body[0].completed).toBe(0);
    });

    it('should mark book as completed when progress >= 95%', async () => {
      await request(app)
        .post('/api/progress')
        .send({
          planName: 'books',
          itemText: 'python-backend',
          completed: true,
          progressPercentage: 97
        });

      const res = await request(app).get('/api/progress/books');

      expect(res.body[0].progress_percentage).toBe(97);
      expect(res.body[0].completed).toBe(1);
      expect(res.body[0].completed_at).toBeTruthy();
    });

    it('should save CFI for EPUB position', async () => {
      const cfi = 'epubcfi(/6/4[chap01ref]!/4/2/2[p0001]/1:0)';

      await request(app)
        .post('/api/progress')
        .send({
          planName: 'books',
          itemText: 'python-backend',
          completed: false,
          progressPercentage: 23,
          cfi
        });

      const res = await request(app).get('/api/progress/books');

      expect(res.body[0].cfi).toBe(cfi);
      expect(res.body[0].progress_percentage).toBe(23);
    });
  });
});
