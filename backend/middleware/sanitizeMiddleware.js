import DOMPurify from 'isomorphic-dompurify';

const sanitizeString = (value) => {
    if (typeof value !== 'string') {
        return value;
    }

    return DOMPurify.sanitize(value, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
    }).trim();
};

const sanitizeObject = (value) => {
    if (Array.isArray(value)) {
        return value.map(sanitizeObject);
    }

    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([key, nestedValue]) => [key, sanitizeObject(nestedValue)])
        );
    }

    return sanitizeString(value);
};

/**
 * Sanitize body/query/params to strip HTML and script payloads.
 */
export const sanitizeRequestData = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }

    if (req.query && typeof req.query === 'object') {
        req.query = sanitizeObject(req.query);
    }

    if (req.params && typeof req.params === 'object') {
        req.params = sanitizeObject(req.params);
    }

    next();
};

export default sanitizeRequestData;