const pool = require("../config/db");

/*
 * Save a specific grant to a specif user's bookmarks
 */
const saveGrant = async (req, res) => {
    try {
        const { grant_id } = req.params;
        const { user_id } = req.body;

        const ifSaved = await pool.query(`SELECT * FROM BookmarkedGrants WHERE grant_id = ${grant_id} AND user_id = ${user_id};`);        
        if (ifSaved[0].length){
            console.log("Bookmark has already existed.");
            return res.status(204).json({ message: `Bookmark has already existed.` });
        }

        const save = await pool.query(
            `INSERT INTO BookmarkedGrants (user_id, grant_id) VALUES(${user_id}, ${grant_id});`
        );
        console.log("Grant's bookmark is added.");
        res.status(201).json(save[0]); 

    } catch (error) {
        res.status(409).json({ message: error.message });
    }        
};

/*
 * Delete a specific grant bookmark
 */
const deleteSavedGrant = async (req, res) => {
    try {
        const { grant_id } = req.params;
        const { user_id } = req.body;

        const ifSaved = await pool.query(`SELECT * FROM BookmarkedGrants WHERE grant_id = ${grant_id} AND user_id = ${user_id};`);        
        if (!ifSaved[0].length){
            console.log("Bookmark doesn't existed.");
            return res.status(409).json("Bookmark does not exist.");
        }
        const deleted = await pool.query(
            `DELETE FROM BookmarkedGrants WHERE grant_id = ${grant_id} AND user_id = ${user_id};`);
        
        console.log("Grant's bookmark is deleted.");
        return res.status(200).json(deleted[0]); 

    } catch (error) {
        return res.status(409).json({ message: error.message });
    }        
};

/*
 * Get all saved grant bookmark ids
 */
const getSavedGrantIds = async (req, res) => {
    
    try {
        const { user_id } = req.params;
        //const { user_id } = req.body;

        const ifUserExist = await pool.query(`SELECT * FROM User WHERE user_id = ${user_id};`);        
        if (!ifUserExist[0].length){
            return res.status(409).json({message:`User does not exist`});
        }

        const results = await pool.query(
            `SELECT grant_id
            FROM BookmarkedGrants
            WHERE user_id = ${user_id};`
        );

        res.status(200).json(results[0]); 

    } catch (error) {
        res.status(409).json({ message: error.message });
    }      
};

/*
 * Get all saved grant information (incomplete)
 */
const getSavedGrant = async (req, res) => {
    
    try {
        const { user_id } = req.params;
        //const { user_id } = req.body;

        const ifUserExist = await pool.query(`SELECT * FROM User WHERE user_id = ${user_id};`);        
        if (!ifUserExist[0].length){
            return res.status(409).json({message:`User does not exist`});
        }

        const results = await pool.query(
            `SELECT ResearchGrant.grant_id
            FROM BookmarkedGrants 
            LEFT OUTER JOIN ResearchGrant ON ResearchGrant.grant_id = BookmarkedGrants.grant_id
            WHERE user_id = ${user_id};`
        );

        res.status(200).json(results[0]); 

    } catch (error) {
        res.status(409).json({ message: error.message });
    }      
};

/*
 * Save a specific recipient to a specif user's bookmarks
 */
const saveRecipient = async (req, res) => {
    try {
        const { recipient_id } = req.params;
        const { user_id } = req.body;

        const ifSaved = await pool.query(`SELECT * FROM BookmarkedRecipients WHERE recipient_id = ${recipient_id} AND user_id = ${user_id};`);        
        if (ifSaved[0].length){
            console.log("Bookmark has already existed.");
            return res.status(204).json({ message: `Bookmark has already existed.` });
        }

        const save = await pool.query(
            `INSERT INTO BookmarkedRecipients (user_id, recipient_id) VALUES(${user_id}, ${recipient_id});`
        );
        console.log("Recipient's bookmark is added.");
        res.status(201).json(save[0]); 

    } catch (error) {
        res.status(409).json({ message: error.message });
    }        
};

/*
 * Delete a specific recipient bookmark
 */
const deleteSavedRecipient = async (req, res) => {
    try {
        const { recipient_id } = req.params;
        const { user_id } = req.body;

        const ifSaved = await pool.query(`SELECT * FROM BookmarkedRecipients WHERE recipient_id = ${recipient_id} AND user_id = ${user_id};`);        
        if (!ifSaved[0].length){
            console.log("Bookmark doesn't existed.");
            return res.status(409).json("Bookmark does not exist.");
        }
        const deleted = await pool.query(
            `DELETE FROM BookmarkedRecipients WHERE recipient_id = ${recipient_id} AND user_id = ${user_id};`);
        
        console.log("Recipient's bookmark is deleted.");
        return res.status(200).json(deleted[0]); 

    } catch (error) {
        return res.status(409).json({ message: error.message });
    }        
};


/*
 * Get all saved recipient information (incomplete)
 */
const getSavedRecipient = async (req, res) => {
    
    try {
        const { user_id } = req.params;
        //const { user_id } = req.body;

        const ifUserExist = await pool.query(`SELECT * FROM User WHERE user_id = ${user_id};`);        
        if (!ifUserExist[0].length){
            return res.status(409).json({message:`User does not exist`});
        }

        const results = await pool.query(
            `SELECT Recipient.recipient_id
            FROM BookmarkedRecipients 
            LEFT OUTER JOIN Recipient ON Recipient.recipient_id = BookmarkedRecipients.recipient_id
            WHERE user_id = ${user_id};`
        );

        res.status(200).json(results[0]); 

    } catch (error) {
        res.status(409).json({ message: error.message });
    }      
};


/*
 * Get all saved recipient bookmark ids
 */
const getSavedRecipientIds = async (req, res) => {
    
    try {
        const { user_id } = req.params;
        //const { user_id } = req.body;

        const ifUserExist = await pool.query(`SELECT * FROM User WHERE user_id = ${user_id};`);        
        if (!ifUserExist[0].length){
            return res.status(409).json({message:`User does not exist`});
        }

        const results = await pool.query(
            `SELECT recipient_id
            FROM BookmarkedRecipients 
            WHERE user_id = ${user_id};`
        );

        res.status(200).json(results[0]); 

    } catch (error) {
        res.status(409).json({ message: error.message });
    }      
};


/*
 * Save a specific institute to a specif user's bookmarks
 */
const saveInstitute = async (req, res) => {
    try {
        const { institute_id } = req.params;
        const { user_id } = req.body;

        const ifSaved = await pool.query(`SELECT * FROM BookmarkedInstitutes WHERE institute_id = ${institute_id} AND user_id = ${user_id};`);        
        if (ifSaved[0].length){
            console.log("Bookmark has already existed.");
            return res.status(204).json({ message: `Bookmark has already existed.` });
        }

        const save = await pool.query(
            `INSERT INTO BookmarkedInstitutes (user_id, institute_id) VALUES(${user_id}, ${institute_id});`
        );
        console.log("Institute's bookmark is added.");
        res.status(201).json(save[0]); 

    } catch (error) {
        res.status(409).json({ message: error.message });
    }        
};

/*
 * Delete a specific institute bookmark
 */
const deleteSavedInstitute = async (req, res) => {
    try {
        const { institute_id } = req.params;
        const { user_id } = req.body;

        const ifSaved = await pool.query(`SELECT * FROM BookmarkedInstitutes WHERE institute_id = ${institute_id} AND user_id = ${user_id};`);        
        if (!ifSaved[0].length){
            console.log("Bookmark doesn't existed.");
            return res.status(409).json("Bookmark does not exist.");
        }
        const deleted = await pool.query(
            `DELETE FROM BookmarkedInstitutes WHERE institute_id = ${institute_id} AND user_id = ${user_id};`);
        
        console.log("Institute's bookmark is deleted.");
        return res.status(200).json(deleted[0]); 

    } catch (error) {
        return res.status(409).json({ message: error.message });
    }        
};


/*
 * Get all saved institutes information (incomplete)
 */
const getSavedInstitute = async (req, res) => {
    
    try {
        const { user_id } = req.params;
        //const { user_id } = req.body;

        const ifUserExist = await pool.query(`SELECT * FROM User WHERE user_id = ${user_id};`);        
        if (!ifUserExist[0].length){
            return res.status(409).json({message:`User does not exist`});
        }

        const results = await pool.query(
            `SELECT Institute.institute_id
            FROM BookmarkedInstitutes 
            LEFT OUTER JOIN Institute ON Institute.institute_id = BookmarkedInstitutes.institute_id
            WHERE user_id = ${user_id};`
        );

        res.status(200).json(results[0]); 

    } catch (error) {
        res.status(409).json({ message: error.message });
    }      
};


/*
 * Get all saved institute bookmark ids
 */
const getSavedInstituteIds = async (req, res) => {
    
    try {
        const { user_id } = req.params;
        //const { user_id } = req.body;

        const ifUserExist = await pool.query(`SELECT * FROM User WHERE user_id = ${user_id};`);        
        if (!ifUserExist[0].length){
            return res.status(409).json({message:`User does not exist`});
        }

        const results = await pool.query(
            `SELECT institute_id
            FROM BookmarkedInstitutes 
            WHERE user_id = ${user_id};`
        );

        res.status(200).json(results[0]); 

    } catch (error) {
        res.status(409).json({ message: error.message });
    }      
};


module.exports = {saveGrant, deleteSavedGrant, getSavedGrant, getSavedGrantIds, 
                    saveRecipient, deleteSavedRecipient, getSavedRecipient, getSavedRecipientIds,
                    saveInstitute, deleteSavedInstitute, getSavedInstitute, getSavedInstituteIds};