const { body } = require("express-validator");

const registerValidation = [
  body("firstName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name can only contain letters and spaces"),

  body("lastName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Last name can only contain letters and spaces"),

  body("emailAddress")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),

  body("userRole")
    .optional()
    .isIn(["manager", "facilitator", "student"])
    .withMessage("User role must be manager, facilitator, or student"),
];

const loginValidation = [
  body("emailAddress")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

const updateProfileValidation = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name can only contain letters and spaces"),

  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Last name can only contain letters and spaces"),

  body("emailAddress")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
];

const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "New password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("Password confirmation does not match new password");
    }
    return true;
  }),
];

const allocationValidation = [
  body("courseId").isInt({ min: 1 }).withMessage("Course is required"),
  body("facilitatorId")
    .isInt({ min: 1 })
    .withMessage("Facilitator is required"),
  body("cohortId").isInt({ min: 1 }).withMessage("Cohort is required"),
  body("trimester")
    .isIn(["HT1", "HT2", "FT"])
    .withMessage("Trimester must be HT1, HT2, or FT"),
  body("intakePeriod")
    .isString()
    .notEmpty()
    .withMessage("Intake period is required"),
  body("deliveryMode")
    .isIn(["online", "in-person", "hybrid"])
    .withMessage("Delivery mode must be online, in-person, or hybrid"),
  body("classSection")
    .isString()
    .notEmpty()
    .withMessage("Class section is required"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

const allocationUpdateValidation = [
  body("courseId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Course must be a valid integer"),
  body("facilitatorId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Facilitator must be a valid integer"),
  body("cohortId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Cohort must be a valid integer"),
  body("trimester")
    .optional()
    .isIn(["HT1", "HT2", "FT"])
    .withMessage("Trimester must be HT1, HT2, or FT"),
  body("intakePeriod")
    .optional()
    .isString()
    .notEmpty()
    .withMessage("Intake period must be a non-empty string"),
  body("deliveryMode")
    .optional()
    .isIn(["online", "in-person", "hybrid"])
    .withMessage("Delivery mode must be online, in-person, or hybrid"),
  body("classSection")
    .optional()
    .isString()
    .notEmpty()
    .withMessage("Class section must be a non-empty string"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

const activityLogValidation = [
  body("allocationId")
    .isInt({ min: 1 })
    .withMessage("Course allocation is required"),
  body("weekNumber")
    .isInt({ min: 1, max: 52 })
    .withMessage("Week number must be between 1 and 52"),
  body("academicYear")
    .isString()
    .notEmpty()
    .withMessage("Academic year is required"),
  body("attendanceStatus")
    .isArray()
    .withMessage("Attendance status must be an array"),
  body("attendanceStatus.*")
    .isBoolean()
    .withMessage("Attendance status values must be boolean"),
  body("formativeOneGrading")
    .isIn(["Done", "Pending", "Not Started"])
    .withMessage("Formative one grading must be Done, Pending, or Not Started"),
  body("formativeTwoGrading")
    .isIn(["Done", "Pending", "Not Started"])
    .withMessage("Formative two grading must be Done, Pending, or Not Started"),
  body("summativeGrading")
    .isIn(["Done", "Pending", "Not Started"])
    .withMessage("Summative grading must be Done, Pending, or Not Started"),
  body("courseModeration")
    .isIn(["Done", "Pending", "Not Started"])
    .withMessage("Course moderation must be Done, Pending, or Not Started"),
  body("intranetSync")
    .isIn(["Done", "Pending", "Not Started"])
    .withMessage("Intranet sync must be Done, Pending, or Not Started"),
  body("gradeBookStatus")
    .isIn(["Done", "Pending", "Not Started"])
    .withMessage("Grade book status must be Done, Pending, or Not Started"),
  body("additionalNotes")
    .optional()
    .isString()
    .withMessage("Additional notes must be a string"),
];

const activityLogUpdateValidation = [
  body("allocationId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Course allocation must be a valid integer"),
  body("weekNumber")
    .optional()
    .isInt({ min: 1, max: 52 })
    .withMessage("Week number must be between 1 and 52"),
  body("academicYear")
    .optional()
    .isString()
    .notEmpty()
    .withMessage("Academic year must be a non-empty string"),
  body("attendanceStatus")
    .optional()
    .isArray()
    .withMessage("Attendance status must be an array"),
  body("attendanceStatus.*")
    .optional()
    .isBoolean()
    .withMessage("Attendance status values must be boolean"),
  body("formativeOneGrading")
    .optional()
    .isIn(["Done", "Pending", "Not Started"])
    .withMessage("Formative one grading must be Done, Pending, or Not Started"),
  body("formativeTwoGrading")
    .optional()
    .isIn(["Done", "Pending", "Not Started"])
    .withMessage("Formative two grading must be Done, Pending, or Not Started"),
  body("summativeGrading")
    .optional()
    .isIn(["Done", "Pending", "Not Started"])
    .withMessage("Summative grading must be Done, Pending, or Not Started"),
  body("courseModeration")
    .optional()
    .isIn(["Done", "Pending", "Not Started"])
    .withMessage("Course moderation must be Done, Pending, or Not Started"),
  body("intranetSync")
    .optional()
    .isIn(["Done", "Pending", "Not Started"])
    .withMessage("Intranet sync must be Done, Pending, or Not Started"),
  body("gradeBookStatus")
    .optional()
    .isIn(["Done", "Pending", "Not Started"])
    .withMessage("Grade book status must be Done, Pending, or Not Started"),
  body("additionalNotes")
    .optional()
    .isString()
    .withMessage("Additional notes must be a string"),
];

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
  allocationValidation,
  allocationUpdateValidation,
  activityLogValidation,
  activityLogUpdateValidation,
};
