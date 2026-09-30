const { body, validationResult } = require("express-validator");

const postValidationRules = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Judul tidak boleh kosong")
    .isLength({ max: 200 })
    .withMessage("Judul maksimal 200 karakter"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Isi catatan tidak boleh kosong")
    .isLength({ max: 10000 })
    .withMessage("Isi catatan maksimal 10000 karakter"),
];

function checkValidation(viewName) {
  return (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render(viewName, {
        errors: errors.array(),
        post: { id: req.params.id, ...req.body },
        formAction: req.originalUrl,
      });
    }
    next();
  };
}

module.exports = { postValidationRules, checkValidation };
