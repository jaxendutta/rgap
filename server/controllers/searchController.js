const pool = require('../config/db');

const getAllGrants = async (req, res) => {
    try {
        // Debugging
        console.log('Received request:', {
            method: req.method,
        });
        console.log('req.body:', req.body);
        console.log('req.query:', req.query);
        console.log('req.params:', req.params);

        // sample query
        const [results] = await pool.query(
            `SELECT 
                grant_id AS id, 
                ref_number, 
                ResearchGrant.recipient_id AS recipient,             
                owner_org AS institute, 
                agreement_title_en AS 'grant', -- Escaping the alias to avoid conflict
                agreement_value AS value,  
                agreement_start_date AS startDate, 
                agreement_end_date AS endDate, 
                prog_id AS agency,
                city,
                province
            FROM ResearchGrant 
            LEFT JOIN Recipient ON ResearchGrant.recipient_id = Recipient.recipient_id;` )
        res.status(200).json(results);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

async function searchGrants(req, res) {
    const { searchTerms = {}, filters = {}, sortConfig = {} } = req.body;

    try {
        console.log('Received search request:', req.body);
        const { searchTerms = {}, filters = {}, sortConfig = {} } = req.body;
        const connection = await pool.getConnection();

        let query = `
            SELECT 
                rg.grant_id,
                rg.ref_number,
                r.legal_name,
                r.research_organization_name,
                rg.agreement_title_en,
                rg.agreement_value,
                rg.agreement_start_date,
                rg.agreement_end_date,
                r.city,
                r.province,
                o.abbreviation AS org
            FROM ResearchGrant rg
            JOIN Recipient r ON rg.recipient_id = r.recipient_id
            NATURAL JOIN Organization o
            WHERE 1=1
        `;
        const params = [];

        // Log the SQL query being generated
        console.log('SQL Query:', query);
        console.log('SQL Parameters:', params);

        // matching keywords
        if (searchTerms.recipient) {
            query += ` AND r.legal_name LIKE ?`;
            params.push(`%${searchTerms.recipient}%`);
        }
        if (searchTerms.institute) {
            query += ` AND r.research_organization_name LIKE ?`;
            params.push(`%${searchTerms.institute}%`);
        }
        if (searchTerms.grant) {
            query += ` AND rg.agreement_title_en LIKE ?`;
            params.push(`%${searchTerms.grant}%`);
        }

        console.log(filters.year, filters.ownerOrg, filters.minValue, filters.maxValue, filters.country, filters.province, filters.city)
        
        // filter conditions
        if (filters.year) {
            query += ` AND YEAR(rg.agreement_start_date) = ?`;
            params.push(filters.year);
        }
        if (filters.agency) {
            query += ` AND o.abbreviation = ?`;
            params.push(filters.agency);
        }
        if (filters.minvalue && filters.maxvalue) {
            query += ` AND rg.agreement_value BETWEEN ? AND ?`;
            params.push(filters.minvalue, filters.maxvalue);
        }
        if (filters.minValue && !filters.maxValue) {
            query += ` AND rg.agreement_value >= ?`;
            params.push(filters.minValue);
        }
        if (!filters.minValue && filters.maxValue) {
            query += ` AND rg.agreement_value <= ?`;
            params.push(filters.maxValue);
        }
        if (filters.country) {
            query += ` AND r.country = ?`;
            params.push(convertCountryNameToCode(filters.country));
        }
        if (filters.province) {
            query += ` AND r.province = ?`;
            params.push(convertProvinceNameToCode(filters.province));
        }
        if (filters.city) {
            query += ` AND r.city = ?`;
            params.push(filters.city);
        }

        console.log("order here", sortConfig)
        // sort
        if (sortConfig.field) {
            console.log("i am here")
            const validSortFields = ["value", "startDate"];
            if (validSortFields.includes(sortConfig.field)) {
                query += ` ORDER BY ${sortConfig.field} ${sortConfig.direction === "asc" ? "ASC" : "DESC"}`;
            }
        }

        // log final query
        console.log("\nFinal Query:", query);
        console.log("\nParameters:", params);

        // execute query
        const [results] = await connection.execute(query, params);
        connection.release();
        
        console.log('Sending response:', results);
        return res.json({ message: "Success", data: results });

    } catch (err) {
        console.error("Search error:", err);
        res.status(500).json({ error: err.message });
    }
}

function convertCountryNameToCode(countryName) {
    const countryCodes = {
        "Canada": "CA",
        "United States": "US",
        "United Kingdom": "UK",
        "Australia": "AU",
        "Germany": "DE",
        "France": "FR",
        "China": "CN",
        "Japan": "JP",
        "South Korea": "KR",
        "India": "IN"
    };
    return countryCodes[countryName] || countryName;
}


function convertProvinceNameToCode(provinceName) {
    const provinceCodes = {
        "Ontario": "ON",
        "Quebec": "QC",
        "British Columbia": "BC",
        "Alberta": "AB",
        "Manitoba": "MB",
        "Saskatchewan": "SK",
        "New Brunswick": "NB",
        "New Foundland and Labrador": "NL",
        "Nova Scotia": "NS",
        "Prince Edward Island": "PE",
        "Northwest Territories": "NT",
        "Nunavut": "NU",
        "Yukon": "YT"
    };
    return provinceCodes[provinceName] || provinceName;
}



const searchRecipient = async (req, res) => {
    try {
        // sample query
        const [results] = await pool.query(
            `` )
        res.status(200).json(results);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const searchInstitue = async (req, res) => {
    try {
        // sample query
        const [results] = await pool.query(
            `` )
        res.status(200).json(results);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const searchCombine = async (req, res) => {
    try {
        // sample query
        const [results] = await pool.query(
            `` )
        res.status(200).json(results);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

module.exports = { getAllGrants,searchGrants };
