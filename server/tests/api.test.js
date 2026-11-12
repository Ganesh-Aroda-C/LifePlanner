const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../app');
const User = require('../models/User');
const Task = require('../models/Task');
const Reminder = require('../models/Reminder');

let mongoServer;

test.before(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

test.after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test.beforeEach(async () => {
  await User.deleteMany({});
  await Task.deleteMany({});
  await Reminder.deleteMany({});
});

test('API Health Check - returns 200 and healthy status', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'healthy');
  assert.equal(res.body.service, 'LifeOS API');
});

test('Auth Workflow - Register, Login, and Profile', async () => {
  // 1. Register
  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
    });

  assert.equal(registerRes.status, 201);
  assert.equal(registerRes.body.success, true);
  assert.ok(registerRes.body.token);
  assert.equal(registerRes.body.user.name, 'Jane Doe');
  assert.equal(registerRes.body.user.email, 'jane@example.com');

  const token = registerRes.body.token;

  // 2. Reject duplicate registration
  const duplicateRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Jane Duplicate',
      email: 'jane@example.com',
      password: 'password123',
    });
  assert.equal(duplicateRes.status, 400);

  // 3. Login
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'jane@example.com',
      password: 'password123',
    });
  assert.equal(loginRes.status, 200);
  assert.ok(loginRes.body.token);

  // 4. Invalid Login
  const badLoginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'jane@example.com',
      password: 'wrongpassword',
    });
  assert.equal(badLoginRes.status, 401);

  // 5. Get current user profile
  const meRes = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(meRes.status, 200);
  assert.equal(meRes.body.user.email, 'jane@example.com');

  // 6. Access denied without token
  const deniedRes = await request(app).get('/api/auth/me');
  assert.equal(deniedRes.status, 401);
});

test('Task CRUD & User Data Isolation', async () => {
  // Register User A
  const userARes = await request(app).post('/api/auth/register').send({
    name: 'User A',
    email: 'user_a@example.com',
    password: 'password123',
  });
  const tokenA = userARes.body.token;

  // Register User B
  const userBRes = await request(app).post('/api/auth/register').send({
    name: 'User B',
    email: 'user_b@example.com',
    password: 'password123',
  });
  const tokenB = userBRes.body.token;

  // User A creates a task
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const createTaskRes = await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${tokenA}`)
    .send({
      title: 'Complete Project Architecture',
      description: 'Finish system flow and database design',
      category: 'Work',
      priority: 'Critical',
      deadline: tomorrow,
      estimatedDuration: 90,
      isMandatory: true,
      reminderPreference: {
        enabled: true,
        remindBeforeMinutes: 30,
      },
    });

  assert.equal(createTaskRes.status, 201);
  assert.equal(createTaskRes.body.success, true);
  const taskId = createTaskRes.body.task._id;
  assert.ok(taskId);

  // Auto-reminder created for User A
  const remindersRes = await request(app)
    .get('/api/reminders')
    .set('Authorization', `Bearer ${tokenA}`);
  assert.equal(remindersRes.body.reminders.length, 1);
  assert.equal(remindersRes.body.reminders[0].taskId._id, taskId);

  // User B tries to get User A's task -> should be 404
  const getForbiddenRes = await request(app)
    .get(`/api/tasks/${taskId}`)
    .set('Authorization', `Bearer ${tokenB}`);
  assert.equal(getForbiddenRes.status, 404);

  // User B lists tasks -> should be empty
  const listBRes = await request(app)
    .get('/api/tasks')
    .set('Authorization', `Bearer ${tokenB}`);
  assert.equal(listBRes.body.tasks.length, 0);

  // User A updates task
  const updateRes = await request(app)
    .put(`/api/tasks/${taskId}`)
    .set('Authorization', `Bearer ${tokenA}`)
    .send({
      title: 'Complete Project Architecture - Revised',
      status: 'In Progress',
    });
  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.body.task.title, 'Complete Project Architecture - Revised');
  assert.equal(updateRes.body.task.status, 'In Progress');

  // User A toggles completion
  const toggleRes = await request(app)
    .patch(`/api/tasks/${taskId}/complete`)
    .set('Authorization', `Bearer ${tokenA}`);
  assert.equal(toggleRes.status, 200);
  assert.equal(toggleRes.body.task.status, 'Completed');

  // User B attempts to delete User A's task -> should be 404
  const deleteForbiddenRes = await request(app)
    .delete(`/api/tasks/${taskId}`)
    .set('Authorization', `Bearer ${tokenB}`);
  assert.equal(deleteForbiddenRes.status, 404);

  // User A deletes task
  const deleteRes = await request(app)
    .delete(`/api/tasks/${taskId}`)
    .set('Authorization', `Bearer ${tokenA}`);
  assert.equal(deleteRes.status, 200);

  // Task and linked reminders are gone
  const afterDeleteReminders = await request(app)
    .get('/api/reminders')
    .set('Authorization', `Bearer ${tokenA}`);
  assert.equal(afterDeleteReminders.body.reminders.length, 0);
});

test('Dashboard Statistics accurately calculate MongoDB data', async () => {
  const userRes = await request(app).post('/api/auth/register').send({
    name: 'Stat Tester',
    email: 'stats@example.com',
    password: 'password123',
  });
  const token = userRes.body.token;

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const future = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  // Create 1 overdue pending task
  await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Overdue Task',
      deadline: yesterday,
      status: 'Pending',
      priority: 'High',
    });

  // Create 1 critical in-progress task
  await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Critical Mission',
      deadline: future,
      status: 'In Progress',
      priority: 'Critical',
    });

  // Create 1 completed task
  await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Done item',
      status: 'Completed',
      priority: 'Low',
    });

  const statsRes = await request(app)
    .get('/api/dashboard/stats')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(statsRes.status, 200);
  const s = statsRes.body.stats;
  assert.equal(s.totalTasks, 3);
  assert.equal(s.completedTasks, 1);
  assert.equal(s.pendingTasks, 1);
  assert.equal(s.inProgressTasks, 1);
  assert.equal(s.overdueTasks, 1);
  assert.equal(s.criticalTasks, 1);
  assert.equal(s.completionRate, 33);
});
