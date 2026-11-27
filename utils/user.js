async function getUserName(id, fetchUser) {
    const user = await fetchUser(id);
    if (!user) throw new Error('User Not Found');
    return user.name;
}
module.exports = { getUserName };