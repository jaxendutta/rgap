// server/controllers/instituteController.js
import supabase from "../config/db.js";

// Get search history for a user
export const getSearchHistory = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { limit = 20 } = req.query;

        // Call the get_search_history function
        const { data, error } = await supabase.rpc("get_search_history", {
            p_user_id: userId,
            p_limit: parseInt(limit),
        });

        if (error) throw error;

        // Format the response
        res.json({
            history: data.map((item) => ({
                id: item.history_id,
                searchRecipient: item.search_recipient,
                searchGrant: item.search_grant,
                searchInstitution: item.search_institution,
                searchFilters: item.search_filters,
                searchTime: item.search_time,
                resultCount: item.result_count,
                saved: item.saved,
            })),
        });
    } catch (error) {
        console.error("Get search history error:", error);
        res.status(500).json({
            message: "Failed to get search history",
            error: error.message,
        });
    }
};

// Toggle bookmark for a search history item
export const toggleSearchBookmark = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { historyId } = req.params;

        // Call the toggle_search_bookmark function
        const { data, error } = await supabase.rpc("toggle_search_bookmark", {
            p_user_id: userId,
            p_history_id: parseInt(historyId),
        });

        if (error) throw error;

        res.json({ bookmarked: data[0].bookmarked });
    } catch (error) {
        console.error("Toggle search bookmark error:", error);
        res.status(500).json({
            message: "Failed to toggle search bookmark",
            error: error.message,
        });
    }
};

// Get popular searches
export const getPopularSearches = async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            category,
            page = 1,
            limit = 10,
        } = req.query;

        // Set default date range if not provided (last 30 days)
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(end);
        start.setDate(end.getDate() - 30);

        // Call the get_popular_searches function
        const { data, error } = await supabase.rpc("get_popular_searches", {
            p_start: start.toISOString(),
            p_end: end.toISOString(),
            p_category: category,
            p_page: parseInt(page),
            p_limit: parseInt(limit),
        });

        if (error) throw error;

        // Process results - extract the total count from the first row
        const totalCount = data.length > 0 ? data[0].total_count : 0;

        // Format the response
        const searches = data.map((item) => ({
            category: item.category,
            term: item.search_term,
            count: item.frequency,
        }));

        res.json({
            totalCount,
            searches,
        });
    } catch (error) {
        console.error("Get popular searches error:", error);
        res.status(500).json({
            message: "Failed to get popular searches",
            error: error.message,
        });
    }
};
