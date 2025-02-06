const searchQuery = require('../queries/searchQueries');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/responseHandler');

const getAllGrants = async (req, res) => {
    try {
        // sample query
        const results = pool.query('SELECT * FROM ResearchGrant');
        res.status(200).json(results);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

module.exports = { getAllGrants };
