const bcrypt = require("bcrypt");

/**
 * Generates a salt for a hash
 * 
 * @param {string} s - salt input
 * 
 * @returns {string} - salt output
 */
const genSalt = async s => {
    return await bcrypt.genSalt(s).catch(err => { throw err; });
};

/**
 * Hashes a string
 * 
 * @param {string} h - to hash
 * @param {string} s - salt
 * 
 * @returns {string} - hashed string
 */
const genHash = async (h, s) => {
    return await bcrypt.hash(h, s).catch(err => { throw err; });
};

/**
 * Validate a hash
 * 
 * @param {string} t - text to check
 * @param {string} h - original hash
 * 
 * @returns {boolean} - does the text match the hash
 */
const checkHash = async (t, h) => {
    return await bcrypt.compare(t, h).catch(err => { throw err; });
};

module.exports = {
    genSalt : genSalt,
    genHash : genHash,
    checkHash : checkHash
};
 
