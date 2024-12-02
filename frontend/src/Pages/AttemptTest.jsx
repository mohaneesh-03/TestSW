import {
  Box,
  CircularProgress,
  Tab,
  Tabs,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert
} from "@mui/material";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
import { useRef } from "react";
import Webcam from "react-webcam"
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CodeEditor from "../Components/CodeEditor/CodeEditor";
import DisableDevTools from "../Components/DisableDevTools";
import FullscreenWrapper from "../Components/FullscreenWrapper";
import Layout from "../Components/Layout/Layout";
import { get, post } from "../utils/request";
import styles from "./AttemptTest.module.scss";

function deleteLocalStorageItemsExcept(keysToKeep) {
  const allKeys = Object.keys(localStorage);
  for (let i = 0; i < allKeys.length; i++) {
    const key = allKeys[i];
    if (!keysToKeep.includes(key)) {
      localStorage.removeItem(key);
    }
  }
}

function convertSecondsToHMS(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return {
    hours,
    minutes,
    seconds: remainingSeconds,
  };
}

const QuestionViewer = React.memo(function QuestionViewer({ question }) {
  return (
    <Box p={"1rem"} height="100vh" overflow="auto">
      <Box
        sx={{
          background: "#ddd",
          p: "1rem",
          borderRadius: "8px",
          textAlign: "justify",
          fontSize: "1.125rem",
          fontWeight: "500",
        }}
      >
        <Typography variant="body1" color="initial" fontWeight={700} fontSize={"18px"}>
          Question:
        </Typography>
        <Typography variant="body1" color="initial" fontSize={"16px"}>
          {question?.name}
        </Typography>
      </Box>
      <Box
        sx={{
          background: "#ddd",
          p: "1rem",
          my: "1rem",
          borderRadius: "8px",
          textAlign: "justify",
          fontSize: "1.125rem",
          fontWeight: "500",
        }}
      >
        <Typography variant="body1" color="initial" fontWeight={700}>
          Statement:
        </Typography>
        <Typography variant="body1" color="initial" fontSize={"14px"}>
          {question?.statement}
        </Typography>
      </Box>
    </Box>
  );
});

const AttemptTest = () => {
  const [isWebcamActive, setIsWebcamActive] = useState(true);
  const intervalRef = useRef(null);

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [warningCount, setWarningCount] = useState(0);
  const [warningMessage, setWarningMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState();
  const [value, setValue] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState();
  const [confirmTestSubmission, setConfirmTestSubmission] = useState(false);
  const [submittingTest, setSubmittingTest] = useState(false);
  const [answers, setAnswers] = useState({}); // To store answers for all questions

  const navigate = useNavigate();

  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await cocoSsd.load();
      setModel(loadedModel);
      console.log("loaded model")
    };
    loadModel();
  }, []);

  useEffect(() => {
    const detectObjects = async () => {
      if (webcamRef.current && webcamRef.current.video.readyState === 4 && model) {
        const video = webcamRef.current.video;
        const canvas = canvasRef.current;
        const ctx = await canvas.getContext("2d");

        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Perform object detection
        const predictions = await model.detect(video);

        // Clear previous drawings
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let faceCount = 0;
        let mobileCount = 0;

        // Draw predictions and count relevant objects
        predictions.forEach((prediction) => {
          const [x, y, width, height] = prediction.bbox;
          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, width, height);

          ctx.font = "18px Arial";
          ctx.fillStyle = "red";
          ctx.fillText(prediction.class, x, y > 10 ? y - 5 : 10);

          // Count faces and mobile phones
          if (prediction.class === "person") {faceCount++
            console.log("face detected")
          };
          if (prediction.class === "cell phone") {mobileCount++
            console.log("cell phone detected")
          };
        });

        // Trigger warnings if needed
        if (faceCount > 1 || mobileCount > 0) {
          handleWarnings(faceCount, mobileCount);
        } else {
          setWarningMessage(null); // Clear warning message if no issues
        }
      }
    };

    const interval = setInterval(detectObjects, 100); // Run detection every 100ms
    return () => clearInterval(interval);
  }, [model]);

  const handleWarnings = (faceCount, mobileCount) => {
    let message = "";
    if (faceCount > 1) message += `Multiple faces detected (${faceCount}). `;
    if (mobileCount > 0) message += `${mobileCount} mobile phone(s) detected.`;

    setWarningMessage(message);
    setWarningCount((prev) => prev + 1);

    if (warningCount + 1 >= 3) {
      submitTestHandler(); // Auto-submit test after 3 warnings
    }
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleAnswerChange = (questionID, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionID]: answer,
    }));
  };

  const fetchTest = async () => {
    if (!localStorage.getItem("testCode")) {
      navigate("/");
    }
    const res = await get(`http://localhost:5000/tests/${localStorage.getItem("testCode")}`);
    console.log(res)
    if (res.status !== 200) {
      navigate("/");
    } else {
      setTest(res.data.test);
      if (isNaN(localStorage.getItem("timeout"))) {
        localStorage.setItem("timeout", res.data.test.duration);
      }
      if (!!!localStorage.getItem("timeout")) {
        localStorage.setItem("timeout", res.data.test.duration);
      }
      setTimeRemaining(parseInt(localStorage.getItem("timeout")) ?? res.data.test.duration);
      res?.data?.test?.Question?.forEach((q) => {
        localStorage.setItem(
          q?._id,
          "module.exports = function(input) {\n  //Your code goes here\n\n}"
        );
      });
      setLoading(false);
    }
  };

  const submitTestHandler = async () => {
    setSubmittingTest(true);
    const codePayload = test.Question.map((q) => {
      return { questionID: q._id, answer: answers[q._id] || "" };
    });
    console.log(codePayload)
    const resp = await fetch("http://localhost:5000/submit/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${localStorage.getItem("token") || ""}`, // Optional token
      },
      body: JSON.stringify({
        user: JSON.parse(localStorage.getItem("user")),
        answers: codePayload,
        testID: localStorage.getItem("testCode"),
      }),
    })
      .then(async (response) => {
        const data = await response.json();
        return {
          ...data,
          status: response.status,
          ok: response.ok,
        };
      })
      .catch((error) => {
        console.error("Error submitting the test:", error);
        return { ok: false, message: "Network or server error" };
      });
    if (resp.ok) {
      toast(resp.message, { type: "success", position: "top-right" });
      navigate("/");
    } else {
      toast(resp.message, { type: "error", position: "top-right" });
    }
    setSubmittingTest(false);
    setIsWebcamActive(false);
    navigate('/')
  };

  // useEffect(() => {
  //   if (timeRemaining < 0) {
  //     submitTestHandler();
  //     navigate("/");
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [timeRemaining]);

  useEffect(() => {
    fetchTest();
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        localStorage.setItem("timeout", prev - 1);
        return prev - 1;
      });
    }, 1000);
    return () => {
      clearInterval(interval);
      deleteLocalStorageItemsExcept(["token", "timeout"]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderQuestionView = (question) => {
    switch (question.type) {
      case "coding":
        return <CodeEditor question={question} />;
      case "subjective":
        return (
          <TextField
            label="Your Answer"
            multiline
            rows={8}
            fullWidth
            value={answers[question._id] || ""}
            onChange={(e) => handleAnswerChange(question._id, e.target.value)}
          />
        );
      case "mcq":
        return (
          <RadioGroup
            value={answers[question._id] || ""}
            onChange={(e) => handleAnswerChange(question._id, e.target.value)}
          >
            {question.options.map((option, index) => (
              <FormControlLabel
                key={index}
                value={option}
                control={<Radio />}
                label={option}
              />
            ))}
          </RadioGroup>
        );
      default:
        return <Typography variant="body1">Unknown question type.</Typography>;
    }
  };

  return (
    <DisableDevTools>
      <FullscreenWrapper>
        {loading ? (
          <Box
            sx={{
              width: "100vw",
              height: "100vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress sx={{ mr: "1rem" }} /> Loading...
          </Box>
        ) : (
          <div className={styles.testContainer}>
            <Box display={"flex"} background="#1e1e1e" justifyContent="space-between">
              <Tabs
                value={value}
                onChange={handleChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="scrollable auto tabs example"
              >
                {test?.Question?.map((_, i) => {
                  return <Tab label={`Question ${i + 1}`} key={i} />;
                })}
              </Tabs>
              <Box display="flex" alignItems={"center"}>
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    pr: "1rem",
                    fontSize: "1.2rem",
                  }}
                >
                  Time Remaining:{" "}
                  {`${convertSecondsToHMS(timeRemaining).hours}:${convertSecondsToHMS(timeRemaining).minutes}:${convertSecondsToHMS(timeRemaining).seconds}`}
                </Box>
                {/* Webcam Feed */}
                {isWebcamActive && (
                  <Box
                    sx={{
                      position: "fixed",
                      bottom: "16px",
                      left: "16px",
                      width: "200px",
                      height: "150px",
                      border: "2px solid #000",
                      borderRadius: "8px",
                      overflow: "hidden",
                      zIndex: 9999,
                    }}
                  >
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      videoConstraints={{
                        width: 200,
                        height: 150,
                        facingMode: "user",
                      }}
                      screenshotFormat="image/jpeg"
                    />
                    <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0 }} />
                  </Box>
                )}
                <Box pr="0.5rem">
                  <Button
                    variant="contained"
                    onClick={() => setConfirmTestSubmission(true)}
                    color="success"
                  >
                    Submit Test
                  </Button>
                </Box>
              </Box>
            </Box>
            <Layout
              left={<QuestionViewer question={test?.Question[value]} />}
              right={renderQuestionView(test?.Question[value])}
            />
          </div>
        )}
        <Dialog
          open={confirmTestSubmission}
          onClose={() => setConfirmTestSubmission(false)}
        >
          <DialogTitle>Confirm Your Test Submission</DialogTitle>
          <DialogActions>
            <Button
              color="error"
              onClick={() => setConfirmTestSubmission(false)}
              disabled={submittingTest}
              variant="contained"
            >
              Cancel
            </Button>
            <Button
              // color="success"
              variant="contained"
              onClick={() => {
                setConfirmTestSubmission(false);
                submitTestHandler();
              }}
              disabled={submittingTest}
            >
              Submit Test
            </Button>
          </DialogActions>
        </Dialog>
      </FullscreenWrapper>
    </DisableDevTools>
  );
};

export default AttemptTest;
