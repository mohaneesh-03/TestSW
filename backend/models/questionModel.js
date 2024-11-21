const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Question Name is required'],
    unique: true,
  },
  statement: {
    type: String,
    required: [true, 'Question Statement is required'],
  },
  constraints: {
    type: String,
    required: [true, 'Constraints are required'],
  },
  testcases: [
    {
      input: [String],
      output: [String],
    },
  ],
  date: {
    type: Date,
    default: Date.now(),
  },
});

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;
