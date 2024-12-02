const short = require('short-uuid');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSantize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const questionRouter = require('./routes/questionRoutes');
const testRouter = require('./routes/testRoutes');
const resultRouter = require('./routes/resultRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const Test = require('./models/testModel');
const Result = require('./models/resultModel');
const catchAsync = require('./utils/catchAsync');

const app = express();

// Global midlewares
app.use(cors());

// Set security HTTP headers
app.use(helmet());
function removeSpecialEscapeSequences(str) {
  str = str.replaceAll("&lt;", '<');
  return str;
}
const evaluateCode = async (req, res) => {
  try {
    const test = await Test.findById(req.body.testId);
    const func = eval(removeSpecialEscapeSequences(req.body.code));
    const testCase = test.Question.find((ele) => {
      return ele._id.toHexString() === req.body.questionId;
    }).testcases.reduce((t, c) => {
      return [...t, c.input.map(a=>{
        if(isNaN(parseFloat(a))){
          return a
        }else{
          return parseFloat(a);
        }
      })];
    }, []);
    const CorrectResults = test.Question.find((ele) => {
      return ele._id.toHexString() === req.body.questionId;
    }).testcases.reduce((t, c) => {
      return [...t, c.output];
    }, []);
    const userResults = CorrectResults.map((e, i) => {
      if (func(testCase[i]) == e) return true;
      return false;
    });
    if (!res) {
      return userResults;
    }
    res.status(200).json({
      message: 'Evaluation Done!',
      data: userResults,
    });
  } catch (err) {
    let errorMessage = '';
    if (err instanceof SyntaxError) {
      errorMessage = 'Syntax Error: Please check your code syntax and try again.';
    } else if (err instanceof TypeError) {
      errorMessage = 'Syntax Error: Please check your code syntax and try again.';
    } else if (err.message && err.message.includes('timed out')) {
      errorMessage = 'Syntax Error: Please check your code syntax and try again.';
    } else {
      errorMessage = 'Syntax Error: Please check your code syntax and try again.';
    }
    if (res) {
      res.status(500).json({
        message: errorMessage,
      });
    }
  }
};


// Limit requests from same IP
const limiter = rateLimit({
  max: 1000,
  WindowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again in an hour!',
});
app.use('/api', limiter);

app.use(express.json());

// Data sanitize against NoSQL query injection attacks
app.use(mongoSantize());

//Data sanitize against xss
app.use(xss());

app.use(cookieParser());

// routes
app.post('/js', async (req, res, next) => {
  await evaluateCode(req, res);
});

app.get('/results/get', async (req, res) => {
  const { testId } = req.query; // Extract testId from the query parameters
  
  try {
    // Find results for the specific testId
    const results = await Result.find({ testID: testId }).populate('testID');
    console.log(results)
    
    if (!results || results.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'No results found for this test.',
      });
    }

    // Format results as needed
    const formattedResults = results.map((result) => {
      // Accessing the first candidate if there are multiple candidates in the array
      return result.candidate.map((candidate) => ({
        name: candidate.name,
        email: candidate.email,
        score: candidate.score,
        submittedAt: result.createdAt,  // Assuming `createdAt` is the submission time for each result
        testName: result.testID.name,  // The name of the test
      }));
    }).flat();
    console.log(formattedResults)

    res.status(200).json({
      status: 'success',
      data: formattedResults,
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});


app.get('/tests/get', async (req,res)=>{
  console.log("getting here")
  try {
    // Retrieve all tests from the database
    const tests = await Test.find();

    if (!tests || tests.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No tests found",
      });
    }
    const formattedTests = tests.map((test) => ({
      ...test.toObject(),
      createdAt: new Date(test.createdAt).toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
    // Send response with the tests
    res.status(200).json({
      status: "success",
      message: "Tests retrieved successfully",
      data: formattedTests,
    });
  } catch (error) {
    console.error("Error retrieving tests:", error.message);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});
app.post(
  '/submit/test',
  catchAsync(async (req, res) => {
    console.log("submit start")
    const { user, answers, testID } = req.body;
    // console.log(req.body)

    // Check if the user has already submitted the test
    const existingCandidate = await Result.findOne({
      testID,
      'candidate.email': user.email,
    });

    if (existingCandidate) {
      return res.status(400).json({
        status: 'fail',
        message: 'You have already submitted the test',
      });
    }

    // Fetch the test and questions
    const test = await Test.findById(testID).populate('Question');
    // console.log(test)
    if (!test) {
      return res.status(404).json({
        status: 'fail',
        message: 'Test not found',
      });
    }

    const evaluatedAnswers = [];
    let correctAnswers = 0;

    for (const answer of answers) {
      const question = test.Question.find((q) => q._id.toString() === answer.questionID);
      console.log(question)

      if (!question) continue;

      let evaluation = {
        questionID: question._id,
        questionType: question.type,
        isCorrect: false,
        userAnswer: answer.answer,
      };

      if (question.type === 'coding') {
        // Evaluate coding questions
        // const codeEvaluation = await evaluateCode({
        //   testId: testID,
        //   questionId: question._id,
        //   code: answer.answer,
        // });
        // evaluation.isCorrect = codeEvaluation.every((testCase) => testCase === true);
      } else if (question.type === 'mcq') {
        // Evaluate MCQ questions
        evaluation.isCorrect = answer.answer === question.correctAnswer;
      } else if (question.type === 'subjective') {
        const keywords = question.subjectiveAnswer.split(' '); // Split keywords by space
        const answerText = answer.answer.toLowerCase(); // Convert answer to lowercase for case-insensitive comparison

        // Check if all keywords are present in the answer
        const matchedKeywords = keywords.filter(keyword => answerText.includes(keyword.toLowerCase()));
        const matchPercentage = (matchedKeywords.length / keywords.length) * 100;

        // Set evaluation score or boolean based on matchPercentage
        evaluation.isCorrect = matchPercentage >= 70; // For example, consider 70% match as correct
        evaluation.score = matchPercentage;
      }
      console.log(evaluatedAnswers)

      evaluatedAnswers.push(evaluation);

      // Count correct answers for scoring
      if (evaluation.isCorrect) correctAnswers++;
    }

    // Calculate the score
    const totalObjectiveQuestions = evaluatedAnswers.filter(
      (answer) => answer.questionType !== 'subjective'
    ).length;
    const score =
      totalObjectiveQuestions > 0
        ? (correctAnswers / totalObjectiveQuestions) * 100
        : 0;

    // Save the result in the database
    const newCandidate = {
      email: user.email,
      name: user.name,
      score,
      evaluatedAnswers,
    };

    const result = await Result.updateOne(
      { testID },
      { $push: { candidate: newCandidate } },
      { upsert: true }
    );

    // Respond with success
    res.status(200).json({
      status: 'success',
      message: 'Test submitted successfully',
      data: { result },
    });
  })
);
app.use('/api/questions', questionRouter);
app.use('/tests', testRouter);

// app.get('/tests/get', async (req,res)=>{
//   console.log("getting here")
//   try {
//     // Retrieve all tests from the database
//     const tests = await Test.find();

//     if (!tests || tests.length === 0) {
//       return res.status(404).json({
//         status: "fail",
//         message: "No tests found",
//       });
//     }
//     // Send response with the tests
//     res.status(200).json({
//       status: "success",
//       message: "Tests retrieved successfully",
//       data: tests,
//     });
//   } catch (error) {
//     console.error("Error retrieving tests:", error.message);
//     res.status(500).json({
//       status: "error",
//       message: "Internal server error",
//     });
//   }
// });

app.post('/tests/create', async (req, res)=>{
  try {
    console.log("Creating test...");
    const testObj = req.body;
    const key = short.generate();
    testObj.key = key; // Uncomment if you want to set the key
    // testObj.createdBy = req.user.id;
    console.log("Test Object:", testObj);

    const newTest = await Test.create(testObj);
    newTest.active = undefined;

    await Result.create({
      testID: newTest._id,
      testKey: key,
      // createdBy: req.user.id,
    });

    res.status(201).json({
      status: 'success',
      message: 'Test created successfully!',
      data: {
        testId: newTest._id,
        test: newTest,
      },
    });
  } catch (error) {
    console.error('Error in /tests/create:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create test.',
    });
  }
});
app.use('/results', resultRouter);
app.use('/users', userRouter);
app.get('/', (req, res) => {
  res.status(200).send('Hello Server is Up and fine!');
});

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
