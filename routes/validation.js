// Validation
const Joi = require('@hapi/joi');

const adminRegister = (data) => {
    const user = {
        role: Joi.number().required(),
        name: Joi.string().min(3).required(),
        email: Joi.string().email({ tlds: { allow: true } }).required(),
        password: Joi.string().min(6).required()
    }

    return Joi.validate(data, user);
}

const adminLogin = (data) => {
    const user = {
        email: Joi.string().email({ tlds: { allow: true } }).required(),
        password: Joi.string().min(6).required()
    }
    return Joi.validate(data, user);
}

module.exports = {
    adminRegister,
    adminLogin
}