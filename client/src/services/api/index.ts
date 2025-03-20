// src/services/api/index.ts
import createAPI from '@/utils/api';

const API = createAPI(5000); // Use 5000ms timeout

// Error interceptor
API.interceptors.response.use(
  response => response,
  error => {
      console.error('API Error:', error);
      throw error;
  }
);

/*-------------------Search API calls-------------------*/

const replaceNulls: any = (obj: object) => {
  if (obj === null) return "null";
  if (Array.isArray(obj)) return obj.map(replaceNulls);
  if (typeof obj === "object" && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, replaceNulls(value)])
    );
  }
  return obj;
};


export const getAllGrants = async () => {
  try {
    const response = await API.get('/search/all');
    console.log('Get all grants:', response.data);
    console.log('Get all grants2:', replaceNulls(response.data));
    return replaceNulls(response.data);
  } catch (error: any) {
    console.error('Get all grants failed:', error.response?.data || error.message);
    throw error;
  }
}

export const searchGrants = async (searchTerms: any, filters: any, sortConfig: any) => {
  try {
    const response = await API.post('/search', { searchTerms, filters, sortConfig });
    console.log("Search response:", response.data);
    return replaceNulls(response.data.data);
  } catch (error: any) {
    console.error("Search failed:", error.response?.data || error.message);
    throw error;
  }
};
