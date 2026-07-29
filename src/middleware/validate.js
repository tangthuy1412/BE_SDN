function validate(schema, target = 'body') {
  return (req, res, next) => {
    try {
      req[target] = schema.parse(req[target]);
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = validate;
