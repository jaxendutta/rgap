// server/controllers/instituteController.js
import supabase from "../config/db.js";

// Get all institutes with pagination
export const getAllInstitutes = async (req, res) => {
    try {
        const { page = 1, pageSize = 20 } = req.query;
        const userId = req.user?.id;

        // Call the get_all_institutes function
        const { data, error } = await supabase.rpc("get_all_institutes", {
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
                isBookmarked: item.is_bookmarked,
            })),
        });
    } catch (error) {
        console.error("Get all institutes error:", error);
        res.status(500).json({
            message: "Failed to get institutes",
            error: error.message,
        });
    }
};

// Get institute details
export const getInstituteDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        // Call the institute_details function
        const { data, error } = await supabase.rpc("institute_details", {
            p_institute_id: parseInt(id),
            p_user_id: userId,
        });

        if (error) throw error;

        // Process results - note that this function returns multiple result sets
        // We need to determine which records belong to which set based on structure

        // Group 1: Institute info
        const instituteData = data.filter(
            (row) => row.institute_id && row.name
        )[0];

        // Group 2: Recipients
        const recipients = data.filter(
            (row) => row.recipient_id && row.legal_name
        );

        // Group 3: Grants
        const grants = data.filter((row) => row.grant_id && row.ref_number);

        // Group 4: Funding history
        const fundingHistory = data.filter((row) => row.year && row.agency);

        // Format the response
        res.json({
            institute: instituteData
                ? {
                      id: instituteData.institute_id,
                      name: instituteData.name,
                      country: instituteData.country,
                      province: instituteData.province,
                      city: instituteData.city,
                      postalCode: instituteData.postal_code,
                      ridingNameEn: instituteData.riding_name_en,
                      ridingNumber: instituteData.riding_number,
                      totalRecipients: instituteData.total_recipients,
                      totalGrants: instituteData.total_grants,
                      totalFunding: instituteData.total_funding,
                      avgFunding: instituteData.avg_funding,
                      firstGrantDate: instituteData.first_grant_date,
                      latestGrantDate: instituteData.latest_grant_date,
                      fundingAgenciesCount:
                          instituteData.funding_agencies_count,
                      isBookmarked: instituteData.is_bookmarked,
                  }
                : null,
            recipients: recipients.map((r) => ({
                id: r.recipient_id,
                legalName: r.legal_name,
                type: r.type,
                grantsCount: r.grants_count,
                totalFunding: r.total_funding,
                firstGrantDate: r.first_grant_date,
                latestGrantDate: r.latest_grant_date,
                isBookmarked: r.is_bookmarked,
            })),
            grants: grants.map((g) => ({
                id: g.grant_id,
                refNumber: g.ref_number,
                agreementValue: g.agreement_value,
                agreementStartDate: g.agreement_start_date,
                agreementEndDate: g.agreement_end_date,
                agreementTitleEn: g.agreement_title_en,
                recipientName: g.recipient_name,
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
                recipientCount: f.recipient_count,
            })),
        });
    } catch (error) {
        console.error("Institute details error:", error);
        res.status(500).json({
            message: "Failed to get institute details",
            error: error.message,
        });
    }
};

// Search institutes
export const searchInstitutes = async (req, res) => {
    try {
        const { term, page = 1, pageSize = 20, logSearch = true } = req.query;
        const userId = req.user?.id;

        // Call the search_institutes function
        const { data, error } = await supabase.rpc("search_institutes", {
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
            institutes: data.map((item) => ({
                id: item.institute_id,
                name: item.name,
                country: item.country,
                province: item.province,
                city: item.city,
                recipientsCount: item.recipients_count,
                grantCount: item.grant_count,
                totalFunding: item.total_funding,
                latestGrantDate: item.latest_grant_date,
                isBookmarked: item.is_bookmarked,
            })),
        });
    } catch (error) {
        console.error("Institute search error:", error);
        res.status(500).json({
            message: "Failed to search institutes",
            error: error.message,
        });
    }
};

// Get institute recipients
export const getInstituteRecipients = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, pageSize = 20 } = req.query;
        const userId = req.user?.id;

        // Call the institute_recipients function
        const { data, error } = await supabase.rpc("institute_recipients", {
            p_institute_id: parseInt(id),
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
                grantCount: item.grant_count,
                totalFunding: item.total_funding,
                firstGrantDate: item.first_grant_date,
                latestGrantDate: item.latest_grant_date,
                isBookmarked: item.is_bookmarked,
            })),
        });
    } catch (error) {
        console.error("Institute recipients error:", error);
        res.status(500).json({
            message: "Failed to get institute recipients",
            error: error.message,
        });
    }
};
