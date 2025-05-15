// server/controllers/instituteController.js
import supabase from "../config/db.js";

// Save grant bookmark
export const saveGrantBookmark = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { grantId } = req.body;

        // Call the save_grant_bookmark function
        const { data, error } = await supabase.rpc("save_grant_bookmark", {
            p_user_id: userId,
            p_grant_id: parseInt(grantId),
        });

        if (error) throw error;

        res.json({ status: data[0].status });
    } catch (error) {
        console.error("Save grant bookmark error:", error);
        res.status(500).json({
            message: "Failed to save bookmark",
            error: error.message,
        });
    }
};

// Delete grant bookmark
export const deleteGrantBookmark = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { grantId } = req.params;

        // Call the delete_grant_bookmark function
        const { data, error } = await supabase.rpc("delete_grant_bookmark", {
            p_user_id: userId,
            p_grant_id: parseInt(grantId),
        });

        if (error) throw error;

        res.json({ status: data[0].status });
    } catch (error) {
        console.error("Delete grant bookmark error:", error);
        res.status(500).json({
            message: "Failed to delete bookmark",
            error: error.message,
        });
    }
};

// Get bookmarked grants
export const getBookmarkedGrants = async (req, res) => {
    try {
        const userId = req.user?.id;

        // Call the get_bookmarked_grants function
        const { data, error } = await supabase.rpc("get_bookmarked_grants", {
            p_user_id: userId,
        });

        if (error) throw error;

        // Format the response
        res.json({
            grants: data.map((item) => ({
                id: item.grant_id,
                refNumber: item.ref_number,
                agreementValue: item.agreement_value,
                agreementStartDate: item.agreement_start_date,
                agreementEndDate: item.agreement_end_date,
                agreementTitleEn: item.agreement_title_en,
                legalName: item.legal_name,
                researchOrganizationName: item.research_organization_name,
                instituteId: item.institute_id,
                city: item.city,
                province: item.province,
                country: item.country,
                org: item.org,
                orgTitle: item.org_title,
                progTitleEn: item.prog_title_en,
                progPurposeEn: item.prog_purpose_en,
            })),
        });
    } catch (error) {
        console.error("Get bookmarked grants error:", error);
        res.status(500).json({
            message: "Failed to get bookmarked grants",
            error: error.message,
        });
    }
};

// Save recipient bookmark
export const saveRecipientBookmark = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { recipientId } = req.body;

        // Call the save_recipient_bookmark function
        const { data, error } = await supabase.rpc("save_recipient_bookmark", {
            p_user_id: userId,
            p_recipient_id: parseInt(recipientId),
        });

        if (error) throw error;

        res.json({ status: data[0].status });
    } catch (error) {
        console.error("Save recipient bookmark error:", error);
        res.status(500).json({
            message: "Failed to save bookmark",
            error: error.message,
        });
    }
};

// Delete recipient bookmark
export const deleteRecipientBookmark = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { recipientId } = req.params;

        // Call the delete_recipient_bookmark function
        const { data, error } = await supabase.rpc(
            "delete_recipient_bookmark",
            {
                p_user_id: userId,
                p_recipient_id: parseInt(recipientId),
            }
        );

        if (error) throw error;

        res.json({ status: data[0].status });
    } catch (error) {
        console.error("Delete recipient bookmark error:", error);
        res.status(500).json({
            message: "Failed to delete bookmark",
            error: error.message,
        });
    }
};

// Get bookmarked recipients
export const getBookmarkedRecipients = async (req, res) => {
    try {
        const userId = req.user?.id;

        // Call the get_bookmarked_recipients_with_stats function
        const { data, error } = await supabase.rpc(
            "get_bookmarked_recipients_with_stats",
            {
                p_user_id: userId,
            }
        );

        if (error) throw error;

        // Format the response
        res.json({
            recipients: data.map((item) => ({
                id: item.recipient_id,
                legalName: item.legal_name,
                type: item.type,
                instituteId: item.institute_id,
                researchOrganizationName: item.research_organization_name,
                city: item.city,
                province: item.province,
                country: item.country,
                grantCount: item.grant_count,
                totalFunding: item.total_funding,
                firstGrantDate: item.first_grant_date,
                latestGrantDate: item.latest_grant_date,
            })),
        });
    } catch (error) {
        console.error("Get bookmarked recipients error:", error);
        res.status(500).json({
            message: "Failed to get bookmarked recipients",
            error: error.message,
        });
    }
};

// Save institute bookmark
export const saveInstituteBookmark = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { instituteId } = req.body;

        // Call the save_institute_bookmark function
        const { data, error } = await supabase.rpc("save_institute_bookmark", {
            p_user_id: userId,
            p_institute_id: parseInt(instituteId),
        });

        if (error) throw error;

        res.json({ status: data[0].status });
    } catch (error) {
        console.error("Save institute bookmark error:", error);
        res.status(500).json({
            message: "Failed to save bookmark",
            error: error.message,
        });
    }
};

// Delete institute bookmark
export const deleteInstituteBookmark = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { instituteId } = req.params;

        // Call the delete_institute_bookmark function
        const { data, error } = await supabase.rpc(
            "delete_institute_bookmark",
            {
                p_user_id: userId,
                p_institute_id: parseInt(instituteId),
            }
        );

        if (error) throw error;

        res.json({ status: data[0].status });
    } catch (error) {
        console.error("Delete institute bookmark error:", error);
        res.status(500).json({
            message: "Failed to delete bookmark",
            error: error.message,
        });
    }
};

// Get bookmarked institutes
export const getBookmarkedInstitutes = async (req, res) => {
    try {
        const userId = req.user?.id;

        // Call the get_bookmarked_institutes_with_stats function
        const { data, error } = await supabase.rpc(
            "get_bookmarked_institutes_with_stats",
            {
                p_user_id: userId,
            }
        );

        if (error) throw error;

        // Format the response
        res.json({
            institutes: data.map((item) => ({
                id: item.institute_id,
                name: item.name,
                country: item.country,
                province: item.province,
                city: item.city,
                postalCode: item.postal_code,
                ridingNameEn: item.riding_name_en,
                ridingNumber: item.riding_number,
                recipientCount: item.recipient_count,
                grantCount: item.grant_count,
                totalFunding: item.total_funding,
                latestGrantDate: item.latest_grant_date,
            })),
        });
    } catch (error) {
        console.error("Get bookmarked institutes error:", error);
        res.status(500).json({
            message: "Failed to get bookmarked institutes",
            error: error.message,
        });
    }
};
