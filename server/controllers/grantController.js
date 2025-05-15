// server/controllers/instituteController.js
import supabase from "../config/db.js";

// Search grants with filters
export const searchGrants = async (req, res) => {
    try {
        const {
            recipient,
            institute,
            grant,
            dateFrom,
            dateTo,
            valueMin,
            valueMax,
            agencies,
            countries,
            provinces,
            cities,
            sortField,
            sortDir,
            page,
            pageSize,
            logSearch,
        } = req.body;

        const userId = req.user?.id;

        // Convert arrays to JSONB format
        const agenciesJson = JSON.stringify(agencies || []);
        const countriesJson = JSON.stringify(countries || []);
        const provincesJson = JSON.stringify(provinces || []);
        const citiesJson = JSON.stringify(cities || []);

        // Call the grant_search function
        const { data, error } = await supabase.rpc("grant_search", {
            p_user_id: userId,
            p_recipient_term: recipient || "",
            p_institute_term: institute || "",
            p_grant_term: grant || "",
            p_search_recipient: recipient || "",
            p_search_institution: institute || "",
            p_search_grant: grant || "",
            p_from_date: dateFrom || "1900-01-01",
            p_to_date: dateTo || "2100-01-01",
            p_value_min: valueMin || 0,
            p_value_max: valueMax || 1000000000,
            p_agencies: agenciesJson,
            p_countries: countriesJson,
            p_provinces: provincesJson,
            p_cities: citiesJson,
            p_sort_field: sortField || "date",
            p_sort_direction: sortDir || "desc",
            p_page_size: pageSize || 20,
            p_page: page || 1,
            p_log_search_history: logSearch === undefined ? true : logSearch,
        });

        if (error) throw error;

        // Process results - extract the total count from the first row
        const totalCount = data.length > 0 ? data[0].total_count : 0;
        const historyId = data.length > 0 ? data[0].history_id : null;

        // Format the response
        res.json({
            totalCount,
            historyId,
            grants: data.map((item) => ({
                id: item.grant_id,
                refNumber: item.ref_number,
                latestAmendmentNumber: item.latest_amendment_number,
                amendmentDate: item.amendment_date,
                agreementNumber: item.agreement_number,
                agreementValue: item.agreement_value,
                foreignCurrencyType: item.foreign_currency_type,
                foreignCurrencyValue: item.foreign_currency_value,
                agreementStartDate: item.agreement_start_date,
                agreementEndDate: item.agreement_end_date,
                agreementTitleEn: item.agreement_title_en,
                descriptionEn: item.description_en,
                expectedResultsEn: item.expected_results_en,
                additionalInformationEn: item.additional_information_en,
                legalName: item.legal_name,
                researchOrganizationName: item.research_organization_name,
                instituteId: item.institute_id,
                recipientId: item.recipient_id,
                city: item.city,
                province: item.province,
                country: item.country,
                org: item.org,
                orgTitle: item.org_title,
                progId: item.prog_id,
                progTitleEn: item.prog_title_en,
                progPurposeEn: item.prog_purpose_en,
                amendmentsHistory: item.amendments_history,
                isBookmarked: item.is_bookmarked,
            })),
        });
    } catch (error) {
        console.error("Grant search error:", error);
        res.status(500).json({
            message: "Failed to search grants",
            error: error.message,
        });
    }
};

// Get entity grants (by recipient or institute)
export const getEntityGrants = async (req, res) => {
    try {
        const { recipientId, instituteId, sortField, sortDir, page, pageSize } =
            req.query;

        const userId = req.user?.id;

        // Call the entity_grants function
        const { data, error } = await supabase.rpc("entity_grants", {
            p_recipient_id: recipientId ? parseInt(recipientId) : null,
            p_institute_id: instituteId ? parseInt(instituteId) : null,
            p_sort_field: sortField || "date",
            p_sort_direction: sortDir || "desc",
            p_page_size: pageSize ? parseInt(pageSize) : 20,
            p_page: page ? parseInt(page) : 1,
            p_user_id: userId,
        });

        if (error) throw error;

        // Process results - extract the total count from the first row
        const totalCount = data.length > 0 ? data[0].total_count : 0;

        // Format the response
        res.json({
            totalCount,
            grants: data.map((item) => ({
                id: item.grant_id,
                refNumber: item.ref_number,
                latestAmendmentNumber: item.latest_amendment_number,
                amendmentDate: item.amendment_date,
                agreementNumber: item.agreement_number,
                agreementValue: item.agreement_value,
                foreignCurrencyType: item.foreign_currency_type,
                foreignCurrencyValue: item.foreign_currency_value,
                agreementStartDate: item.agreement_start_date,
                agreementEndDate: item.agreement_end_date,
                agreementTitleEn: item.agreement_title_en,
                descriptionEn: item.description_en,
                expectedResultsEn: item.expected_results_en,
                additionalInformationEn: item.additional_information_en,
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
                isBookmarked: item.is_bookmarked,
            })),
        });
    } catch (error) {
        console.error("Entity grants error:", error);
        res.status(500).json({
            message: "Failed to get entity grants",
            error: error.message,
        });
    }
};

// Get filter options
export const getFilterOptions = async (req, res) => {
    try {
        // Call the get_filter_options function
        const { data, error } = await supabase.rpc("get_filter_options");

        if (error) throw error;

        // Process results into a standardized format
        const result = {};

        for (const row of data) {
            result[row.filter_type] = row.filter_values;
        }

        res.json(result);
    } catch (error) {
        console.error("Filter options error:", error);
        res.status(500).json({
            message: "Failed to get filter options",
            error: error.message,
        });
    }
};
