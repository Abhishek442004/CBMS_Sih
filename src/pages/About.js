import React from "react";
import {
  Activity,
  Target,
  Eye,
  BookOpen,
  Zap,
  Brain,
  Bell,
  Cloud,
  TrendingUp,
  Shield,
} from "lucide-react";
import "../pages/About.css";

const AboutUs = () => {
  const features = [
    {
      icon: Activity,
      title: "Real-Time Monitoring",
      desc: "Continuously track parameters such as vibration, temperature, humidity, or voltage using IoT sensors.",
    },
    {
      icon: Brain,
      title: "Predictive Maintenance",
      desc: "Identify potential failures before they occur, reducing maintenance costs and downtime.",
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      desc: "Automatically notify operators or local users via SMS, app, or dashboard notifications.",
    },
    {
      icon: Cloud,
      title: "Centralized Dashboard",
      desc: "View, analyze, and manage data from multiple ESP32 devices in one unified platform.",
    },
    {
      icon: TrendingUp,
      title: "Scalability",
      desc: "Easily expand monitoring across multiple locations with minimal setup effort.",
    },
  ];

  const whyChoose = [
    "Built on reliable ESP32 IoT architecture",
    "Low power consumption and wireless data transmission",
    "Modular and customizable — fits various industries",
    "Real-time alerts and cloud connectivity",
    "Designed for cost efficiency and rapid deployment",
  ];


  //https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-futuristic-devices-10-large.mp4
  return (
    <div className="about-container">
      {/* Background Video */}
      <div className="background-video">
        <video autoPlay loop muted playsInline>
          <source
            src="/AboutUs_BG.mp4"
            type="video/mp4"
          />
        </video>
        <div className="overlay"></div>
      </div>

      {/* Main Content */}
      <div className="content">
        {/* Hero */}
        <div className="hero-section">
          <div className="hero-logo">
            <Shield className="icon" />
            <span>CBMS</span>
          </div>
          <h1>Condition-Based Monitoring System</h1>
          <p>
            An innovative IoT solution designed to monitor the health and
            performance of machines, equipment, and environments in real time.
          </p>
        </div>

        {/* Mission and Vision */}
        <div className="mission-vision">
          <div className="card blue">
            <div className="card-header">
              <Target className="icon" />
              <h2>Our Mission</h2>
            </div>
            <p>
              To revolutionize condition monitoring through affordable, scalable
              IoT technology — empowering industries and communities to predict
              failures, prevent losses, and protect their assets using real-time
              data.
            </p>
          </div>

          <div className="card purple">
            <div className="card-header">
              <Eye className="icon" />
              <h2>Our Vision</h2>
            </div>
            <p>
              To build a world where every machine can sense, analyze, and
              communicate its condition — creating a smarter and safer ecosystem
              powered by connected intelligence.
            </p>
          </div>
        </div>

        {/* Our Story */}
        <div className="story-card">
          <div className="card-header">
            <BookOpen className="icon" />
            <h2>Our Story</h2>
          </div>
          <p>
            CBMS began as a SMART INDIA HACKATHON PROJECT 2024 driven by a passion for IoT
            innovation and real-world problem-solving. Our team recognized how
            traditional maintenance methods were often reactive — leading to
            downtime, losses, and safety risks. So we set out to design a smart,
            low-cost, and connected solution that continuously monitors
            equipment conditions, analyzes data, and sends instant alerts
            whenever abnormalities occur.
          </p>
          <p>
            Today, CBMS has evolved into a scalable monitoring platform capable
            of supporting multiple devices across different regions — providing
            reliable insights that enable informed decisions.
          </p>
        </div>

        {/* What We Do */}
        <div className="what-we-do">
          <h2>What We Do</h2>
          <div className="feature-grid">
            {features.map((feature, idx) => (
              <div key={idx} className="feature-card">
                <div className="feature-icon">
                  <feature.icon className="icon" />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose */}
        <div className="why-choose">
          <div className="card-header">
            <Zap className="icon" />
            <h2>Why Choose CBMS</h2>
          </div>
          <div className="choose-list">
            {whyChoose.map((item, idx) => (
              <div key={idx} className="choose-item">
                <span className="dot"></span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Goal */}
        <div className="goal-section">
          <h2>Our Goal</h2>
          <p>
            To make predictive maintenance accessible to everyone — from small
            workshops to large industries — using smart IoT systems that think,
            monitor, and protect.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
