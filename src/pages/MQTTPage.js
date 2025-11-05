import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import { Line } from "react-chartjs-2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import "./MQTTPage_dark.css";

ChartJS.register(annotationPlugin);
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const socket = io("https://cbms-backend.onrender.com");

function MQTTPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [timeLabels, setTimeLabels] = useState([]);

  // State for all sensor data arrays
  const [rpmData, setRpmData] = useState([]);
  const [currentPhaseAData, setCurrentPhaseAData] = useState([]);
  const [currentPhaseBData, setCurrentPhaseBData] = useState([]);
  const [currentPhaseCData, setCurrentPhaseCData] = useState([]);
  const [voltagePhaseAData, setVoltagePhaseAData] = useState([]);
  const [voltagePhaseBData, setVoltagePhaseBData] = useState([]);
  const [voltagePhaseCData, setVoltagePhaseCData] = useState([]);
  const [temperatureData, setTemperatureData] = useState([]);
  const [vibrationXData, setVibrationXData] = useState([]);
  const [vibrationYData, setVibrationYData] = useState([]);
  const [vibrationZData, setVibrationZData] = useState([]);
  const [acousticData, setAcousticData] = useState([]);

  const [realTimeCondition, setRealTimeCondition] = useState("Calculating...");
  const [defectPrediction, setDefectPrediction] = useState("Calculating defect...");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    socket.on("mqttData", async (message) => {
      try {
        // Parse JSON data
        const jsonData = typeof message === "string" ? JSON.parse(message) : message;
        setData(jsonData);
      } catch (error) {
        console.error("Error parsing JSON data:", error);
        setData(message); // fallback to original message
      }
    });

    return () => socket.off("mqttData");
  }, []);

  useEffect(() => {
    if (!data) return;

    try {
      const currentTime = new Date().toLocaleTimeString();

      // Update time labels
      setTimeLabels((prev) => [...prev, currentTime].slice(-50));

      // Update all sensor data arrays
      setRpmData((prev) => [...prev, data.RPM || 0].slice(-50));
      setCurrentPhaseAData((prev) => [...prev, data.Current_PhaseA || 0].slice(-50));
      setCurrentPhaseBData((prev) => [...prev, data.Current_PhaseB || 0].slice(-50));
      setCurrentPhaseCData((prev) => [...prev, data.Current_PhaseC || 0].slice(-50));
      setVoltagePhaseAData((prev) => [...prev, data.Voltage_PhaseA || 0].slice(-50));
      setVoltagePhaseBData((prev) => [...prev, data.Voltage_PhaseB || 0].slice(-50));
      setVoltagePhaseCData((prev) => [...prev, data.Voltage_PhaseC || 0].slice(-50));
      setTemperatureData((prev) => [...prev, data.Temperature || 0].slice(-50));
      setVibrationXData((prev) => [...prev, data.Vibration_X || 0].slice(-50));
      setVibrationYData((prev) => [...prev, data.Vibration_Y || 0].slice(-50));
      setVibrationZData((prev) => [...prev, data.Vibration_Z || 0].slice(-50));
      setAcousticData((prev) => [...prev, data.Acoustic || 0].slice(-50));

      // Threshold monitoring (kept as-is)
      const avgCurrent =
        ((data.Current_PhaseA || 0) + (data.Current_PhaseB || 0) + (data.Current_PhaseC || 0)) / 3;
      const avgVoltage =
        ((data.Voltage_PhaseA || 0) + (data.Voltage_PhaseB || 0) + (data.Voltage_PhaseC || 0)) / 3;

      if (avgCurrent > 3) {
        alert(`Alert: Average Current (${avgCurrent.toFixed(2)} A) exceeds the threshold of 3 A.`);
      }

      if (avgVoltage > 240) {
        alert(`Alert: Average Voltage (${avgVoltage.toFixed(2)} V) exceeds the threshold of 240 V.`);
      }

      if ((data.Temperature || 0) > 55) {
        alert(`Alert: Overheating! Temperature: ${data.Temperature}°C`);
      }
    } catch (error) {
      console.error("Error processing data:", error);
    }
  }, [data]);

  const determineCondition = (temperature, vibrationMagnitude, acoustic) => {
    const tempCondition = temperature <= 45 ? "optimum" : temperature <= 55 ? "critical" : "danger";

    const vibrationCondition =
      vibrationMagnitude <= 2 ? "optimum" : vibrationMagnitude <= 4 ? "critical" : "danger";

    const soundCondition = acoustic <= 70 ? "optimum" : acoustic <= 85 ? "critical" : "danger";

    // Consolidate overall condition
    if (tempCondition === "danger" || vibrationCondition === "danger" || soundCondition === "danger") {
      return "danger";
    } else if (tempCondition === "optimum" && vibrationCondition === "optimum" && soundCondition === "optimum") {
      return "optimum";
    } else {
      return "critical";
    }
  };

  const fetchDefectPrediction = async (sensorData) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://cbms-ml-model.onrender.com/predict?Current_PhaseA=${sensorData.Current_PhaseA || 0}&Current_PhaseB=${sensorData.Current_PhaseB || 0}&Current_PhaseC=${sensorData.Current_PhaseC || 0}&RPM=${sensorData.RPM || 0}&Voltage_PhaseA=${sensorData.Voltage_PhaseA || 0}&Voltage_PhaseB=${sensorData.Voltage_PhaseB || 0}&Voltage_PhaseC=${sensorData.Voltage_PhaseC || 0}&Temperature=${sensorData.Temperature || 0}&Vibration_X=${sensorData.Vibration_X || 0}&Vibration_Y=${sensorData.Vibration_Y || 0}&Vibration_Z=${sensorData.Vibration_Z || 0}&Acoustic=${sensorData.Acoustic || 0}`
      );
      const result = await response.json();
      setDefectPrediction(result.prediction || "No defect information available");
    } catch (err) {
      setError("Failed to fetch defect prediction.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (data) {
      const temperature = data.Temperature || 0;
      const vibrationMagnitude = Math.sqrt(
        Math.pow(data.Vibration_X || 0, 2) + Math.pow(data.Vibration_Y || 0, 2) + Math.pow(data.Vibration_Z || 0, 2)
      );
      const acoustic = data.Acoustic || 0;

      const condition = determineCondition(temperature, vibrationMagnitude, acoustic);
      setRealTimeCondition(condition);

      if (condition === "danger") {
        alert("Warning! Motor health is in the danger zone!");
      }
      if (condition === "critical") {
        toast.error("Critical condition. Please monitor closely.");
      }

      fetchDefectPrediction(data);
    }
  }, [data]);

  const graphOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#D0D0D0",
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#A8A8A8" },
        grid: { color: "rgba(255,255,255,0.06)" },
        title: {
          display: true,
          text: "Time",
          color: "#C8C8C8",
        },
      },
      y: {
        ticks: { color: "#A8A8A8" },
        grid: { color: "rgba(255,255,255,0.06)" },
        title: {
          display: true,
          text: "Value",
          color: "#C8C8C8",
        },
      },
    },
  };

  return (
    <div className="mq-container">
      <ToastContainer />

      <div className="mq-header">
        <h1>MQTT Data for Booster Fan {id}</h1>
      </div>

      <div className="mq-top">
        <div className="mq-card mq-left">
          <table className="mq-table">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>RPM</td>
                <td>{data?.RPM || "N/A"}</td>
              </tr>
              <tr>
                <td>Temperature (°C)</td>
                <td>{data?.Temperature || "N/A"}</td>
              </tr>
              <tr>
                <td>Current Phase A (A)</td>
                <td>{data?.Current_PhaseA || "N/A"}</td>
              </tr>
              <tr>
                <td>Current Phase B (A)</td>
                <td>{data?.Current_PhaseB || "N/A"}</td>
              </tr>
              <tr>
                <td>Current Phase C (A)</td>
                <td>{data?.Current_PhaseC || "N/A"}</td>
              </tr>
              <tr>
                <td>Voltage Phase A (V)</td>
                <td>{data?.Voltage_PhaseA || "N/A"}</td>
              </tr>
              <tr>
                <td>Voltage Phase B (V)</td>
                <td>{data?.Voltage_PhaseB || "N/A"}</td>
              </tr>
              <tr>
                <td>Voltage Phase C (V)</td>
                <td>{data?.Voltage_PhaseC || "N/A"}</td>
              </tr>
              <tr>
                <td>Vibration X (m/s²)</td>
                <td>{data?.Vibration_X || "N/A"}</td>
              </tr>
              <tr>
                <td>Vibration Y (m/s²)</td>
                <td>{data?.Vibration_Y || "N/A"}</td>
              </tr>
              <tr>
                <td>Vibration Z (m/s²)</td>
                <td>{data?.Vibration_Z || "N/A"}</td>
              </tr>
              <tr>
                <td>Acoustic (dB)</td>
                <td>{data?.Acoustic || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mq-card mq-right">
          <h2>ML Response</h2>
          <div className="mq-ml">
            <div className="mq-ml-block">
              <h3>Motor Health Status</h3>
              {isLoading ? (
                <p className="mq-muted">Predicting motor health...</p>
              ) : error ? (
                <p className="mq-error">Error: {error}</p>
              ) : (
                <>
                  <p className="mq-status">Status: <span className={`mq-badge mq-${realTimeCondition}`}>{realTimeCondition}</span></p>
                  <p className="mq-status">Defect: <span className="mq-badge mq-info">{defectPrediction}</span></p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="mq-charts">
        <div className="mq-card">
          <h2>Temperature Vs Time</h2>
          <Line
            data={{
              labels: timeLabels,
              datasets: [
                {
                  label: "Temperature (°C)",
                  data: temperatureData,
                  borderColor: "#8B5CF6",
                  backgroundColor: "rgba(139, 92, 246, 0.25)",
                  fill: false,
                },
              ],
            }}
            options={{
              ...graphOptions,
              scales: {
                ...graphOptions.scales,
                y: { min: 0, max: 70, ticks: { color: "#A8A8A8" }, grid: { color: "rgba(255,255,255,0.06)" } },
              },
              plugins: {
                annotation: {
                  annotations: {
                    threshold: {
                      type: "line",
                      yMin: 55,
                      yMax: 55,
                      borderColor: "#EF4444",
                      borderWidth: 2,
                      label: {
                        content: "Threshold",
                        enabled: true,
                        position: "end",
                        color: "#E5E7EB",
                        backgroundColor: "#1F2937",
                      },
                    },
                  },
                },
              },
            }}
          />
        </div>

        <div className="mq-card">
          <h2>RPM Vs Time</h2>
          <Line
            data={{
              labels: timeLabels,
              datasets: [
                {
                  label: "RPM",
                  data: rpmData,
                  borderColor: "#60A5FA",
                  backgroundColor: "rgba(96, 165, 250, 0.25)",
                  fill: false,
                },
              ],
            }}
            options={{
              ...graphOptions,
              scales: {
                ...graphOptions.scales,
                y: { min: 0, max: 4000, ticks: { color: "#A8A8A8" }, grid: { color: "rgba(255,255,255,0.06)" } },
              },
              plugins: {
                annotation: {
                  annotations: {
                    threshold: {
                      type: "line",
                      yMin: 3500,
                      yMax: 3500,
                      borderColor: "#EF4444",
                      borderWidth: 2,
                      label: {
                        content: "Threshold",
                        enabled: true,
                        position: "end",
                        color: "#E5E7EB",
                        backgroundColor: "#1F2937",
                      },
                    },
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Three Phase Current Charts */}
      <div className="mq-charts grid-3">
        <div className="mq-card">
          <h2>Current Phase A Vs Time</h2>
          <Line
            data={{
              labels: timeLabels,
              datasets: [
                {
                  label: "Current Phase A (A)",
                  data: currentPhaseAData,
                  borderColor: "rgba(255, 99, 132, 1)",
                  backgroundColor: "rgba(255, 99, 132, 0.2)",
                  fill: false,
                },
              ],
            }}
            options={{
              ...graphOptions,
              scales: { ...graphOptions.scales, y: { min: 0, max: 6 } },
            }}
          />
        </div>

        <div className="mq-card">
          <h2>Current Phase B Vs Time</h2>
          <Line
            data={{
              labels: timeLabels,
              datasets: [
                {
                  label: "Current Phase B (A)",
                  data: currentPhaseBData,
                  borderColor: "rgba(54, 162, 235, 1)",
                  backgroundColor: "rgba(54, 162, 235, 0.2)",
                  fill: false,
                },
              ],
            }}
            options={{
              ...graphOptions,
              scales: { ...graphOptions.scales, y: { min: 0, max: 6 } },
            }}
          />
        </div>

        <div className="mq-card">
          <h2>Current Phase C Vs Time</h2>
          <Line
            data={{
              labels: timeLabels,
              datasets: [
                {
                  label: "Current Phase C (A)",
                  data: currentPhaseCData,
                  borderColor: "rgba(255, 206, 86, 1)",
                  backgroundColor: "rgba(255, 206, 86, 0.2)",
                  fill: false,
                },
              ],
            }}
            options={{
              ...graphOptions,
              scales: { ...graphOptions.scales, y: { min: 0, max: 6 } },
            }}
          />
        </div>
      </div>

      {/* Three Phase Voltage Charts */}
      <div className="mq-charts grid-3">
        <div className="mq-card">
          <h2>Voltage Phase A Vs Time</h2>
          <Line
            data={{
              labels: timeLabels,
              datasets: [
                {
                  label: "Voltage Phase A (V)",
                  data: voltagePhaseAData,
                  borderColor: "rgba(75, 192, 192, 1)",
                  backgroundColor: "rgba(75, 192, 192, 0.2)",
                  fill: false,
                },
              ],
            }}
            options={{
              ...graphOptions,
              scales: { ...graphOptions.scales, y: { min: 0, max: 300 } },
            }}
          />
        </div>

        <div className="mq-card">
          <h2>Voltage Phase B Vs Time</h2>
          <Line
            data={{
              labels: timeLabels,
              datasets: [
                {
                  label: "Voltage Phase B (V)",
                  data: voltagePhaseBData,
                  borderColor: "rgba(153, 102, 255, 1)",
                  backgroundColor: "rgba(153, 102, 255, 0.2)",
                  fill: false,
                },
              ],
            }}
            options={{
              ...graphOptions,
              scales: { ...graphOptions.scales, y: { min: 0, max: 300 } },
            }}
          />
        </div>

        <div className="mq-card">
          <h2>Voltage Phase C Vs Time</h2>
          <Line
            data={{
              labels: timeLabels,
              datasets: [
                {
                  label: "Voltage Phase C (V)",
                  data: voltagePhaseCData,
                  borderColor: "rgba(255, 159, 64, 1)",
                  backgroundColor: "rgba(255, 159, 64, 0.2)",
                  fill: false,
                },
              ],
            }}
            options={{
              ...graphOptions,
              scales: { ...graphOptions.scales, y: { min: 0, max: 300 } },
            }}
          />
        </div>
      </div>

      {/* Vibration Charts */}
      <div className="mq-charts grid-3">
        <div className="mq-card">
          <h2>Vibration X Vs Time</h2>
          <Line
            data={{
              labels: timeLabels,
              datasets: [
                {
                  label: "Vibration X (m/s²)",
                  data: vibrationXData,
                  borderColor: "rgba(255, 99, 132, 1)",
                  backgroundColor: "rgba(255, 99, 132, 0.2)",
                  fill: false,
                },
              ],
            }}
            options={{
              ...graphOptions,
              scales: { ...graphOptions.scales, y: { min: -5, max: 5 } },
            }}
          />
        </div>

        <div className="mq-card">
          <h2>Vibration Y Vs Time</h2>
          <Line
            data={{
              labels: timeLabels,
              datasets: [
                {
                  label: "Vibration Y (m/s²)",
                  data: vibrationYData,
                  borderColor: "rgba(54, 162, 235, 1)",
                  backgroundColor: "rgba(54, 162, 235, 0.2)",
                  fill: false,
                },
              ],
            }}
            options={{
              ...graphOptions,
              scales: { ...graphOptions.scales, y: { min: -5, max: 5 } },
            }}
          />
        </div>

        <div className="mq-card">
          <h2>Vibration Z Vs Time</h2>
          <Line
            data={{
              labels: timeLabels,
              datasets: [
                {
                  label: "Vibration Z (m/s²)",
                  data: vibrationZData,
                  borderColor: "rgba(255, 206, 86, 1)",
                  backgroundColor: "rgba(255, 206, 86, 0.2)",
                  fill: false,
                },
              ],
            }}
            options={{
              ...graphOptions,
              scales: { ...graphOptions.scales, y: { min: -5, max: 5 } },
            }}
          />
        </div>
      </div>

      {/* Acoustic Chart */}
      <div className="mq-charts">
        <div className="mq-card">
          <h2>Acoustic Level Vs Time</h2>
          <Line
            data={{
              labels: timeLabels,
              datasets: [
                {
                  label: "Acoustic (dB)",
                  data: acousticData,
                  borderColor: "rgba(75, 192, 192, 1)",
                  backgroundColor: "rgba(75, 192, 192, 0.2)",
                  fill: false,
                },
              ],
            }}
            options={{
              ...graphOptions,
              scales: { ...graphOptions.scales, y: { min: 0, max: 120 } },
              plugins: {
                annotation: {
                  annotations: {
                    threshold: {
                      type: "line",
                      yMin: 85,
                      yMax: 85,
                      borderColor: "#EF4444",
                      borderWidth: 2,
                      label: {
                        content: "Threshold",
                        enabled: true,
                        position: "end",
                        color: "#E5E7EB",
                        backgroundColor: "#1F2937",
                      },
                    },
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default MQTTPage;




































// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import io from "socket.io-client";
// import { Line } from "react-chartjs-2";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css"; 
// import {
//   Chart as ChartJS,
//   LineElement,
//   PointElement,
//   LinearScale,
//   CategoryScale,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import annotationPlugin from "chartjs-plugin-annotation";

// ChartJS.register(annotationPlugin);
// ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

// const socket = io("https://cbms-backend.onrender.com");

// function MQTTPage() {
//   const { id } = useParams();
//   const [data, setData] = useState(null);
//   const [timeLabels, setTimeLabels] = useState([]);
  
//   // State for all sensor data arrays
//   const [rpmData, setRpmData] = useState([]);
//   const [currentPhaseAData, setCurrentPhaseAData] = useState([]);
//   const [currentPhaseBData, setCurrentPhaseBData] = useState([]);
//   const [currentPhaseCData, setCurrentPhaseCData] = useState([]);
//   const [voltagePhaseAData, setVoltagePhaseAData] = useState([]);
//   const [voltagePhaseBData, setVoltagePhaseBData] = useState([]);
//   const [voltagePhaseCData, setVoltagePhaseCData] = useState([]);
//   const [temperatureData, setTemperatureData] = useState([]);
//   const [vibrationXData, setVibrationXData] = useState([]);
//   const [vibrationYData, setVibrationYData] = useState([]);
//   const [vibrationZData, setVibrationZData] = useState([]);
//   const [acousticData, setAcousticData] = useState([]);
  
//   const [realTimeCondition, setRealTimeCondition] = useState("Calculating...");
//   const [defectPrediction, setDefectPrediction] = useState("Calculating defect...");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     socket.on("mqttData", async (message) => {
//       try {
//         // Parse JSON data
//         const jsonData = typeof message === 'string' ? JSON.parse(message) : message;
//         setData(jsonData);
//       } catch (error) {
//         console.error("Error parsing JSON data:", error);
//         setData(message); // fallback to original message
//       }
//     });

//     return () => socket.off("mqttData");
//   }, []);

//   useEffect(() => {
//     if (!data) return;

//     try {
//       const currentTime = new Date().toLocaleTimeString();
      
//       // Update time labels
//       setTimeLabels((prev) => [...prev, currentTime].slice(-50));
      
//       // Update all sensor data arrays
//       setRpmData((prev) => [...prev, data.RPM || 0].slice(-50));
//       setCurrentPhaseAData((prev) => [...prev, data.Current_PhaseA || 0].slice(-50));
//       setCurrentPhaseBData((prev) => [...prev, data.Current_PhaseB || 0].slice(-50));
//       setCurrentPhaseCData((prev) => [...prev, data.Current_PhaseC || 0].slice(-50));
//       setVoltagePhaseAData((prev) => [...prev, data.Voltage_PhaseA || 0].slice(-50));
//       setVoltagePhaseBData((prev) => [...prev, data.Voltage_PhaseB || 0].slice(-50));
//       setVoltagePhaseCData((prev) => [...prev, data.Voltage_PhaseC || 0].slice(-50));
//       setTemperatureData((prev) => [...prev, data.Temperature || 0].slice(-50));
//       setVibrationXData((prev) => [...prev, data.Vibration_X || 0].slice(-50));
//       setVibrationYData((prev) => [...prev, data.Vibration_Y || 0].slice(-50));
//       setVibrationZData((prev) => [...prev, data.Vibration_Z || 0].slice(-50));
//       setAcousticData((prev) => [...prev, data.Acoustic || 0].slice(-50));

//       // Threshold monitoring
//       const avgCurrent = ((data.Current_PhaseA || 0) + (data.Current_PhaseB || 0) + (data.Current_PhaseC || 0)) / 3;
//       const avgVoltage = ((data.Voltage_PhaseA || 0) + (data.Voltage_PhaseB || 0) + (data.Voltage_PhaseC || 0)) / 3;
      
//       if (avgCurrent > 3) {
//         alert(`Alert: Average Current (${avgCurrent.toFixed(2)} A) exceeds the threshold of 3 A.`);
//       }

//       if (avgVoltage > 240) {
//         alert(`Alert: Average Voltage (${avgVoltage.toFixed(2)} V) exceeds the threshold of 240 V.`);
//       }

//       if ((data.Temperature || 0) > 55) {
//         alert(`Alert: Overheating! Temperature: ${data.Temperature}°C`);
//       }

//     } catch (error) {
//       console.error("Error processing data:", error);
//     }
//   }, [data]);
  
//   const determineCondition = (temperature, vibrationMagnitude, acoustic) => {
//     const tempCondition =
//       temperature <= 45
//         ? "optimum"
//         : temperature <= 55
//         ? "critical"
//         : "danger";

//     const vibrationCondition =
//       vibrationMagnitude <= 2
//         ? "optimum"
//         : vibrationMagnitude <= 4
//         ? "critical"
//         : "danger";

//     const soundCondition =
//       acoustic <= 70
//         ? "optimum"
//         : acoustic <= 85
//         ? "critical"
//         : "danger";

//     // Consolidate overall condition
//     if (tempCondition === "danger" || vibrationCondition === "danger" || soundCondition === "danger") {
//       return "danger";
//     } else if (
//       tempCondition === "optimum" &&
//       vibrationCondition === "optimum" &&
//       soundCondition === "optimum"
//     ) {
//       return "optimum";
//     } else {
//       return "critical";
//     }
//   };

//   const fetchDefectPrediction = async (sensorData) => {
//     setIsLoading(true);
//     try {
//       const response = await fetch(
//         `http://127.0.0.1:8000/predict?Current_PhaseA=${sensorData.Current_PhaseA || 0}&Current_PhaseB=${sensorData.Current_PhaseB || 0}&Current_PhaseC=${sensorData.Current_PhaseC || 0}&RPM=${sensorData.RPM || 0}&Voltage_PhaseA=${sensorData.Voltage_PhaseA || 0}&Voltage_PhaseB=${sensorData.Voltage_PhaseB || 0}&Voltage_PhaseC=${sensorData.Voltage_PhaseC || 0}&Temperature=${sensorData.Temperature || 0}&Vibration_X=${sensorData.Vibration_X || 0}&Vibration_Y=${sensorData.Vibration_Y || 0}&Vibration_Z=${sensorData.Vibration_Z || 0}&Acoustic=${sensorData.Acoustic || 0}`
//       );
//       const result = await response.json();
//       setDefectPrediction(result.prediction || "No defect information available");
//     } catch (err) {
//       setError("Failed to fetch defect prediction.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (data) {
//       const temperature = data.Temperature || 0;
//       const vibrationMagnitude = Math.sqrt(
//         Math.pow(data.Vibration_X || 0, 2) + 
//         Math.pow(data.Vibration_Y || 0, 2) + 
//         Math.pow(data.Vibration_Z || 0, 2)
//       );
//       const acoustic = data.Acoustic || 0;

//       const condition = determineCondition(temperature, vibrationMagnitude, acoustic);
//       setRealTimeCondition(condition);

//       if (condition === "danger") {
//         alert("Warning! Motor health is in the danger zone!");
//       }
//       if (condition === "critical") {
//         toast.error("Critical condition. Please monitor closely.");
//       }
      
//       fetchDefectPrediction(data);
//     }
//   }, [data]);

//   const graphOptions = {
//     responsive: true,
//     plugins: {
//       legend: {
//         display: true,
//         position: "top",
//       },
//     },
//     scales: {
//       x: {
//         title: {
//           display: true,
//           text: "Time",
//         },
//       },
//       y: {
//         title: {
//           display: true,
//           text: "Value",
//         },
//       },
//     },
//   };

//   return (
//     <div style={{ padding: "20px", backgroundColor: "rgb(177 198 253)", minHeight: "100vh" }}>
//       <ToastContainer/>
//       <div style={{ width: "auto", display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "50px", padding: "0px 80px"}}>
//         <div style={{width: "40vw"}}>
//           <h1 style={{margin: "auto", textAlign: "center", marginBottom: "30px"}}>MQTT Data for Booster Fan {id}</h1>
         
//           <table border="2" style={{ borderCollapse: "collapse", textAlign: "center", width: "100%", margin:"auto"}}>
//             <thead>
//               <tr border="2">
//                 <th>Parameter</th>
//                 <th>Value</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr>
//                 <td>RPM</td>
//                 <td>{data?.RPM || "N/A"}</td>
//               </tr>
//               <tr>
//                 <td>Temperature (°C)</td>
//                 <td>{data?.Temperature || "N/A"}</td>
//               </tr>
//               <tr>
//                 <td>Current Phase A (A)</td>
//                 <td>{data?.Current_PhaseA || "N/A"}</td>
//               </tr>
//               <tr>
//                 <td>Current Phase B (A)</td>
//                 <td>{data?.Current_PhaseB || "N/A"}</td>
//               </tr>
//               <tr>
//                 <td>Current Phase C (A)</td>
//                 <td>{data?.Current_PhaseC || "N/A"}</td>
//               </tr>
//               <tr>
//                 <td>Voltage Phase A (V)</td>
//                 <td>{data?.Voltage_PhaseA || "N/A"}</td>
//               </tr>
//               <tr>
//                 <td>Voltage Phase B (V)</td>
//                 <td>{data?.Voltage_PhaseB || "N/A"}</td>
//               </tr>
//               <tr>
//                 <td>Voltage Phase C (V)</td>
//                 <td>{data?.Voltage_PhaseC || "N/A"}</td>
//               </tr>
//               <tr>
//                 <td>Vibration X (m/s²)</td>
//                 <td>{data?.Vibration_X || "N/A"}</td>
//               </tr>
//               <tr>
//                 <td>Vibration Y (m/s²)</td>
//                 <td>{data?.Vibration_Y || "N/A"}</td>
//               </tr>
//               <tr>
//                 <td>Vibration Z (m/s²)</td>
//                 <td>{data?.Vibration_Z || "N/A"}</td>
//               </tr>
//               <tr>
//                 <td>Acoustic (dB)</td>
//                 <td>{data?.Acoustic || "N/A"}</td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
        
//         <div style={{width: "40vw", display: "flex", flexDirection: "column", alignItems: "center", gap: "50px"}}>
//           <h1 style={{ width: "auto", textAlign: "center", margin: "0px"}}>ML Response</h1>          
//           <div>
//             <div style={{ marginTop: "20px" }}>
//               <h2>Motor Health Status</h2>
//               {isLoading ? (
//                 <p>Predicting motor health...</p>
//               ) : error ? (
//                 <p style={{ color: "red" }}>Error: {error}</p>
//               ) : (
//                 <>
//                   <p style={{textTransform:"capitalize", fontSize: "20px", fontWeight: "600px"}}>Status: {realTimeCondition}</p>
//                   <p style={{textTransform:"capitalize", fontSize: "20px", fontWeight: "600px"}}>Defect: {defectPrediction}</p>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Charts Section */}
//       <div style={{ marginBottom: "20px", display: "flex", gap: "10vw", marginLeft: "3vw" }}>
//         <div style={{ marginBottom: "20px", width: "40vw" }}>
//           <h2>Temperature Vs Time</h2>
//           <Line
//             data={{
//               labels: timeLabels,
//               datasets: [
//                 {
//                   label: "Temperature (°C)",
//                   data: temperatureData,
//                   borderColor: "rgb(144, 64, 181)",
//                   backgroundColor: "rgba(131, 72, 154, 0.83)",
//                   fill: false,
//                 },
//               ],
//             }}
//             options={{
//               ...graphOptions,
//               scales: {
//                 ...graphOptions.scales,
//                 y: { min: 0, max: 70 },
//               },
//               plugins: {
//                 annotation: {
//                   annotations: {
//                     threshold: {
//                       type: "line",
//                       yMin: 55,
//                       yMax: 55,
//                       borderColor: "red",
//                       borderWidth: 2,
//                       label: {
//                         content: "Threshold",
//                         enabled: true,
//                         position: "end",
//                       },
//                     },
//                   },
//                 },
//               },
//             }}
//           />
//         </div>
        
//         <div style={{ marginBottom: "20px", width: "40vw" }}>
//           <h2>RPM Vs Time</h2>
//           <Line
//             data={{
//               labels: timeLabels,
//               datasets: [
//                 {
//                   label: "RPM",
//                   data: rpmData,
//                   borderColor: "#9B7EBD",
//                   backgroundColor: "#D4BEE4",
//                   fill: false,
//                 },
//               ],
//             }}
//             options={{
//               ...graphOptions,
//               scales: {
//                 ...graphOptions.scales,
//                 y: { min: 0, max: 4000 },
//               },
//               plugins: {
//                 annotation: {
//                   annotations: {
//                     threshold: {
//                       type: "line",
//                       yMin: 3500,
//                       yMax: 3500,
//                       borderColor: "red",
//                       borderWidth: 2,
//                       label: {
//                         content: "Threshold",
//                         enabled: true,
//                         position: "end",
//                       },
//                     },
//                   },
//                 },
//               },
//             }}
//           />
//         </div>
//       </div>

//       {/* Three Phase Current Charts */}
//       <div style={{ marginBottom: "20px", display: "flex", gap: "5vw", marginLeft: "3vw" }}>
//         <div style={{ marginBottom: "20px", width: "28vw" }}>
//           <h2>Current Phase A Vs Time</h2>
//           <Line
//             data={{
//               labels: timeLabels,
//               datasets: [
//                 {
//                   label: "Current Phase A (A)",
//                   data: currentPhaseAData,
//                   borderColor: "rgba(255, 99, 132, 1)",
//                   backgroundColor: "rgba(255, 99, 132, 0.2)",
//                   fill: false,
//                 },
//               ],
//             }}
//             options={{
//               ...graphOptions,
//               scales: {
//                 ...graphOptions.scales,
//                 y: { min: 0, max: 6 },
//               },
//             }}
//           />
//         </div>
        
//         <div style={{ marginBottom: "20px", width: "28vw" }}>
//           <h2>Current Phase B Vs Time</h2>
//           <Line
//             data={{
//               labels: timeLabels,
//               datasets: [
//                 {
//                   label: "Current Phase B (A)",
//                   data: currentPhaseBData,
//                   borderColor: "rgba(54, 162, 235, 1)",
//                   backgroundColor: "rgba(54, 162, 235, 0.2)",
//                   fill: false,
//                 },
//               ],
//             }}
//             options={{
//               ...graphOptions,
//               scales: {
//                 ...graphOptions.scales,
//                 y: { min: 0, max: 6 },
//               },
//             }}
//           />
//         </div>
        
//         <div style={{ marginBottom: "20px", width: "28vw" }}>
//           <h2>Current Phase C Vs Time</h2>
//           <Line
//             data={{
//               labels: timeLabels,
//               datasets: [
//                 {
//                   label: "Current Phase C (A)",
//                   data: currentPhaseCData,
//                   borderColor: "rgba(255, 206, 86, 1)",
//                   backgroundColor: "rgba(255, 206, 86, 0.2)",
//                   fill: false,
//                 },
//               ],
//             }}
//             options={{
//               ...graphOptions,
//               scales: {
//                 ...graphOptions.scales,
//                 y: { min: 0, max: 6 },
//               },
//             }}
//           />
//         </div>
//       </div>

//       {/* Three Phase Voltage Charts */}
//       <div style={{ marginBottom: "20px", display: "flex", gap: "5vw", marginLeft: "3vw" }}>
//         <div style={{ marginBottom: "20px", width: "28vw" }}>
//           <h2>Voltage Phase A Vs Time</h2>
//           <Line
//             data={{
//               labels: timeLabels,
//               datasets: [
//                 {
//                   label: "Voltage Phase A (V)",
//                   data: voltagePhaseAData,
//                   borderColor: "rgba(75, 192, 192, 1)",
//                   backgroundColor: "rgba(75, 192, 192, 0.2)",
//                   fill: false,
//                 },
//               ],
//             }}
//             options={{
//               ...graphOptions,
//               scales: {
//                 ...graphOptions.scales,
//                 y: { min: 0, max: 300 },
//               },
//             }}
//           />
//         </div>
        
//         <div style={{ marginBottom: "20px", width: "28vw" }}>
//           <h2>Voltage Phase B Vs Time</h2>
//           <Line
//             data={{
//               labels: timeLabels,
//               datasets: [
//                 {
//                   label: "Voltage Phase B (V)",
//                   data: voltagePhaseBData,
//                   borderColor: "rgba(153, 102, 255, 1)",
//                   backgroundColor: "rgba(153, 102, 255, 0.2)",
//                   fill: false,
//                 },
//               ],
//             }}
//             options={{
//               ...graphOptions,
//               scales: {
//                 ...graphOptions.scales,
//                 y: { min: 0, max: 300 },
//               },
//             }}
//           />
//         </div>
        
//         <div style={{ marginBottom: "20px", width: "28vw" }}>
//           <h2>Voltage Phase C Vs Time</h2>
//           <Line
//             data={{
//               labels: timeLabels,
//               datasets: [
//                 {
//                   label: "Voltage Phase C (V)",
//                   data: voltagePhaseCData,
//                   borderColor: "rgba(255, 159, 64, 1)",
//                   backgroundColor: "rgba(255, 159, 64, 0.2)",
//                   fill: false,
//                 },
//               ],
//             }}
//             options={{
//               ...graphOptions,
//               scales: {
//                 ...graphOptions.scales,
//                 y: { min: 0, max: 300 },
//               },
//             }}
//           />
//         </div>
//       </div>

//       {/* Vibration Charts */}
//       <div style={{ marginBottom: "20px", display: "flex", gap: "5vw", marginLeft: "3vw" }}>
//         <div style={{ marginBottom: "20px", width: "28vw" }}>
//           <h2>Vibration X Vs Time</h2>
//           <Line
//             data={{
//               labels: timeLabels,
//               datasets: [
//                 {
//                   label: "Vibration X (m/s²)",
//                   data: vibrationXData,
//                   borderColor: "rgba(255, 99, 132, 1)",
//                   backgroundColor: "rgba(255, 99, 132, 0.2)",
//                   fill: false,
//                 },
//               ],
//             }}
//             options={{
//               ...graphOptions,
//               scales: {
//                 ...graphOptions.scales,
//                 y: { min: -5, max: 5 },
//               },
//             }}
//           />
//         </div>
        
//         <div style={{ marginBottom: "20px", width: "28vw" }}>
//           <h2>Vibration Y Vs Time</h2>
//           <Line
//             data={{
//               labels: timeLabels,
//               datasets: [
//                 {
//                   label: "Vibration Y (m/s²)",
//                   data: vibrationYData,
//                   borderColor: "rgba(54, 162, 235, 1)",
//                   backgroundColor: "rgba(54, 162, 235, 0.2)",
//                   fill: false,
//                 },
//               ],
//             }}
//             options={{
//               ...graphOptions,
//               scales: {
//                 ...graphOptions.scales,
//                 y: { min: -5, max: 5 },
//               },
//             }}
//           />
//         </div>
        
//         <div style={{ marginBottom: "20px", width: "28vw" }}>
//           <h2>Vibration Z Vs Time</h2>
//           <Line
//             data={{
//               labels: timeLabels,
//               datasets: [
//                 {
//                   label: "Vibration Z (m/s²)",
//                   data: vibrationZData,
//                   borderColor: "rgba(255, 206, 86, 1)",
//                   backgroundColor: "rgba(255, 206, 86, 0.2)",
//                   fill: false,
//                 },
//               ],
//             }}
//             options={{
//               ...graphOptions,
//               scales: {
//                 ...graphOptions.scales,
//                 y: { min: -5, max: 5 },
//               },
//             }}
//           />
//         </div>
//       </div>

//       {/* Acoustic Chart */}
//       <div style={{ marginBottom: "20px", display: "flex", gap: "10vw", marginLeft: "3vw" }}>
//         <div style={{ marginBottom: "20px", width: "40vw" }}>
//           <h2>Acoustic Level Vs Time</h2>
//           <Line
//             data={{
//               labels: timeLabels,
//               datasets: [
//                 {
//                   label: "Acoustic (dB)",
//                   data: acousticData,
//                   borderColor: "rgba(75, 192, 192, 1)",
//                   backgroundColor: "rgba(75, 192, 192, 0.2)",
//                   fill: false,
//                 },
//               ],
//             }}
//             options={{
//               ...graphOptions,
//               scales: {
//                 ...graphOptions.scales,
//                 y: { min: 0, max: 120 },
//               },
//               plugins: {
//                 annotation: {
//                   annotations: {
//                     threshold: {
//                       type: "line",
//                       yMin: 85,
//                       yMax: 85,
//                       borderColor: "red",
//                       borderWidth: 2,
//                       label: {
//                         content: "Threshold",
//                         enabled: true,
//                         position: "end",
//                       },
//                     },
//                   },
//                 },
//               },
//             }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default MQTTPage;
