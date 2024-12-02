import React, { useState, useEffect } from "react";
import {
    Box,
    Card,
    CardContent,
    Divider,
    Grid,
  } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress } from "@mui/material";
import { useParams } from "react-router-dom";

const ViewResult = () => {
  const {testId} = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        console.log(testId);
        const response = await fetch(`http://localhost:5000/results/get?testId=${testId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch results");
        }
        const data = await response.json();

        setResults(data.data);
        console.log(data.data); // Adjust based on your API response format
      } catch (error) {
        console.error("Error fetching results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
    console.log(results)
  }, []);


  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Test Results for <strong>{testId}</strong>
      </Typography>
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
          }}
        >
          <CircularProgress />
          <Typography variant="body1" sx={{ marginLeft: '1rem' }}>
            Loading...
          </Typography>
        </Box>
      ) : (
        <Box>
          {results.length > 0 ? (
            results.map((candidate, index) => (
              <Card key={index} sx={{ marginBottom: '1.5rem', borderRadius: '8px' }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Candidate: {candidate.name}
                  </Typography>
                  <Divider sx={{ marginBottom: '1rem' }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>Email:</strong> {candidate.email}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>Score:</strong> {candidate.score}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>Test:</strong> {candidate.testName}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))
          ) : (
            <Box
              sx={{
                textAlign: 'center',
                padding: '2rem',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <Typography variant="h6" color="textSecondary">
                No results available for this test.
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ViewResult;
