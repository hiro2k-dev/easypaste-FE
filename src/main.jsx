import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import SessionPage from "./SessionPage.jsx";
import HomePage from "./HomePage.jsx";
import ReactGA from "react-ga4";

const GA_CODE = import.meta.env.VITE_GA_CODE;
ReactGA.initialize(`G-${GA_CODE}`);
ReactGA.send("pageview");
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/:code" element={<SessionPage />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);
