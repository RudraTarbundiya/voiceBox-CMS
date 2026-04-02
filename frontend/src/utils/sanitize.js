import DOMPurify from 'dompurify';

export const sanitizeText = (value) => {
    if (typeof value !== 'string') {
        return value;
    }

    return DOMPurify.sanitize(value, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
    }).trim();
};

export const sanitizePayload = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => sanitizePayload(item));
    }

    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([key, nestedValue]) => [key, sanitizePayload(nestedValue)])
        );
    }

    return sanitizeText(value);
};