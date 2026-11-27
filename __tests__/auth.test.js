process.env.JWT_SECRET = 'test-secret';
const jwt = require('jsonwebtoken');
const { requireAuth } = require('../middleware/auth');

function mockRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

test('Token Missing Return 401', () => {
    const req = { headers: {} };
    const res = mockRes(), next = jest.fn();
    requireAuth(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 401 }));
});

test('Token Correct: Next And Attach req.user', () => {
    const token = jwt.sign({ id: 1 }, 'test-secret');
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes(), next = jest.fn();
    requireAuth(req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.user.id).toBe(1);
});

test('Token Invalid return 401', () => {
    const req = { headers: { authorization: 'Bearer abc' } };
    const res = mockRes(), next = jest.fn();
    requireAuth(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 401 }));
});