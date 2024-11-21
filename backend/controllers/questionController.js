const Question = require('../models/questionModel');

exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find();

    res.status(200).json({
      status: 'success',
      length: questions.length,
      data: {
        questions,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        question,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createQuestion = async (req, res) => {
  try {
    const newQuestion = await Question.create(req.body);

    res.status(201).json({
      status: 'success',
      body: {
        question: newQuestion,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        question,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
