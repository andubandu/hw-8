const Joi = require('joi');

const directorSchema = Joi.object({
  name: Joi.string().required(),
  birthYear: Joi.string().required(),
  nationality: Joi.string().required()
});

module.exports = directorSchema;