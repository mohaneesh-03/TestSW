import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import { MenuItem, Select, FormControl, InputLabel, Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography, } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DataGrid from "../Components/common/DataDrid";
import { get, post } from "../utils/request";

const CreateTest = () => {
  const [questions, setQuestions] = useState([{ id: 0, testcases: [{}], type: "coding" }]);
  const [testData, setTestData] = useState({});
  const [loggedIn, setLoggedIn] = useState(false);
  // const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const [isTestAvailable, setIsTestAvailable] = useState(false);
  const [testStatus, setTestStatus] = useState({});
  const navigate = useNavigate();

  const handleAddQuestion = () => {
    setQuestions((prev) => [...prev, { id: prev.length, testcases: [{}], type: "coding" }]);
  };

  const handleDeleteQuestion = (id) => {
    setQuestions((prev) => prev.filter((question) => question.id !== id));
  };

  const handleQuestionChange = (id, field, value) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === id ? { ...question, [field]: value } : question
      )
    );
  };

  const handleSaveTestCases = (id, newTestCases) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === id ? { ...question, testcases: newTestCases } : question
      )
    );
  };

  const handleSubmitTest = async (e) => {
    e.preventDefault();
    // for (let index = 0; index < questions.length; index++) {
    //   if (JSON.stringify(questions[index].testcases) === JSON.stringify([{}])) {
    //     toast(`Add testcases for ${questions[index]?.name}`, {
    //       theme: "light",
    //       type: "error",
    //       position: "top-right",
    //     });
    //     return;
    //   }
    // }
    const questionsWithoutId = questions.map(({ id, ...rest }) => rest);

    const questionsWithoutTestcases = questionsWithoutId.map(({ id, testcases, type, ...rest }) => {
      // Remove testcases only for 'mcq' or 'subjective' types
      const cleanedQuestion = { ...rest, type };
      if (type !== "mcq" && type !== "subjective") {
        cleanedQuestion.testcases = testcases;
      }
      return cleanedQuestion;
    });

    const finaltestdata = { ...testData, Question: questionsWithoutTestcases };
    // const finaltestdata = {...testData, Question: questions}
    delete finaltestdata[""];

    console.log(JSON.stringify(finaltestdata))


    const response = await fetch("http://localhost:5000/tests/create", {
      method: "POST",
      body: JSON.stringify(finaltestdata),
      headers: {"Content-Type" : "application/json"}
    });
    const result = await response.json();
    if (response.ok) {
      toast("Test successfully created!", {
        theme: "light",
        type: "success",
        position: "top-right",
      });
      console.log(result.data.testId)
      setTestStatus({ isCreated: true, name: finaltestdata.name, id: result.data.testId });
    } else {
      toast(result.message || "Failed to create test.", {
        theme: "light",
        type: "error",
        position: "top-right",
      });
    }
  };

  // const checkLogin = async () => {
  //   if (!localStorage.getItem("user")) {
  //     toast("Please Login!", {
  //       theme: "light",
  //       type: "error",
  //       position: "top-right",
  //     });
  //     navigate("/login");
  //     return;
  //   }
  //   // const resp = await get(
  //   //   "http://localhost:5000/results/myResults",
  //   //   {},
  //   //   localStorage.getItem("token")
  //   // );
  //   // if (!resp.ok) {
  //   //   toast("Please Login!", {
  //   //     theme: "light",
  //   //     type: "error",
  //   //     position: "top-right",
  //   //   });
  //   //   navigate("/login");
  //   // } else {
  //   //   if (resp?.data?.results?.length > 0) {
  //   //     setIsTestAvailable(true);
  //   //   }
  //   //   setLoggedIn(true);
  //   // }
  // };

  // useEffect(() => {
  //   checkLogin();
  // }, []);

  // if (!loggedIn) {
  //   return (
  //     <Box
  //       sx={{
  //         width: "100vw",
  //         height: "100vh",
  //         display: "flex",
  //         justifyContent: "center",
  //         alignItems: "center",
  //       }}
  //     >
  //       <CircularProgress sx={{ mr: "1rem" }} /> Loading...
  //     </Box>
  //   );
  // }

  // Rest of the component remains the same...

  return (
    <Box>
      {/* Display Test Creation Status */}
      {testStatus?.isCreated && (
        <Box
          sx={{
            position: "fixed",
            width: "100%",
            height: "100vh",
            padding: "1rem",
            top: 0,
            left: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backdropFilter: "blur(5px)",
            zIndex: 999,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              maxWidth: "38rem",
              width: "100%",
              background: "#fff",
              p: "2rem",
              borderRadius: "8px",
              boxShadow:
                "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px",
            }}
          >
            <Typography
              mb={4}
              display={"flex"}
              alignItems={"center"}
              justifyContent={"space-between"}
              variant="h5"
              color="initial"
            >
              Test Details
              <IconButton
                aria-label=""
                onClick={() => {
                  setTestStatus((prev) => ({ ...prev, isCreated: false }));
                }}
              >
                <CloseIcon />
              </IconButton>
            </Typography>
            <Box>
              <Typography variant="body1" color="initial">
                Test Name: {testStatus?.name}
              </Typography>
              <Box
                border="solid #c1c1c1 1px"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderRadius: "4px",
                  mt: 1,
                }}
              >
                <Typography variant="body1" color="initial" p={1}>
                  Share this Test ID: {testStatus?.id}
                </Typography>
                <IconButton
                  onClick={() => {
                    navigator.clipboard.writeText(testStatus?.id);
                  }}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
      <Box>
        <Box
          sx={{
            height: "4.5rem",
            p: "1rem",
            mb: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "rgba(0, 0, 0, 0.18) 0px 2px 4px",
            position: "sticky",
            top: 0,
            background: "#fff",
            zIndex: "9",
          }}
        >
          <Typography variant="body1" color="initial" fontSize="1.375rem">
            Welcome
          </Typography>
          {isTestAvailable && (
            <Link to={"/result"}>
              <Button variant="contained" color="primary">
                View Test Results
              </Button>
            </Link>
          )}
        </Box>
        <Box
          sx={{
            border: "solid #c1c1c1 1px",
            m: "1rem",
            mt: "2rem",
            pt: "1rem",
            position: "relative",
            borderRadius: "4px",
          }}
        >
          <Typography
            sx={{
              fontSize: "1.125rem",
              border: "solid #c1c1c1 1px",
              display: "inline",
              position: "absolute",
              background: "#fff",
              top: "-24px",
              left: "1rem",
              p: "0.5rem 2rem",
              borderRadius: "4px",
            }}
          >
            Create Test
          </Typography>
          <form onSubmit={handleSubmitTest}>
            <Box
              m={2}
              p={2}
              sx={{ border: "solid #c1c1c1 1px", borderRadius: "4px" }}
              onChange={(e) => {
                setTestData((prev) => {
                  return { ...prev, [e.target.name]: e.target.value };
                });
              }}
            >
              <Grid container columnSpacing={2} rowSpacing={2}>
                <Grid item xs={12}>
                  <TextField label="Test Name" name="name" required fullWidth />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Company Name"
                    name="company"
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      label="Test Start Time"
                      defaultValue={dayjs()}
                      sx={{ width: "100%" }}
                      onChange={(e) => {
                        setTestData((prev) => {
                          return { ...prev, startTime: dayjs(e).toISOString() };
                        });
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Duration"
                    placeholder="Should be in Minutes"
                    name="duration"
                    type="number"
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      defaultValue={dayjs().add(7, "d")}
                      label="Test End Time"
                      sx={{ width: "100%" }}
                      onChange={(e) => {
                        setTestData((prev) => {
                          return { ...prev, endTime: dayjs(e).toISOString() };
                        });
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </Box>
            {questions.map((question, index) => (
              <QuestionForm
                key={question.id}
                index={index}
                question={question}
                onDelete={handleDeleteQuestion}
                onChange={handleQuestionChange}
                onSaveTestCases={handleSaveTestCases}
              />
            ))}
            <Box p={"1rem"}>
              <Button variant="contained" color="primary" onClick={handleAddQuestion}>
                Add Question
              </Button>
              <Button
                variant="contained"
                color="success"
                type="submit"
                sx={{ ml: "1rem" }}
                disabled={questions.length === 0}
              >
                Submit
              </Button>
            </Box>
          </form>
        </Box>
      </Box>
    </Box>
  );
};

const QuestionForm = ({ question, onDelete, onChange, onSaveTestCases, index }) => {
  const { id, name, statement, constraints, testcases, type, options, correctAnswer, subjectiveAnswer } = question;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddTestCase = () => {
    setIsModalOpen(true);
  };
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleTestCasesSave = (newTestCases) => {
    onSaveTestCases(id, newTestCases);
    setIsModalOpen(false);
  };

  const handleFieldChange = (field, value) => {
    onChange(id, field, value);
  };

  return (
    <Box
      m={2}
      mt={4}
      border={"solid #c1c1c1 1px"}
      p={2}
      borderRadius={"4px"}
      position={"relative"}
      pt={4}
    >
      <Box
        component={"span"}
        sx={{
          position: "absolute",
          background: "#fff",
          padding: "4px 8px",
          top: "-20px",
          border: "solid #c1c1c1 1px",
          borderRadius: "4px",
        }}
      >
        <Typography variant="body1" fontSize={"1.125rem"} color="initial">
          Question No: {index + 1}
        </Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Question Title"
            value={name}
            required
            onChange={(e) => handleFieldChange("name", e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            value={statement || ""}
            multiline
            required
            onChange={(e) => handleFieldChange("statement", e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Test Type</InputLabel>
            <Select
              value={type}
              onChange={(e) => handleFieldChange("type", e.target.value)}
              required
            >
              <MenuItem value="coding">Coding</MenuItem>
              <MenuItem value="mcq">MCQ</MenuItem>
              <MenuItem value="subjective">Subjective</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        {type === "coding" && (
          <>
            <Grid item xs={12}>
              <Typography>Constraints</Typography>
              <TextField
                fullWidth
                value={constraints || ""}
                multiline
                required
                onChange={(e) => handleFieldChange("constraints", e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAddTestCase}>
                Add Test Cases
              </Button>
            </Grid>
          </>
        )}
        {type === "mcq" && (
          <>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Options (Comma-separated)"
                value={options ? options.join(", ") : ""}
                onChange={(e) => handleFieldChange("options", e.target.value.split(",").map(item => item.trim()))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Correct Answer"
                value={correctAnswer || ""}
                onChange={(e) => handleFieldChange("correctAnswer", e.target.value)}
                required
              />
            </Grid>
          </>
        )}
        {type === "subjective" && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Keywords"
              value={subjectiveAnswer || ""}
              onChange={(e) => handleFieldChange("subjectiveAnswer", e.target.value)}
              required
            />
          </Grid>
        )}
        <Grid item xs={12}>
          <Button sx={{ ml: "1rem" }} onClick={() => onDelete(id)} variant="contained" color="error">
            Delete Question
          </Button>
        </Grid>
      </Grid>
      <Dialog open={isModalOpen} onClose={handleModalClose}>
        <DialogTitle>Add Test Cases</DialogTitle>
        <DialogContent sx={{ overflowX: "hidden" }}>
          <Box width={600}>
            <DataGrid testCases={testcases} onSave={handleTestCasesSave} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateTest;