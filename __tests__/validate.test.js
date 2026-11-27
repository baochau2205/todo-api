const { isValidEmail, validateJob } = 
require('../utils/validate');

test('email correct return true', ()  => {
    expect(isValidEmail('a@b.com')).toBe(true);
});
test('missing @ return false', () => {
    expect(isValidEmail('abc.com')).toBe(false);
});

test('correct: no erros', () => {
    const job = { title: 'Dev', salary: 900 };
    expect(validateJob(job)).toEqual([]);
});
test('title missing', () => {
    const err = validateJob({ title: ' ' });
    expect(err).toContain('Title Is Required');
});
test('no job will be error', () => { 
    expect(() => validateJob())
    .toThrow('Missing Job Data');
});
describe('validateJob', () => {
    let job;
    beforeEach(() => {
        job = {title:'Frontend Dev', salary:1500};
    });
    test('Job Allowed', () => {
        expect(validateJob(job)).toEqual([]);
    });
    test('Salary Can Not Be Negative', () => {
        job.salary = -1;
        expect(validateJob(job))
        .toContain('Salary Can Not Be Negative');
    });
});
test('email', () => {
    expect(isValidEmail(undefined)).toBe(false);
    expect(isValidEmail(123)).toBe(false);
});