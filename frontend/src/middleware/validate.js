const { ZodError } = require('zod');

// Usage: validate({ params: schema, query: schema, body: schema })
// On success the parsed (cleaned) values replace req.params / req.query / req.body.
module.exports = function validate(schemas) {
  return (req, res, next) => {
    try {
      for (const source of ['params', 'query', 'body']) {
        if (schemas[source]) {
          req[source] = schemas[source].parse(req[source]);
        }
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: err.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }
      next(err);
    }
  };
};
