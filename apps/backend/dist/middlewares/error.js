"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error('Unhandled Error:', err);
    const statusCode = err.statusCode || 500;
    const code = err.code || 'INTERNAL_ERROR';
    const message = err.message || 'Something went wrong';
    res.status(statusCode).json({
        error: {
            code,
            message
        }
    });
};
exports.errorHandler = errorHandler;
