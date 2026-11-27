const { getUserName } = require('../utils/user');

test('User Name', async () => {
    const name = await getUserName(1, async () => ({ name: 'Bao' }));
    expect(name).toBe('Bao');
});
test('Does Not Have Any User', async () => {
    await expect(getUserName(1, async () => null))
        .rejects.toThrow('User Not Found');
});
test('fetchUser', async () => {
    const fetchUser = jest.fn() 
    .mockResolvedValue({ name: 'Bao' });
    await getUserName(7, fetchUser);
    expect(fetchUser).toHaveBeenCalledTimes(1);
    expect(fetchUser).toHaveBeenCalledWith(7);
});

const fakeFetch = jest.fn()
.mockRejectedValueOnce(new Error('Internet Error'))
.mockRejectedValueOnce(new Error('Internet Error'))
.mockResolvedValue({ ok: true });