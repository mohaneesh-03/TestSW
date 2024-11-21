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
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
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
        <Box>
          <Typography>Welcome, {user.firstName}</Typography>
        </Box>
        <Box>
          <form onSubmit={handleSubmitTest}>
            <Box>
              <Grid container>
                <Grid item xs={12}>
                  <TextField label="Test Name" name="name" required fullWidth />
                </Grid>
                {/* Additional Test Fields */}
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
            <Box>
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

  const handleFieldChange = (field, value) => {
    onChange(id, field, value);
  };

  return (
    <Box>
      <Typography>Question No: {index + 1}</Typography>
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
              <Button variant="contained" color="primary" onClick={() => setIsModalOpen(true)}>
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
                value={options || ""}
                onChange={(e) => handleFieldChange("options", e.target.value)}
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
              label="Suggested Answer (Optional)"
              value={subjectiveAnswer || ""}
              onChange={(e) => handleFieldChange("subjectiveAnswer", e.target.value)}
            />
          </Grid>
        )}
        <Grid item xs={12}>
          <Button onClick={() => onDelete(id)} variant="contained" color="error">
            Delete Question
          </Button>
        </Grid>
      </Grid>
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <DialogTitle>Add Test Cases</DialogTitle>
        <DialogContent>
          <Box>
            <DataGrid testCases={testcases} onSave={(testCases) => onSaveTestCases(id, testCases)} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateTest;
