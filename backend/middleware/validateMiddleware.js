import { z } from 'zod';

/**
 * Validate request body/query/params using Zod schemas.
 * Usage: validateRequest({ body: schema, query: schema, params: schema })
 */
export const validateRequest = (schemas = {}) => {
    return (req, res, next) => {
        try {
            if (schemas.body) {
                req.body = schemas.body.parse(req.body);
            }

            if (schemas.query) {
                req.query = schemas.query.parse(req.query);
            }

            if (schemas.params) {
                req.params = schemas.params.parse(req.params);
            }

            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: error.issues.map((issue) => ({
                        field: issue.path.join('.') || 'request',
                        message: issue.message
                    }))
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Unexpected validation error'
            });
        }
    };
};

export default validateRequest;