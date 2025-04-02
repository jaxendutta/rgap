// server/utils/searchHelpers.js
import { pool } from "../config/db.js";
import stringSimilarity from "string-similarity";

/**
 * Normalizes a search term by removing common words and special characters
 */
export function normalizeSearchTerm(term) {
    if (!term) {
        return null;
    }
    return term
        .toLowerCase()
        .replace(/\b(university|of|the|and|at|for|on|in)\b/g, "")
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .trim();
}

/**
 * Finds the best matching normalized term from search history
 * This helps with connecting similar searches together
 */
export async function findBestMatch(term, type) {
    if (!term) {
        return null;
    }

    const normalized_term = normalizeSearchTerm(term);
    if (!normalized_term) {
        return null;
    }

    let q = "";
    if (type === "grant") {
        q =
            "SELECT normalized_grant FROM SearchHistory WHERE normalized_grant IS NOT NULL";
    } else if (type === "recipient") {
        q =
            "SELECT normalized_recipient FROM SearchHistory WHERE normalized_recipient IS NOT NULL";
    } else if (type === "institute") {
        q =
            "SELECT DISTINCT normalized_institution FROM SearchHistory WHERE normalized_institution IS NOT NULL";
    }

    const [rows] = await pool.query(q);

    let bestMatch = null;
    let bestScore = 0;

    for (let row of rows) {
        let rowNormalizedTerm = "";
        if (type === "grant") {
            rowNormalizedTerm = row.normalized_grant;
        } else if (type === "recipient") {
            rowNormalizedTerm = row.normalized_recipient;
        } else if (type === "institute") {
            rowNormalizedTerm = row.normalized_institution;
        }

        if (!rowNormalizedTerm) {
            continue;
        }

        let s = stringSimilarity.compareTwoStrings(term, rowNormalizedTerm);
        if (s > 0.7 && s > bestScore) {
            bestScore = s;
            bestMatch = rowNormalizedTerm;
        }
    }

    if (bestMatch) {
        return bestMatch;
    }
    return normalized_term;
}
