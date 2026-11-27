const request = require('supertest');
const app = require('../app');
const pool = require('../db');

app.set('io', { emit: jest.fn(), to: jest.fn(() => ({ emit: jest.fn() })) });
afterAll(() => pool.end());
beforeAll(async () => {
    const { rows } = await pool.query('SELECT current_database() AS db');
    if (rows[0].db !== 'jobs_test_db') throw new Error('Incorrect Database!');
});
beforeEach(() => pool.query('TRUNCATE applications, jobs, users RESTART IDENTITY CASCADE'));

async function loginAs(email) {
    const body = { email, password: '123456' };
    await request(app).post('/api/v1/auth/register').send(body);
    const res = await request(app).post('/api/v1/auth/login').send(body);
    return res.body.data.token;
}
const auth = (token) => ({ Authorization: `Bearer ${token}` });

test('GET /api/v1/jobs return 200', async () => {
    const res = await request(app).get('/api/v1/jobs');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
});

test('POST /jobs No Token return 401', async () => {
    const res = await request(app).post('/api/v1/jobs').send({ title: 'Dev' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Not logged in');
});

test('POST /jobs With Token return 201', async () => {
    const token = await loginAs('chauchau@test.com');
    const res = await request(app).post('/api/v1/jobs').set(auth(token))
        .send({ title: 'Frontend Dev', company: 'ABC', salary: 1000 });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Frontend Dev');
});

test('Title Empty return 400', async () => {
    const token = await loginAs('chauchau@test.com');
    const res = await request(app).post('/api/v1/jobs').set(auth(token)).send({ title: ' ' });
    expect(res.status).toBe(400);
});
test('user B user A job return 403', async () => { 
    const tokenA = await loginAs('a@test.com');
    const tokenB = await loginAs('b@test.com');
    const job = await request(app).post('/api/v1/jobs')
    .set(auth(tokenA)).send({ title: 'Job A' });
    const res = await request(app).put(`/api/v1/jobs/${job.body.data.id}`)
    .set(auth(tokenB)).send({ title: 'Hack' });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('No access to this job');
});

test('Apply twice return 409', async () => {
    const tokenA = await loginAs('a@test.com');
    const tokenB = await loginAs('b@test.com');
    const job = await request(app).post('/api/v1/jobs')
    .set(auth(tokenA)).send({ title: 'Job A' });
    const url = `/api/v1/jobs/${job.body.data.id}/apply`;
const first = await request(app).post(url).set(auth(tokenB));
const second = await request(app).post(url).set(auth(tokenB));

    expect(first.status).toBe(201);
    expect(second.status).toBe(409);
});