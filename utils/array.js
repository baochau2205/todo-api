function updateItem(items, id, changes) {
    return items.map((item) =>
        item.id === id ? { ...item, ...changes } : item
    );
}
module.exports = { updateItem };