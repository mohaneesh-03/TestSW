import React, { useState } from "react";
import FormLayout from "../Components/Layout/FormLayout";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import styles from "./LandingPage.module.scss";
import { useNavigate } from "react-router-dom";
import { Box} from "@mui/material";
// import Typography from "@mui/material";
import bitsplogo from '../bitsplogo.png'

const TestForm = () => {
  const navigate = useNavigate();
  const [testCode, setTestCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const submitHandler = (e) => {
    e.preventDefault();
    localStorage.setItem("user", JSON.stringify({name, email}))
    localStorage.setItem("testCode", testCode);
    navigate("/code");
  };
  return (
    <Box className={styles.testForm} sx={{ position: "relative" }}>
      <Button
        sx={{ position: "absolute", top: "1rem", right: "1rem" }}
        variant="outlined"
        color="primary"
        onClick={() => {
          navigate("/login");
        }}
      >
        Creator
      </Button>
      <Box
        sx={{
          // margin: 'px, 10px',
          mb: '2rem',
          padding: '30px 24px', // Top/Bottom: 16px, Left/Right: 24px
          backgroundColor: '#1976d2', // Material-UI primary blue color
          color: '#fff', // White text
          textAlign: 'center', // Center align text
          borderRadius: '8px', // Rounded corners
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Subtle shadow for elevation
          fontWeight: 'bold', // Bold text
          fontSize: '1.5rem', // Font size
        }}
      >BITS TEST SITE</Box>
      <Box>

      </Box>
      <form onSubmit={submitHandler} style={{ width: "100%" }}>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          required
          fullWidth
          sx={{ mb: "2rem" }}
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          required
          fullWidth
          sx={{ mb: "2rem" }}
        />
        <TextField
          label="Enter Test Code"
          value={testCode}
          onChange={(e) => {
            setTestCode(e.target.value);
          }}
          required
          fullWidth
          sx={{ mb: "2rem" }}
        />
        <Button variant="contained" type="submit" fullWidth>
          Submit
        </Button>
      </form>
    </Box>
  );
};

const LandingPage = () => {
  return (
    <FormLayout
      image_url="https://images.shiksha.com/mediadata/images/1579757643phpEK1frD.jpeg"
      style={{
        backgroundSize: 'contain', // Adjust image scaling
        backgroundRepeat: 'no-repeat', // Prevent repeating
        backgroundPosition: 'center', // Center the image
        height: '20px', // Set the height
        width: '40px', // Set the width
      }}
    >
      <TestForm />
    </FormLayout>
  );
};

export default LandingPage;
