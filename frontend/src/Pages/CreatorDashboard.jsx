import React, { useEffect, useState } from "react";
import { Button, Box, Table, TableBody, TableCell, TableRow, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { get } from "../utils/request"; // Your utility for making GET requests

const CreatorDashboard = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchTests = async () => {
    try {
        const response = await fetch("http://localhost:5000/tests/get", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token if needed
          },
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch tests");
        }
  
        const data = await response.json();
        setTests(data.data || []); // Assuming the response has a `data` field containing the tests
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Your Tests
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/createtest")} // Navigate to Create Test page
        sx={{ mb: 3 }}
      >
        Create New Test
      </Button>
      {tests.length > 0 ? (
        <Table>
          <TableBody>
            {tests.map((test) => (
              <TableRow key={test._id}>
                <TableCell>{test.name}</TableCell>
                <TableCell>{test.createdAt}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => navigate(`/tests/${test._id}/results`)} // Navigate to view results
                  >
                    View Results
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Typography variant="body1">No tests available. Create a new one!</Typography>
      )}
    </Box>
  );
};

export default CreatorDashboard;
