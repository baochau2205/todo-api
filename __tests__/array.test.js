const { updateItem } = require('../utils/array');
test('object', () => {
    const job = { id: 1 }
    expect(job).toEqual({ id: 1 });
});
test('updateItem', () => { 
    const jobs = [{ id: 1, title: "A" }];
    const kq = updateItem(jobs, 1, { title: "B" });
    expect(kq[0].title).toBe('B');
    expect(jobs[0].title).toBe('A');
});
test('updateItem', () => {
    const jobs = [
        { id: 1, title: 'A' },
        { id: 2, title: 'C' },
    ];
    const kq = updateItem(jobs, 1, { title: 'B' });
    expect(kq[0].title).toBe('B');
    expect(kq[1]).toEqual({ id: 2, title: 'C' });
});