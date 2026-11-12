const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../app');
const User = require('../models/User');
const Reminder = require('../models/Reminder');
const { processDueReminders } = require('../services/reminderEngine');

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
  await Reminder.deleteMany({});
});

test('Reminder Engine - Process due reminders and records delivery history', async () => {
  // Create user
  const user = await User.create({
    name: 'Engine Tester',
    email: 'engine@example.com',
    passwordHash: 'hashed_pw_dummy',
  });

  // Create a reminder in the past (due now)
  const pastDate = new Date(Date.now() - 60000);
  const reminder = await Reminder.create({
    userId: user._id,
    title: 'Time to drink water and take medicine',
    remindAt: pastDate,
    status: 'scheduled',
    type: 'browser',
  });

  // Run reminder engine processing
  await processDueReminders();

  // Reload reminder
  const reloaded = await Reminder.findById(reminder._id);
  assert.equal(reloaded.status, 'triggered');
  assert.equal(reloaded.deliveryHistory.length, 1);
  assert.equal(reloaded.deliveryHistory[0].status, 'delivered');
  assert.equal(reloaded.deliveryHistory[0].channel, 'browser');

  // Running it again should not create duplicate delivery entries
  await processDueReminders();
  const reloadedSecond = await Reminder.findById(reminder._id);
  assert.equal(reloadedSecond.deliveryHistory.length, 1);
});

test('Reminder API - Snooze and Acknowledge', async () => {
  const registerRes = await request(app).post('/api/auth/register').send({
    name: 'Snoozer',
    email: 'snoozer@example.com',
    password: 'password123',
  });
  const token = registerRes.body.token;

  // Create a reminder
  const createRes = await request(app)
    .post('/api/reminders')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Review Quarterly Budget',
      remindAt: new Date(Date.now() + 3600000).toISOString(),
      repeatInterval: 'none',
      notes: 'Check spreadsheet columns A-F',
    });

  assert.equal(createRes.status, 201);
  const reminderId = createRes.body.reminder._id;

  // Snooze for 30 minutes
  const snoozeRes = await request(app)
    .patch(`/api/reminders/${reminderId}/snooze`)
    .set('Authorization', `Bearer ${token}`)
    .send({ minutes: 30 });

  assert.equal(snoozeRes.status, 200);
  assert.equal(snoozeRes.body.reminder.status, 'snoozed');
  assert.ok(snoozeRes.body.reminder.snoozedUntil);

  // Acknowledge reminder
  const ackRes = await request(app)
    .patch(`/api/reminders/${reminderId}/acknowledge`)
    .set('Authorization', `Bearer ${token}`);

  assert.equal(ackRes.status, 200);
  assert.equal(ackRes.body.reminder.status, 'acknowledged');
  assert.ok(ackRes.body.reminder.acknowledgedAt);
});
