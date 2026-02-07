"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.updateCellSchema = exports.addRowSchema = exports.createSheetSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6)
});
exports.createSheetSchema = zod_1.z.object({
    name: zod_1.z.string().min(1)
});
exports.addRowSchema = zod_1.z.object({
    row_index: zod_1.z.number().int().nonnegative()
});
exports.updateCellSchema = zod_1.z.object({
    row_id: zod_1.z.number().int().positive(),
    column_key: zod_1.z.string().min(1),
    value: zod_1.z.string() // Assuming string values for cells? Plan implied string.
});
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    }
    catch (error) {
        res.status(400).json({
            error: {
                code: 'VALIDATION_ERROR',
                message: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
            }
        });
    }
};
exports.validate = validate;
