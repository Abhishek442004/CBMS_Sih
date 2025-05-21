// import React, { useState } from "react";
// import GaugeChart from "react-gauge-chart";

// const Speedometer = () => {
//   const [value, setValue] = useState(50); // Initial value (can be updated dynamically)

//   const handleInputChange = (e) => {
//     const newValue = parseFloat(e.target.value);
//     if (!isNaN(newValue) && newValue >= 0 && newValue <= 100) {
//       setValue(newValue);
//     }
//   };

//   return (
//     <div style={{ textAlign: "center", padding: "20px" }}>
//       <h1>Speedometer Chart</h1>
//       <GaugeChart
//         id="gauge-chart"
//         nrOfLevels={30} // Number of levels in the chart
//         percent={value / 100} // The percentage value (0.0 to 1.0)
//         textColor="#000"
//         needleColor="#345243"
//         colors={["#FF5F6D", "#FFC371", "#28a745"]} // Gradient colors for the chart
//       />
//       <div style={{ marginTop: "20px" }}>
//         <label htmlFor="value" style={{ marginRight: "10px" }}>
//           Update Value (0 - 100):
//         </label>
//         <input
//           type="number"
//           id="value"
//           value={value}
//           onChange={handleInputChange}
//           style={{ padding: "5px", width: "80px" }}
//         />
//       </div>
//     </div>
//   );
// };

// export default Speedometer;
