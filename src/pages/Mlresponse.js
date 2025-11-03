// import React, { useEffect, useState, useRef } from "react";
// import io from "socket.io-client";

// const socket = io("http://localhost:5000");

// const Mlresponse = () => {
//   const [data, setData] = useState("Waiting for data...");
//   const [ML_response, setMLResponse] = useState("No data found...");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const audioRef = useRef(null);

//   // Socket Listener
//   useEffect(() => {
//     socket.on("mqttData", (message) => {
//       setData(message);
//     });

//     return () => socket.off("mqttData");
//   }, []);

//   // Fetch ML prediction when `data` updates
//   useEffect(() => {
//     if (data === "Waiting for data...") return;

//     fetchMLPrediction(data);
//   }, [data]);

//   // Function to fetch ML prediction
//   const fetchMLPrediction = async (data) => {
//     try {
//       setIsLoading(true);
//       setError(null);

//       console.log("Raw Data Received:", data);

//       // Parse data fields
//       const temperatureMatch = data.match(/Temperature\s*:\s*([\d.]+)°C/);
//       const peakAccelerationMatch = data.match(/Peak Acceleration\s*:\s*([\d.]+)\s*m\/s²/);
//       const soundVoltageMatch = data.match(/SoundDB\s*:\s*([\d.]+)\s*db/);

//       const temperature = temperatureMatch ? parseFloat(temperatureMatch[1].trim()) : null;
//       const peakAcceleration = peakAccelerationMatch ? parseFloat(peakAccelerationMatch[1].trim()) : null;
//       const soundVoltage = soundVoltageMatch ? parseFloat(soundVoltageMatch[1].trim()) : null;

//       console.log("Parsed Values:", { temperature, peakAcceleration, soundVoltage });

//       // Validate parameters
//       if (
//         temperature === null ||
//         peakAcceleration === null ||
//         soundVoltage === null ||
//         isNaN(temperature) ||
//         isNaN(peakAcceleration) ||
//         isNaN(soundVoltage)
//       ) {
//         console.error("Error: Missing or invalid parameters for prediction");
//         console.error("Received Data:", data);
//         console.error("Parsed Values:", { temperature, peakAcceleration, soundVoltage });
//         throw new Error("Missing or invalid parameters for prediction");
//       }

//       // Construct prediction URL
//       const ML_URL = `http://127.0.0.1:8000/predict?Temperature=${temperature}&Peak_Acceleration=${peakAcceleration}&Sound_Voltage=${soundVoltage}`;
//       console.log("Prediction URL:", ML_URL);

//       const response = await fetch(ML_URL);

//       // Check response status
//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
//       }

//       const result = await response.json();

//       // Validate prediction response
//       if (!result || !result.prediction) {
//         throw new Error("Invalid prediction response");
//       }

//       setMLResponse(result.prediction);

//       // Danger alert
//       if (result.prediction.toLowerCase().includes("danger")) {
//         alert("Warning! Motor health is in the danger zone!");
//         if (audioRef.current) {
//           audioRef.current.play();
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching ML prediction:", error);
//       setError(error.message);
//       setMLResponse("Prediction error");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div style={{ fontFamily: "Serif", fontWeight: "600", fontSize: "25px" }}>
//       <p>{isLoading ? "Loading..." : ML_response}</p>
//       {error && <p style={{ color: "red" }}>Error: {error}</p>}

//       <audio ref={audioRef} src="/alert.mp3" preload="auto" />
//     </div>
//   );
// };

// export default Mlresponse;





















import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

const socket = io("https://cbms-backend.onrender.com");

const Mlresponse = () => {
  const [data, setData] = useState("Waiting for data...");
  const [ML_response, setMLResponse] = useState("No data found...");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  // Listen for JSON MQTT data
  useEffect(() => {
    socket.on("mqttData", (message) => {
      try {
        const jsonData = JSON.parse(message);
        setData(jsonData);
      } catch (e) {
        console.error("Invalid JSON data received:", message);
        setError("Invalid JSON data received");
      }
    });

    return () => socket.off("mqttData");
  }, []);

  useEffect(() => {
    if (data === "Waiting for data..." || typeof data !== "object") return;

    fetchMLPrediction(data);
  }, [data]);

  const fetchMLPrediction = async (sensorData) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Sensor Data:", sensorData);

      const {
        RPM,
        Current_PhaseA,
        Current_PhaseB,
        Current_PhaseC,
        Voltage_PhaseA,
        Voltage_PhaseB,
        Voltage_PhaseC,
        Temperature,
        Vibration_X,
        Vibration_Y,
        Vibration_Z,
        Acoustic,
      } = sensorData;

      // Validate essential fields
      const fields = [
        RPM,
        Current_PhaseA,
        Current_PhaseB,
        Current_PhaseC,
        Voltage_PhaseA,
        Voltage_PhaseB,
        Voltage_PhaseC,
        Temperature,
        Vibration_X,
        Vibration_Y,
        Vibration_Z,
        Acoustic,
      ];

      if (fields.some((val) => val === null || val === undefined || isNaN(val))) {
        throw new Error("One or more parameters are missing or invalid");
      }

      const ML_URL = `https://cbms-ml-model.onrender.com/predict?RPM=${RPM}&Current_PhaseA=${Current_PhaseA}&Current_PhaseB=${Current_PhaseB}&Current_PhaseC=${Current_PhaseC}&Voltage_PhaseA=${Voltage_PhaseA}&Voltage_PhaseB=${Voltage_PhaseB}&Voltage_PhaseC=${Voltage_PhaseC}&Temperature=${Temperature}&Vibration_X=${Vibration_X}&Vibration_Y=${Vibration_Y}&Vibration_Z=${Vibration_Z}&Acoustic=${Acoustic}`;
      console.log("Prediction URL:", ML_URL);

      const response = await fetch(ML_URL);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
      }

      const result = await response.json();

      if (!result || !result.prediction) {
        throw new Error("Invalid prediction response");
      }

      setMLResponse(result.prediction);

      if (result.prediction.toLowerCase().includes("danger")) {
        alert("Warning! Motor health is in the danger zone!");
        if (audioRef.current) {
          audioRef.current.play();
        }
      }
    } catch (err) {
      console.error("Error fetching ML prediction:", err);
      setError(err.message);
      setMLResponse("Prediction error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "Serif", fontWeight: "600", fontSize: "25px" }}>
      <p>{isLoading ? "Loading..." : ML_response}</p>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <audio ref={audioRef} src="/alert.mp3" preload="auto" />
    </div>
  );
};

export default Mlresponse;
