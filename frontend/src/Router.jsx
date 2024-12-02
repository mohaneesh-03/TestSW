import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import AttemptTest from "./Pages/AttemptTest";
import CreateTest from "./Pages/CreateTest";
import CreatorLogin from "./Pages/CreatorLogin";
import LandingPage from "./Pages/LandingPage";
import Results from "./Pages/Results";
import CreatorDashboard from "./Pages/CreatorDashboard";
import ViewResult from "./Pages/ViewResults"

const Router = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/result" element={<Results />} />
        <Route path="/tests/:testId/results" element={<ViewResult/>} />
        <Route path="/dash" element={<CreatorDashboard/>}/>
        <Route path="/createTest" element={<CreateTest />} />
        <Route path="/code" element={<AttemptTest />} />
        <Route path="/login" element={<CreatorLogin />} />
        <Route path="/" element={<LandingPage />} />
      </>
    )
  );

  return <RouterProvider router={router} />;
};

export default Router;
