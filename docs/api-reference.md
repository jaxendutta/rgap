# RGAP API Reference

This document provides a comprehensive reference for the RGAP REST API. The API enables programmatic access to grant data, search functionality, and user account management.

## Base URL

All API endpoints are relative to the base URL:

```
http://localhost:4000
```

In production, this would be your deployed API domain.

## Authentication

Protected endpoints require JWT authentication.

**Authentication Header**
```
Authorization: Bearer <jwt_token>
```

To obtain a token, use the login endpoint described in the Authentication section.

## Response Format

All responses are returned in JSON format with the following structure:

```json
{
  "message": "Success or error message",
  "data": {}, // Response data object
  "metadata": {} // Pagination or other metadata
}
```

## Endpoints

### Health Check

#### GET /health

Check if the API is running.

**Response**
```json
{
  "status": "ok"
}
```

### Authentication

#### POST /auth/signup

Create a new user account.

**Parameters**

| Name | Type | Description |
|------|------|-------------|
| name | string | User's full name |
| email | string | User's email address |
| password | string | User's password |
| confirmPassword | string | Password confirmation |

**Response**

```json
{
  "user_id": 123,
  "email": "user@example.com",
  "name": "User Name"
}
```

#### POST /auth/login

Log in a user.

**Parameters**

| Name | Type | Description |
|------|------|-------------|
| email | string | User's email address |
| password | string | User's password |

**Response**

```json
{
  "user_id": 123,
  "email": "user@example.com",
  "name": "User Name",
  "searches": [] // User's saved searches
}
```

### Search

#### POST /search

Search for grants with filtering and sorting.

**Parameters**

| Name | Type | Description |
|------|------|-------------|
| searchTerms | object | Search terms for recipient, institute, grant |
| filters | object | Filter criteria (years, values, agencies, etc.) |
| sortConfig | object | Sorting configuration (field, direction) |
| pagination | object | Page number and page size |

**Example Request**

```json
{
  "searchTerms": {
    "recipient": "University",
    "institute": "",
    "grant": "climate"
  },
  "filters": {
    "yearRange": { "start": 2018, "end": 2023 },
    "valueRange": { "min": 0, "max": 10000000 },
    "agencies": ["NSERC", "CIHR"],
    "countries": ["Canada"],
    "provinces": [],
    "cities": []
  },
  "sortConfig": {
    "field": "date",
    "direction": "desc"
  },
  "pagination": {
    "page": 1,
    "pageSize": 20
  }
}
```

**Response**

```json
{
  "message": "Success",
  "data": [
    {
      "grant_id": 12345,
      "ref_number": "ABC-123",
      "amendment_number": "0",
      "agreement_value": 250000,
      "agreement_start_date": "2022-04-01",
      "agreement_end_date": "2024-03-31",
      "agreement_title_en": "Research Grant Title",
      "description_en": "Description of the research",
      "recipient_id": 67890,
      "legal_name": "Recipient Name",
      "institute_id": 54321,
      "research_organization_name": "University Name",
      "city": "Ottawa",
      "province": "Ontario",
      "country": "Canada",
      "org": "NSERC",
      "owner_org": "nserc-crsng",
      "owner_org_title": "Natural Sciences and Engineering Research Council"
      // Additional fields...
    }
    // More grants...
  ],
  "metadata": {
    "count": 20,
    "totalCount": 156,
    "page": 1,
    "pageSize": 20,
    "totalPages": 8,
    "filters": {},
    "searchTerms": {}
  }
}
```

#### GET /search/filter-options

Get available filter options.

**Response**

```json
{
  "agencies": ["CIHR", "NSERC", "SSHRC"],
  "countries": ["Canada", "United States", "..."],
  "provinces": ["Alberta", "British Columbia", "..."],
  "cities": ["Toronto", "Montreal", "..."]
}
```

### Grants

#### GET /grants/:id

Get details for a specific grant.

**Response**

```json
{
  "message": "Grant retrieved successfully",
  "data": {
    "grant_id": 12345,
    "ref_number": "ABC-123",
    // Full grant details...
  }
}
```

### Recipients

#### GET /recipients

Get paginated list of recipients.

**Query Parameters**

| Name | Type | Description |
|------|------|-------------|
| page | number | Page number (default: 1) |
| pageSize | number | Records per page (default: 20) |

**Response**

```json
{
  "message": "Recipients retrieved successfully",
  "data": [
    {
      "recipient_id": 12345,
      "legal_name": "Recipient Name",
      "institute_id": 54321,
      "research_organization_name": "University Name",
      "city": "Toronto",
      "province": "Ontario",
      "country": "Canada",
      "grant_count": 15,
      "total_funding": 3750000
      // Additional fields...
    }
    // More recipients...
  ],
  "metadata": {
    "count": 20,
    "totalCount": 5432,
    "page": 1,
    "pageSize": 20,
    "totalPages": 272
  }
}
```

#### GET /recipients/:id

Get details for a specific recipient.

**Response**

```json
{
  "message": "Recipient details retrieved successfully",
  "data": {
    "recipient_id": 12345,
    "legal_name": "Recipient Name",
    "institute_id": 54321,
    "research_organization_name": "University Name",
    "city": "Toronto",
    "province": "Ontario",
    "country": "Canada",
    "total_grants": 15,
    "total_funding": 3750000,
    "avg_funding": 250000,
    "first_grant_date": "2015-04-01",
    "latest_grant_date": "2023-04-01",
    "funding_agencies_count": 2,
    "grants": [],
    "funding_history": []
  }
}
```

#### GET /recipients/:id/grants

Get grants for a specific recipient.

**Query Parameters**

| Name | Type | Description |
|------|------|-------------|
| page | number | Page number (default: 1) |
| pageSize | number | Records per page (default: 20) |
| sortField | string | Field to sort by (default: "date") |
| sortDirection | string | Sort direction (default: "desc") |

**Response**

```json
{
  "message": "Recipient grants retrieved successfully",
  "data": [
    // Grant objects...
  ],
  "metadata": {
    "count": 15,
    "totalCount": 15,
    "page": 1,
    "pageSize": 20,
    "totalPages": 1
  }
}
```

### Institutes

#### GET /institutes

Get paginated list of institutes.

**Query Parameters**

| Name | Type | Description |
|------|------|-------------|
| page | number | Page number (default: 1) |
| pageSize | number | Records per page (default: 20) |

**Response**

```json
{
  "message": "Institutes retrieved successfully",
  "data": [
    {
      "institute_id": 12345,
      "name": "University of Toronto",
      "type": "University",
      "city": "Toronto",
      "province": "Ontario",
      "country": "Canada",
      "recipients_count": 150,
      "grants_count": 500,
      "total_funding": 125000000,
      "latest_grant_date": "2023-04-01"
      // Additional fields...
    }
    // More institutes...
  ],
  "metadata": {
    "count": 20,
    "totalCount": 542,
    "page": 1,
    "pageSize": 20,
    "totalPages": 28
  }
}
```

#### GET /institutes/:id

Get details for a specific institute.

**Response**

```json
{
  "message": "Institute details retrieved successfully",
  "data": {
    "institute_id": 12345,
    "name": "University of Toronto",
    "type": "University",
    "city": "Toronto",
    "province": "Ontario",
    "country": "Canada",
    "total_recipients": 150,
    "total_grants": 500,
    "total_funding": 125000000,
    "avg_funding": 250000,
    "first_grant_date": "2010-04-01",
    "latest_grant_date": "2023-04-01",
    "funding_agencies_count": 3,
    "recipients": [],
    "grants": [],
    "funding_history": []
  }
}
```

#### GET /institutes/:id/grants

Get grants for a specific institute.

**Query Parameters**

| Name | Type | Description |
|------|------|-------------|
| page | number | Page number (default: 1) |
| pageSize | number | Records per page (default: 20) |
| sortField | string | Field to sort by (default: "date") |
| sortDirection | string | Sort direction (default: "desc") |

**Response**

```json
{
  "message": "Institute grants retrieved successfully",
  "data": [
    // Grant objects...
  ],
  "metadata": {
    "count": 20,
    "totalCount": 500,
    "page": 1,
    "pageSize": 20,
    "totalPages": 25
  }
}
```

#### GET /institutes/:id/recipients

Get recipients for a specific institute.

**Query Parameters**

| Name | Type | Description |
|------|------|-------------|
| page | number | Page number (default: 1) |
| pageSize | number | Records per page (default: 20) |

**Response**

```json
{
  "message": "Institute recipients retrieved successfully",
  "data": [
    // Recipient objects...
  ],
  "metadata": {
    "count": 20,
    "totalCount": 150,
    "page": 1,
    "pageSize": 20,
    "totalPages": 8
  }
}
```

### User Data

These endpoints require authentication.

#### GET /account/bookmarks

Get user's bookmarked items.

**Response**

```json
{
  "message": "Bookmarks retrieved successfully",
  "data": {
    "grants": [],
    "recipients": [],
    "institutes": []
  }
}
```

#### POST /account/bookmarks

Add a bookmark.

**Parameters**

| Name | Type | Description |
|------|------|-------------|
| type | string | Type of bookmark (grant, recipient, institute) |
| id | number | ID of item to bookmark |

**Response**

```json
{
  "message": "Bookmark added successfully",
  "data": {
    "bookmark_id": 12345,
    "user_id": 67890,
    "created_at": "2023-06-15T12:34:56Z"
  }
}
```

#### DELETE /account/bookmarks/:id

Remove a bookmark.

**Response**

```json
{
  "message": "Bookmark removed successfully"
}
```

#### GET /account/searches

Get user's search history.

**Response**

```json
{
  "message": "Search history retrieved successfully",
  "data": [
    {
      "history_id": 12345,
      "quick_search": "climate",
      "search_recipient": "",
      "search_grant": "climate",
      "search_institution": "",
      "search_filters": "{}",
      "search_time": "2023-06-15T12:34:56Z",
      "result_count": 150,
      "saved": false
    }
    // More search history items...
  ]
}
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Missing or invalid authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error - Server-side error |

## Rate Limiting

The API implements rate limiting to prevent abuse. Limits are:

- 100 requests per minute for authenticated users
- 30 requests per minute for unauthenticated users

When rate limited, the API responds with a 429 Too Many Requests status code.

## Versioning

The API is currently at version 1. The version is not included in the URL path but may be in future releases.

## Example Usage

### JavaScript/TypeScript

```javascript
// Example: Search for grants
async function searchGrants() {
  const response = await fetch('http://localhost:4000/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      searchTerms: {
        recipient: 'University of Toronto',
        institute: '',
        grant: ''
      },
      filters: {
        yearRange: { start: 2019, end: 2023 },
        valueRange: { min: 0, max: 1000000 },
        agencies: ['NSERC'],
        countries: ['Canada'],
        provinces: [],
        cities: []
      },
      sortConfig: {
        field: 'date',
        direction: 'desc'
      },
      pagination: {
        page: 1,
        pageSize: 20
      }
    })
  });
  
  const data = await response.json();
  return data;
}
```

### Python

```python
import requests
import json

# Example: Get recipient details
def get_recipient(recipient_id):
    response = requests.get(f'http://localhost:4000/recipients/{recipient_id}')
    return response.json()

# Example: Search with authentication
def search_with_auth(token, search_params):
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    
    response = requests.post(
        'http://localhost:4000/search',
        headers=headers,
        data=json.dumps(search_params)
    )
    
    return response.json()
```

## Implementation Notes

- All date fields should be in ISO 8601 format (YYYY-MM-DD)
- All monetary values are in Canadian dollars (CAD)
- Text fields support UTF-8 encoding
- API responses are paginated where appropriate to ensure performance