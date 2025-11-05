import React, { useState, useEffect } from "react";
import GaugeChart from "react-gauge-chart";
import io from "socket.io-client";
import MQTTPage from "./MQTTPage";
import "./Dashboard.css";  // ✅ NEW CSS FILE

// Connect to backend
const socket = io("https://cbms-backend.onrender.com");

const Dashboard = () => {
  const [dataJson, setDataJson] = useState({});

  useEffect(() => {
    socket.on("mqttData", (message) => {
      try {
        const parsed = typeof message === "string" ? JSON.parse(message) : message;
        setDataJson(parsed);
      } catch (err) {
        console.error("Failed to parse MQTT data", err);
      }
    });

    return () => socket.off("mqttData");
  }, []);

  const parameterConfigs = [
    { key: "RPM", label: "Engine RPM", max: 4000, green: 3000, orange: 3500, units: "rpm" },
    { key: "Current_PhaseA", label: "Current Phase A", max: 10, green: 5, orange: 7.5, units: "A" },
    { key: "Current_PhaseB", label: "Current Phase B", max: 10, green: 5, orange: 7.5, units: "A" },
    { key: "Current_PhaseC", label: "Current Phase C", max: 10, green: 5, orange: 7.5, units: "A" },
    { key: "Voltage_PhaseA", label: "Voltage Phase A", max: 300, green: 240, orange: 270, units: "V" },
    { key: "Voltage_PhaseB", label: "Voltage Phase B", max: 300, green: 240, orange: 270, units: "V" },
    { key: "Voltage_PhaseC", label: "Voltage Phase C", max: 300, green: 240, orange: 270, units: "V" },
    { key: "Temperature", label: "Temperature", max: 100, green: 45, orange: 55, units: "°C" },
    { key: "Vibration_X", label: "Vibration X", max: 5, green: 2, orange: 4, units: "m/s²" },
    { key: "Vibration_Y", label: "Vibration Y", max: 5, green: 2, orange: 4, units: "m/s²" },
    { key: "Vibration_Z", label: "Vibration Z", max: 5, green: 2, orange: 4, units: "m/s²" },
    { key: "Acoustic", label: "Acoustic", max: 120, green: 101.52526, orange: 104.24451, units: "db" },
  ];

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Parameters Dashboard</h1>

      <div className="gauge-grid">
        {parameterConfigs.map(({ key, label, max, green, orange, units }) => {
          let value = parseFloat(dataJson[key]) || 0;
          value = Math.min(Math.max(value, 0), max);
          const normalizedValue = value / max;

          return (
            <div key={key} className="gauge-card">
              <h3 className="gauge-label">{label}</h3>

              <GaugeChart
                id={`gauge-chart-${key}`}
                nrOfLevels={50}
                arcsLength={[green / max, (orange - green) / max, (max - orange) / max]}
                colors={["#4CAF50", "#D4A017", "#D9534F"]} // ✅ Matte Colors
                percent={normalizedValue}
                arcPadding={0.02}
                needleColor="#E6E6E6"
                needleBaseColor="#111"
                textColor="#E6E6E6"
                formatTextValue={() => `${value.toFixed(2)} ${units}`}
              />

              <p className="gauge-value">
                {value.toFixed(2)} {units} / {max} {units}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mqtt-section">
        <MQTTPage />
      </div>
    </div>
  );
};

export default Dashboard;










// import React, { useState, useEffect } from "react";
// import GaugeChart from "react-gauge-chart";
// import io from "socket.io-client";
// import MQTTPage from "./MQTTPage";

// // Connect to the backend server
// const socket = io("https://cbms-backend.onrender.com");

// const Dashboard = () => {
//   const [dataJson, setDataJson] = useState({});

//   // Listen to MQTT data updates from the backend
//   useEffect(() => {
//     socket.on("mqttData", (message) => {
//       try {
//         const parsed = JSON.parse(message);
//         setDataJson(parsed);
//       } catch (err) {
//         console.error("Failed to parse MQTT data as JSON", err);
//       }
//     });

//     // Cleanup the socket listener on unmount
//     return () => socket.off("mqttData");
//   }, []);

//   const parameterConfigs = [
//     { key: "RPM", label: "Engine RPM", max: 4000, green: 3000, orange: 3500, units: "rpm" },
//     { key: "Current_PhaseA", label: "Current Phase A", max: 10, green: 5, orange: 7.5, units: "A" },
//     { key: "Current_PhaseB", label: "Current Phase B", max: 10, green: 5, orange: 7.5, units: "A" },
//     { key: "Current_PhaseC", label: "Current Phase C", max: 10, green: 5, orange: 7.5, units: "A" },
//     { key: "Voltage_PhaseA", label: "Voltage Phase A", max: 300, green: 240, orange: 270, units: "V" },
//     { key: "Voltage_PhaseB", label: "Voltage Phase B", max: 300, green: 240, orange: 270, units: "V" },
//     { key: "Voltage_PhaseC", label: "Voltage Phase C", max: 300, green: 240, orange: 270, units: "V" },
//     { key: "Temperature", label: "Temperature", max: 100, green: 45, orange: 55, units: "°C" },
//     { key: "Vibration_X", label: "Vibration X", max: 5, green: 2, orange: 4, units: "m/s²" },
//     { key: "Vibration_Y", label: "Vibration Y", max: 5, green: 2, orange: 4, units: "m/s²" },
//     { key: "Vibration_Z", label: "Vibration Z", max: 5, green: 2, orange: 4, units: "m/s²" },
//     { key: "Acoustic", label: "Acoustic", max: 120, green: 101.52526, orange: 104.24451, units: "db" },
//   ];

//   return (
//     <div style={{ background: "#d5daff", padding: "0px", display: "flex", flexDirection: "column", justifyItems: "center", alignItems: "center" }}>
//       <div style={{ width: "100%", display: "flex", flexDirection: "column", justifyItems: "center", alignItems: "center", marginBottom: "50px" }}>
//         <h1 style={{ color: "white", fontFamily: "sans-serif", fontSize: "45px", fontWeight: "800", padding: "20px 0px", margin: "0px 0px 20px", width: "100%", textAlign: "center", background: "#152034" }}>Parameters Dashboard</h1>
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(4, minmax(350px, 1fr))",
//             gap: "20px",
//           }}
//         >
//           {parameterConfigs.map(({ key, label, max, green, orange, units }) => {
//             let value = parseFloat(dataJson[key]) || 0;
//             value = Math.min(Math.max(value, 0), max);
//             const normalizedValue = value / max;

//             return (
//               <div key={key} style={{ textAlign: "center" }}>
//                 <h3>{label}</h3>
//                 <GaugeChart
//                   id={`gauge-chart-${key}`}
//                   nrOfLevels={30}
//                   arcsLength={[green / max, (orange - green) / max, (max - orange) / max]}
//                   colors={["#00FF00", "#FFA500", "#FF0000"]}
//                   percent={normalizedValue}
//                   arcPadding={0.02}
//                   needleColor="#345243"
//                   textColor="#000000"
//                   formatTextValue={() => `${value.toFixed(2)} ${units}`}
//                 />
//                 <p>
//                   Value: {value.toFixed(2)} {units} / Max: {max} {units}
//                 </p>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//       <div style={{ width: "100%" }}><MQTTPage /></div>
//     </div>
//   );
// };

// export default Dashboard;

