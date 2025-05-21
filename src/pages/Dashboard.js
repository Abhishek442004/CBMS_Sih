import React, { useState, useEffect } from "react";
import GaugeChart from "react-gauge-chart";
import io from "socket.io-client";
import MQTTPage from "./MQTTPage";

// Connect to the backend server
const socket = io("http://localhost:5000");

const Dashboard = () => {
  const [dataString, setDataString] = useState(
    "RPM: 0, Temperature: 0°C, Peak Acceleration: 0 m/s², SoundDB: 0 db, Volts: 0 V, Current: 0.0000 A, Power: 0.00 W, Humidity: 0 %, MotorId: M1"
  );

  // Listen to MQTT data updates from the backend
  useEffect(() => {
    socket.on("mqttData", (message) => {
      setDataString(message); // Update the state with new data
    });

    // Cleanup the socket listener on unmount
    return () => socket.off("mqttData");
  }, []);

  // Extract individual parameter values from the string
  const extractParameter = (str, key) => {
    const match = str.match(new RegExp(`${key}\\s*:\\s*([\\d.]+)`, "i"));
    return match ? parseFloat(match[1]) || 0 : 0; // Return 0 if NaN or not found
  };

  // Define individual speedometer configurations for each parameter
  const parameterConfigs = [
    {
      key: "RPM",
      label: "Engine RPM",
      max: 4000,
      green: 3000,
      orange: 3500,
      units: "rpm",
    },
    {
      key: "Temperature",
      label: "Temperature",
      max: 100,
      green: 45,
      orange: 55,
      units: "°C",
    },
    {
      key: "Peak Acceleration",
      label: "Peak Acceleration",
      max: 5,
      green: 2.5,
      orange: 4.0,
      units: "m/s²",
    },
    {
      key: "SoundDB",
      label: "Sound Decibel",
      max: 120,
      green: 101.52526,
      orange: 104.24451,
      units: "db",
    },
    {
      key: "Volts",
      label: "Voltage",
      max: 300,
      green: 240,
      orange: 250,
      units: "V",
    },
    {
      key: "Current",
      label: "Current",
      max: 5,
      green: 3,
      orange: 4,
      units: "A",
    },
    {
      key: "Power",
      label: "Power",
      max: 1000,
      green: 750,
      orange: 800,
      units: "W",
    },
    {
      key: "Humidity",
      label: "Humidity",
      max: 100,
      green: 50,
      orange: 65,
      units: "%",
    },
  ];
  return (
    <div style={{background: "#d5daff", padding: "0px" , display: "flex",flexDirection: "column", justifyItems: "center", alignItems: "center"}}>         
    <div style={{width: "100%",  display: "flex", flexDirection: "column", justifyItems: "center", alignItems: "center" , marginBottom: "50px"}}>
      <h1 style={{ color: "white", fontFamily: "sans-serif",fontSize: "45px", fontWeight: "800", padding: "20px 0px", margin: "0px 0px 20px", width: "100%",textAlign: "center", background: "#152034"}}>Parameters Dashboard</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(350px, 1fr))",
          gap: "20px",
        }}
      >
        {parameterConfigs.map(({ key, label, max, green, orange, units }) => {
          let value = extractParameter(dataString, key);
          value = Math.min(Math.max(value, 0), max); // Clamp value to [0, max]
          const normalizedValue = value / max; // Normalize for gauge chart (0 to 1)

          return (
            <div key={key} style={{ textAlign: "center" }}>
              <h3>{label}</h3>
              <GaugeChart
                id={`gauge-chart-${key}`}
                nrOfLevels={30}
                arcsLength={[
                  green / max,
                  (orange - green) / max,
                  (max - orange) / max,
                ]}
                colors={["#00FF00", "#FFA500", "#FF0000"]} // Green, Orange, Red
                percent={normalizedValue} // Current value
                arcPadding={0.02}
                needleColor="#345243"
                textColor="#000000"
                // formatTextValue={() => ""} 
                formatTextValue={(value) => `${((value/100) * max).toFixed(2)} ${units}` }

              />
              <p>
                Value: {value.toFixed(2)} {units} / Max: {max} {units}
              </p>
            </div>
          );
        })}
      </div>
    </div>
    <div style={{width: "100%"}}><MQTTPage /></div>
    </div>
  );
};

export default Dashboard;
