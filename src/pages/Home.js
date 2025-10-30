// import React from "react";
// import { Link } from "react-router-dom"; 
// import "./Home.css";
// import motor_img from "../assets/motor.png";
// import FeedbackForm from "./FeedbackForm";


// function Home() {
//   return (
//     <div className="homepage">
//       <nav className="navbar">
//         <div className="logo">
//           <h1>Motor Monitoring System</h1>
//         </div>
//         <div className="main-navbar">
//         <ul className=" nav-links">
//           <li>
//             <Link to="/"  className="homebtn">Home</Link>
//           </li>
//           <li>
//             <Link to="/motor" className="motorsbtn">Motors</Link> 
//           </li>
//           <li>
//              <Link to="/about" className="aboutbtn">About Us</Link>
//          </li>
//         </ul></div>
//         <Link to="/sign-in">
//         <button className="sign-in">Sign In</button></Link>
//       </nav>



//       {/* Main Section */}
//       <div className="main-section">
//         <div className="text-content">
//           <h2>
//             Let's Make <br /> <span className="highlight">Motor Monitoring </span>
//             <br />an easier task.
//           </h2>
//           <Link to="/motor"> 
//           <button className="get-started">Get Started →</button> </Link> 
//         </div>
//         <div className="image-content">
//           <img
//             src={motor_img}
//             alt="motor-img"
//             className="motor-img"
//           />
//         </div>
//       </div>
//      { /* Our vision Section */}
//       <div className="vision">
//         <h1>Our Vision</h1>
//         <p>
//         "We envision a future where industrial motors think, adapt, and thrive. By fusing intelligent IoT systems with the power of machine learning, our platform transforms traditional motor monitoring into a proactive, self-aware ecosystem. With real-time fault detection, predictive insights, and seamless connectivity, we empower industries to move from reactive maintenance to predictive excellence — enhancing safety, boosting efficiency, and extending machine lifecycles. We’re not just monitoring motors — we’re redefining the intelligence behind every rotation."</p>
//       </div>
//       <footer className="footer">
//       <div className="feedback">
//         <FeedbackForm />
   
//        </div>
//         <p className="teamCredit">
//           Designed and Developed by <strong style={{color:"red"}}>Team Voltaces</strong>
//         </p>
        
//       </footer>
//     </div>
//   );
// }

// export default Home;































import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import motor_img from "../assets/motor.png";
import FeedbackForm from "./FeedbackForm";

function Home() {
  return (
    <div className="homepage">
      {/* Background video with blur overlay */}
      <video className="background-video" autoPlay loop muted playsInline>
        <source src="/CBMS_BG.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="video-overlay" />

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <h1>Motor Monitoring System</h1>
        </div>
        <ul className="nav-links">
          <li><Link to="/" className="nav-btn">Home</Link></li>
          <li><Link to="/motor" className="nav-btn">Motors</Link></li>
          <li><Link to="/about" className="nav-btn">About Us</Link></li>
        </ul>
        <Link to="/sign-in"><button className="sign-in">Sign In</button></Link>
      </nav>

      {/* Main Section */}
      <div className="main-section fade-in-up">
        <div className="text-content fade-in-left">
          <h2>
            Let's Make <br />
            <span className="highlight">Motor Monitoring</span><br /> Smarter and Simpler.
          </h2>
          <Link to="/motor"><button className="get-started">Get Started →</button></Link>
        </div>
        <div className="image-content fade-in-right">
          <img src={motor_img} alt="motor-img" className="motor-img" />
        </div>
      </div>

      {/* Vision */}
      <div className="vision">
        <h1>Our Vision</h1>
        <p>
          We envision a future where industrial motors think, adapt, and thrive. By fusing intelligent IoT systems with machine learning, our platform transforms traditional motor monitoring into a proactive, self-aware ecosystem. With real-time fault detection, predictive insights, and seamless connectivity, we empower industries to move from reactive maintenance to predictive excellence — redefining the intelligence behind every rotation.
        </p>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="feedback">
          <FeedbackForm />
        </div>
        <p className="teamCredit">Designed and Developed by <strong>MAS</strong></p>
      </footer>
    </div>
  );
}

export default Home;

