function isValidEmail(email) {
    if (typeof email !== 'string') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateJob(job) {
    if (!job) throw new Error('Missing Job Data');
    const errors = [];
    if (!job.title ?.trim())
        errors.push('Title Is Required');
    if (job.salary < 0 )
        errors.push('Salary Can Not Be Negative');
    return errors;
}

module.exports = { isValidEmail, validateJob };