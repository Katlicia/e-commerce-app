const ProductQuestion = require("../models/ProductQuestion");

exports.getQuestions = async (req, res) => {
  try {
    const questions = await ProductQuestion.find({ product: req.params.productId })
      .sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question?.trim()) {
      return res.status(400).json({ message: "Soru boş olamaz." });
    }

    const q = await ProductQuestion.create({
      product: req.params.productId,
      user: req.user._id,
      name: req.user.name,
      surname: req.user.surname,
      question: question.trim(),
    });

    res.status(201).json(q);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createAnswer = async (req, res) => {
  try {
    const { answer } = req.body;
    if (!answer?.trim()) {
      return res.status(400).json({ message: "Cevap boş olamaz." });
    }

    const q = await ProductQuestion.findOne({
      _id: req.params.questionId,
      product: req.params.productId,
    });

    if (!q) return res.status(404).json({ message: "Soru bulunamadı." });

    q.answers.push({
      user: req.user._id,
      name: req.user.name,
      surname: req.user.surname,
      answer: answer.trim(),
      isAdmin: req.user.isAdmin || false,
    });
    q.isAnswered = true;
    await q.save();

    res.status(201).json(q);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const q = await ProductQuestion.findOne({
      _id: req.params.questionId,
      product: req.params.productId,
    });

    if (!q) return res.status(404).json({ message: "Soru bulunamadı." });

    const isOwner = q.user.toString() === req.user._id.toString();
    if (!isOwner && !req.user.isAdmin) {
      return res.status(403).json({ message: "Yetkiniz yok." });
    }

    await q.deleteOne();
    res.json({ message: "Soru silindi." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.adminGetAllQuestions = async (req, res) => {
  try {
    const questions = await ProductQuestion.find()
      .populate("product", "name")
      .sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAnswer = async (req, res) => {
  try {
    const q = await ProductQuestion.findOne({
      _id: req.params.questionId,
      product: req.params.productId,
    });

    if (!q) return res.status(404).json({ message: "Soru bulunamadı." });

    const answer = q.answers.id(req.params.answerId);
    if (!answer) return res.status(404).json({ message: "Cevap bulunamadı." });

    const isOwner = answer.user.toString() === req.user._id.toString();
    if (!isOwner && !req.user.isAdmin) {
      return res.status(403).json({ message: "Yetkiniz yok." });
    }

    answer.deleteOne();
    if (q.answers.length === 0) q.isAnswered = false;
    await q.save();

    res.json({ message: "Cevap silindi." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
