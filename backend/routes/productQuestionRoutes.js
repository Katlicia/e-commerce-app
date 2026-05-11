const express = require("express");
const {
  getQuestions,
  getUserQuestions,
  createQuestion,
  createAnswer,
  deleteQuestion,
  deleteAnswer,
  adminGetAllQuestions,
} = require("../controllers/productQuestionController");
const { authenticationMiddle, isAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/admin/questions", authenticationMiddle, isAdmin, adminGetAllQuestions);
router.get("/users/me/questions", authenticationMiddle, getUserQuestions);
router.get("/products/:productId/questions", getQuestions);
router.post("/products/:productId/questions", authenticationMiddle, createQuestion);
router.post("/products/:productId/questions/:questionId/answers", authenticationMiddle, createAnswer);
router.delete("/products/:productId/questions/:questionId", authenticationMiddle, deleteQuestion);
router.delete("/products/:productId/questions/:questionId/answers/:answerId", authenticationMiddle, deleteAnswer);

module.exports = router;
