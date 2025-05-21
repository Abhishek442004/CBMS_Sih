import React from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom for navigation
import "./Home.css";
import motor_img from "../assets/motor.png";
import FeedbackForm from "./FeedbackForm";
// import Mlresponse from "./Mlresponse";

function Home() {
  return (
    <div className="homepage">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <h1>Motor Monitoring System</h1>
        </div>
        <div className="main-navbar">
        <ul className=" nav-links">
          <li>
            <Link to="/"  className="homebtn">Home</Link>
          </li>
          <li>
            <Link to="/motor" className="motorsbtn">Motors</Link> {/* Link to Homepage */}
          </li>
          <li>
             <Link to="/about" className="aboutbtn">About Us</Link>
         </li>
        </ul></div>
        <Link to="/sign-in">
        <button className="sign-in">Sign In</button></Link>
      </nav>

      {/* Main Section */}
      <div className="main-section">
        <div className="text-content">
          <h2>
            Let's Make <br /> <span className="highlight">Motor Monitoring </span>
            <br />an easier task.
          </h2>
          <Link to="/motor"> 
          <button className="get-started">Get Started →</button> </Link> 
        </div>
        <div className="image-content">
          <img
            src={motor_img}
            alt="motor-img"
            className="motor-img"
          />
        </div>
      </div>
     { /* Our vision Section */}
      <div className="vision">
        <h1>Our Vision</h1>
        <p>
        Our vision is to revolutionize motor condition monitoring through cutting-edge IoT and machine learning technologies. By integrating advanced sensors, seamless IoT communication, and AI-driven insights, we aim to provide a robust, real-time solution for fault detection and performance optimization. Our platform aspires to enhance operational efficiency, ensure safety, and extend the lifespan of motors across industries, setting a benchmark for intelligent, connected systems in the realm of industrial automation. 
      </p>
      </div>
      <footer className="footer">
      <div className="feedback">
        <FeedbackForm />
   
       </div>
        <p className="teamCredit">
          Designed and Developed by <strong>Team Voltaces</strong>
        </p>
        
      </footer>
    </div>
  );
}

export default Home;
