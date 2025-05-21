import React, { useState } from "react";
import emailjs from "@emailjs/browser";

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    feedback: "",
  });

  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { name, email, feedback } = formData;

    if (!name || !email || !feedback) {
      setStatus("Please fill in all fields.");
      return;
    }

    emailjs
  .send(
    "service_9wgn4if", // Replace with your EmailJS Service ID (not your email address)
    "template_6aavien", // Replace with your EmailJS Template ID
    {
      name: formData.name,
      email: formData.email,
      message: formData.feedback,
    },
    "L382GWQZ9NgwlH3QJ" // Replace with your EmailJS User ID
  )
  .then(
    (result) => {
      console.log(result.text);
      setStatus("Feedback sent successfully!");
      setFormData({ name: "", email: "", feedback: "" });
    },
    (error) => {
      console.error(error.text);
      setStatus("Failed to send feedback. Please try again.");
    }
  );

  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{textAlign:"center"}}>Feedback Form</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter Your Name"
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter Your Email ID"
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="feedback">Feedback:</label>
          <textarea
            id="feedback"
            name="feedback"
            value={formData.feedback}
            onChange={handleChange}
            placeholder="Please Write Your Valuable Feedback Here ..."
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          ></textarea>
        </div>
        <div style={{ width:"100%" , textAlign: "center" }}
        ><button type="submit" style={{ padding: "10px 20px" }}>
          Submit
        </button></div>
      </form>
      {status && <p style={{ marginTop: "20px" }}>{status}</p>}
    </div>
  );
};

export default FeedbackForm;
