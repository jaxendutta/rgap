// server/controllers/instituteController.js
import supabase from "../config/db.js";

// Get all recipients with pagination
export const getAllRecipients = async (req, res) => {
    try {
        const { page = 1, pageSize = 20 } = req.query;
        const userId = req.user?.id;

        // Call the get_all_recipients function
        const { data, error } = await supabase.rpc("get_all_recipients", {
            p_page: parseInt(page),
            p_page_size: parseInt(pageSize),
            p_user_id: userId,
        });

        if (error) throw error;

        // Process results - extract the total count from the first row
        const totalCount = data.length > 0 ? data[0].total_count : 0;

        // Format the response
        res.json({
            totalCount,
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
                latestGrantDate: item.latest_grant_date,
                isBookmarked: item.is_bookmarked,
            })),
        });
    } catch (error) {
        console.error("Get all recipients error:", error);
        res.status(500).json({
            message: "Failed to get recipients",
            error: error.message,
        });
    }
};

// Search recipients
export const searchRecipients = async (req, res) => {
    try {
        const { term, page = 1, pageSize = 20, logSearch = true } = req.query;
        const userId = req.user?.id;

        // Call the search_recipients function
        const { data, error } = await supabase.rpc("search_recipients", {
            p_term: term,
            p_normalized_term: term?.toLowerCase(),
            p_page: parseInt(page),
            p_page_size: parseInt(pageSize),
            p_user_id: userId,
            p_log_search_history: logSearch,
        });

        if (error) throw error;

        // Process results - extract the total count from the first row
        const totalCount = data.length > 0 ? data[0].total_count : 0;

        // Format the response
        res.json({
            totalCount,
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
                latestGrantDate: item.latest_grant_date,
                isBookmarked: item.is_bookmarked,
            })),
        });
    } catch (error) {
        console.error("Recipient search error:", error);
        res.status(500).json({
            message: "Failed to search recipients",
            error: error.message,
        });
    }
};

// Get recipient details
export const getRecipientDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        // Call the recipient_details function
        const { data, error } = await supabase.rpc("recipient_details", {
            p_recipient_id: parseInt(id),
            p_user_id: userId,
        });

        if (error) throw error;

        // Process results - note that this function returns multiple result sets
        // Group 1: Recipient info
        const recipientData = data.filter(
            (row) => row.recipient_id && row.legal_name
        )[0];

        // Group 2: Grants
        const grants = data.filter((row) => row.grant_id && row.ref_number);

        // Group 3: Funding history
        const fundingHistory = data.filter((row) => row.year && row.agency);

        // Format the response
        res.json({
            recipient: recipientData
                ? {
                      id: recipientData.recipient_id,
                      legalName: recipientData.legal_name,
                      type: recipientData.type,
                      instituteId: recipientData.institute_id,
                      researchOrganizationName:
                          recipientData.research_organization_name,
                      city: recipientData.city,
                      province: recipientData.province,
                      country: recipientData.country,
                      postalCode: recipientData.postal_code,
                      totalGrants: recipientData.total_grants,
                      totalFunding: recipientData.total_funding,
                      avgFunding: recipientData.avg_funding,
                      firstGrantDate: recipientData.first_grant_date,
                      latestGrantDate: recipientData.latest_grant_date,
                      fundingAgenciesCount:
                          recipientData.funding_agencies_count,
                      isBookmarked: recipientData.is_bookmarked,
                  }
                : null,
            grants: grants.map((g) => ({
                id: g.grant_id,
                refNumber: g.ref_number,
                agreementValue: g.agreement_value,
                agreementStartDate: g.agreement_start_date,
                agreementEndDate: g.agreement_end_date,
                agreementTitleEn: g.agreement_title_en,
                org: g.org,
                orgTitle: g.org_title,
                progTitleEn: g.prog_title_en,
                isBookmarked: g.is_bookmarked,
            })),
            fundingHistory: fundingHistory.map((f) => ({
                year: f.year,
                agency: f.agency,
                grantCount: f.grant_count,
                totalValue: f.total_value,
                avgValue: f.avg_value,
                programCount: f.program_count,
            })),
        });
    } catch (error) {
        console.error("Recipient details error:", error);
        res.status(500).json({
            message: "Failed to get recipient details",
            error: error.message,
        });
    }
};
