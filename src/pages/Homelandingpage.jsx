import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TopHeader from "../components/TopHeader.jsx";
import Home from "../components/Home/Home.jsx";
import Aboutlanding from "./Aboutlanding.jsx";


export default function App() {
  return (
    <>
    <TopHeader/>
      <Navbar />
      <main className="main-content">

           <Home /> 

      </main>
     
      <Footer />
      </>
   
  );
}
