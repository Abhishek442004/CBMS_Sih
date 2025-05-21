import React, { useEffect, useState } from "react";
// import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import { Line } from "react-chartjs-2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 
// import audio from "../assets/Danger.mp3";
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
// import { popup } from "leaflet";
// import Mlresponse from "./Mlresponse";
// import danger from "../assets/Danger.mp3";
// import critical from "../assets/Critical.mp3";
// const audioRef = useRef();
ChartJS.register(annotationPlugin);

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const socket = io("http://localhost:5000");


function MQTTPage() {
  const { id } = useParams();
  const [data, setData] = useState("Waiting for data...");
  // const [ML_response, setMLResponse] = useState("No data found...");
  const [timeLabels, setTimeLabels] = useState([]);
  const [temperatureData, setTemperatureData] = useState([]);
  const [accelerationData, setAccelerationData] = useState([]);
  const [SoundVoltageData, setSoundVoltageData] = useState([]);
  const [RpmData, setRpmData] = useState([]);
  const [VoltageData, setVoltageData] = useState([]);
  const [CurrentData, setCurrentData] = useState([]);
  const [PowerData, setPowerData] = useState([]);
  const [HumidityData, setHumidityData] = useState([]);
  const [realTimeCondition, setRealTimeCondition] = useState("Calculating...");
  const [defectPrediction, setDefectPrediction] = useState("Calculating defect...");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // const [HumidityData, setHumidityData] = useState([]);
  //  const audioRef = useRef();

  useEffect(() => {
    socket.on("mqttData", async (message) => {
      setData(message);
    });

    return () => socket.off("mqttData");
  }, []);

  useEffect(() => {
    if (data === "Waiting for data...") return;

    try {
      const temperature = parseFloat(data.match(/Temperature\s*:\s*([^,]+)/)?.[1]?.trim());
      const peakAcceleration = parseFloat(data.match(/Peak Acceleration\s*:\s*([^,]+)/)?.[1]?.trim());
      const soundVoltage = parseFloat(data.match(/SoundDB\s*:\s*([^,]+)/)?.[1]?.trim());
      const rpm = parseFloat(data.match(/RPM\s*:\s*([^,]+)/)?.[1]?.trim());
      const voltage = parseFloat(data.match(/Volts\s*:\s*([^,]+)/)?.[1]?.trim());
      const power = parseFloat(data.match(/Power\s*:\s*([^,]+)/)?.[1]?.trim());
      const humidity = parseFloat(data.match(/Humidity\s*:\s*([^,]+)/)?.[1]?.trim());
      const current = parseFloat(data.match(/Current\s*:\s*([^,]+)/)?.[1]?.trim());
      const currentTime = new Date().toLocaleTimeString();
     
      setTimeLabels((prev) => [...prev, currentTime].slice(-50));
      setTemperatureData((prev) => [...prev, temperature].slice(-50));
      setAccelerationData((prev) => [...prev, peakAcceleration].slice(-50));
      setSoundVoltageData((prev) => [...prev, soundVoltage].slice(-50));
      setRpmData((prev) => [...prev, rpm].slice(-50));
      setVoltageData((prev) => [...prev, voltage].slice(-50));
      setPowerData((prev) => [...prev, power].slice(-50));
      setHumidityData((prev) => [...prev, humidity].slice(-50));
      setCurrentData((prev) => [...prev, current].slice(-50));



      const threshold_current = 3;
      if(current > threshold_current){
        alert(`Alert: Current Value(${current} A) exceeds the threshold of ${threshold_current} A.`);
      }

      const threshold_voltage = 240;
      if(voltage > threshold_voltage){
        alert(`Alert: Current Value(${voltage} A) exceeds the threshold of ${threshold_voltage} A.`);
      }
       

       if(temperature > 55){
        alert(`Alert: Overheating!!`);
       }



      // const ML_URL = `http://127.0.0.1:8000/predict?Temperature=${temperature}&Peak_Acceleration=${peakAcceleration}&Sound_Voltage=${soundVoltage}`;
   
      // const fetchData = async () => {
      //   try {
      //     console.log("Fetching from URL:",ML_URL);
      //     const response = await fetch(ML_URL);
      //     if (!response.ok) {
      //       throw new Error(`HTTP error! Status: ${response.status}`);
      //     }
      //     const result = await response.json();
      //     setMLResponse(result.prediction);
      //   } catch (error) {
      //     console.error("Error fetching ML response:", error);
      //   }
      // };

      // fetchData();

      // useEffect(() =>{
      //   if (data !== "Waiting for data..."){

      //   }
      // })
    } 
    catch (error) {
      console.error("Error processing data:", error);
    }
  }, [data]);
  
  const determineCondition = (temperature, peakAcceleration, soundVoltage) => {
    const tempCondition =
      temperature <= 45
        ? "optimum"
        : temperature <= 55
        ? "critical"
        : "danger";

    const vibrationCondition =
      peakAcceleration <= 2
        ? "optimum"
        : peakAcceleration <= 4
        ? "critical"
        : "danger";

    const soundCondition =
      soundVoltage <= 101.52526
        ? "optimum"
        : soundVoltage <= 104.24451
        ? "critical"
        : "danger";

    // Consolidate overall condition
    if (tempCondition === "danger" || vibrationCondition === "danger" || soundCondition === "danger") {
      return "danger";
    } else if (
      tempCondition === "optimum" &&
      vibrationCondition === "optimum" &&
      soundCondition === "optimum"
    ) {
      return "optimum";
    } else {
      return "critical";
    }
  };

  const fetchDefectPrediction = async (temperature, peakAcceleration, soundVoltage) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/predict?Temperature=${temperature}&Peak_Acceleration=${peakAcceleration}&Sound=${soundVoltage}`
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
    if (data !== "Waiting for data...") {
       const temperature = parseFloat(data.match(/Temperature\s*:\s*([^,]+)/)?.[1]?.trim());
      const peakAcceleration = parseFloat(data.match(/Peak Acceleration\s*:\s*([^,]+)/)?.[1]?.trim());
      const soundVoltage = parseFloat(data.match(/SoundDB\s*:\s*([^,]+)/)?.[1]?.trim());

      if (temperature !== null && peakAcceleration !== null && soundVoltage !== null) {
        const condition = determineCondition(temperature, peakAcceleration, soundVoltage);
        setRealTimeCondition(condition);

       if (condition === "danger") {
         alert("Warning! Motor health is in the danger zone!");
        // if (audioRef.current) {
        //   audioRef.current.play();
        // }

      }
      if (condition === "critical") {
  // audioRef.current.src = critical;
  // audioRef.current.play();
  toast.error("Critical condition. Please monitor closely.");
       
      }
      fetchDefectPrediction(temperature, peakAcceleration, soundVoltage) ;
 
      } else {
        setRealTimeCondition("Data incomplete");
        setDefectPrediction("Unable to determine defect due to incomplete data");
      }
    }
  }, [data]);
  const graphOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time",
        },
      },
      y: {
        title: {
          display: true,
          text: "Value",
        },
      },
    },
  };

  return (
    <div style={{ padding: "20px" , backgroundColor: "rgb(177 198 253)" , minHeight: "100vh" }}>
    <ToastContainer/>
    <div style={{ width: "auto", display: "flex" , alignItems: "flex-start", justifyContent: "space-between", marginBottom: "50px", padding: "0px 80px"}}>
    <div style={{width: "40vw"}}>
      <h1 style={{margin: "auto" , textAlign: "center" , marginBottom: "30px"}}>MQTT Data for Booster Fan {id}</h1>
     
    <table border="2" style={{ borderCollapse: "collapse", textAlign: "center", width: "100%", margin:"auto"}}>
      <thead>
        <tr  border="2">
          <th>Parameter</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>RPM</td>
          <td>{data.match(/RPM\s*:\s*([^,]+)/)?.[1]?.trim() || "N/A"}</td>
        </tr>
        <tr>
          <td>Temperature (°C)</td>
          <td>{data.match(/Temperature\s*:\s*([^,]+)/)?.[1]?.trim() || "N/A"}</td>
        </tr>
        <tr>
          <td>Peak Acceleration (m/s²)</td>
          <td>{data.match(/Peak Acceleration\s*:\s*([^,]+)/)?.[1]?.trim() || "N/A"}</td>
        </tr>
        <tr>
          <td>Sound Voltage (V)</td>
          <td>{data.match(/SoundDB\s*:\s*([^,]+)/)?.[1]?.trim() || "N/A"}</td>
        </tr>
        <tr>
          <td>Motor ID</td>
          <td>{data.match(/MotorId\s*:\s*([^,]+)/)?.[1]?.trim() || "N/A"}</td>
        </tr>
        <tr>
          <td>Current (A)</td>
          <td>{data.match(/Current\s*:\s*([^,]+)/)?.[1]?.trim() || "N/A"}</td>
        </tr>
        <tr>
          <td>Voltage (V)</td>
          <td>{
          data.match(/Volts\s*:\s*([^,]+)/)?.[1]?.trim() || "N/A"
          
          }</td>
        </tr>
        <tr>
          <td>Power (W)</td>
          <td>{data.match(/Power\s*:\s*([^,]+)/)?.[1]?.trim() || "N/A"}</td>
        </tr>
        <tr>
          <td>Humidity (in %)</td>
          <td>{data.match(/Humidity\s*:\s*([^,]+)/)?.[1]?.trim() || "N/A"}</td>
        </tr>
      </tbody>
    </table>
    </div>
    <div style={{width: "40vw", display: "flex", flexDirection: "column" , alignItems: "center", gap: "50px"}}>
      {/* <p>Received: {data}</p> */}
    <h1 style={{ width: "auto" , textAlign: "center", margin: "0px"}}>ML Response </h1>          
    {/* <div>{ML_response.prediction}</div> */}
    <div>
    <div style={{ marginTop: "20px" }}>
        <h2>Motor Health Status</h2>
        {isLoading ? (
          <p>Predicting motor health...</p>
        ) : error ? (
          <p style={{ color: "red" }}>Error: {error}</p>
        ) : (
          <>
            <p style={{textTransform:"capitalize", fontSize: "20px", fontWeight: "600px"}}>Status: {realTimeCondition}</p>
            <p style={{textTransform:"capitalize", fontSize: "20px", fontWeight: "600px"}}>Defect: {defectPrediction}</p>
          </>
        )}
      </div>
    </div>
    </div>
    </div>
    <div style={{ marginBottom: "20px", display: "flex", gap: "10vw", marginLeft: "3vw" }}>
  <div style={{ marginBottom: "20px", width: "40vw" }}>
    <h2>Temperature Vs Time</h2>
    <Line
      data={{
        labels: timeLabels,
        datasets: [
          {
            label: "Temperature (°C)",
            data: temperatureData,
            borderColor: "rgb(144, 64, 181)",
            backgroundColor: "rgba(131, 72, 154, 0.83)",
            fill: false,
          },
        ],
      }}
      options={{
        ...graphOptions,
        scales: {
          ...graphOptions.scales,
          y: {
            min: 0,
            max: 70,
          },
        },
        plugins: {
          annotation: {
            annotations: {
              threshold: {
                type: "line",
                yMin: 55, // Set threshold value for Temperature
                yMax: 55,
                borderColor: "red",
                borderWidth: 2,
                label: {
                  content: "Threshold",
                  enabled: true,
                  position: "end",
                },
              },
            },
          },
        },
      }}
    />
  </div>
  <div style={{ marginBottom: "20px", width: "40vw" }}>
    <h2>Peak Acceleration Vs Time</h2>
    <Line
      data={{
        labels: timeLabels,
        datasets: [
          {
            label: "Peak Acceleration (m/s²)",
            data: accelerationData,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            fill: false,
          },
        ],
      }}
      options={{
        ...graphOptions,
        scales: {
          ...graphOptions.scales,
          y: {
            min: 0,
            max: 5,
          },
        },
        plugins: {
          annotation: {
            annotations: {
              threshold: {
                type: "line",
                yMin: 4, // Set threshold value for Peak Acceleration
                yMax: 4,
                borderColor: "red",
                borderWidth: 2,
                label: {
                  content: "Threshold",
                  enabled: true,
                  position: "end",
                },
              },
            },
          },
        },
      }}
    />
  </div>
    </div>
   <div style={{ marginBottom: "20px", display: "flex", gap: "10vw", marginLeft: "3vw" }}>
  <div style={{ marginBottom: "20px", width: "40vw" }}>
    <h2>Sound Decibel Vs Time</h2>
    <Line
      data={{
        labels: timeLabels,
        datasets: [
          {
            label: "Sound Decibel (dB)",
            data: SoundVoltageData,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            fill: false,
          },
        ],
      }}
      options={{
        ...graphOptions,
        scales: {
          ...graphOptions.scales,
          y: {
            min: 0,  // Set the desired range for Sound Decibel
            max: 150,
          },
        },
        plugins: {
          annotation: {
            annotations: {
              threshold: {
                type: "line",
                yMin: 130, // Set threshold value for Temperature
                yMax: 130,
                borderColor: "red",
                borderWidth: 2,
                label: {
                  content: "Threshold",
                  enabled: true,
                  position: "end",
                },
              },
            },
          },
        },
      }}
    />
  </div>
  <div style={{ marginBottom: "20px", width: "40vw" }}>
    <h2>Humidity Vs Time</h2>
    <Line
      data={{
        labels: timeLabels,
        datasets: [
          {
            label: "Humidity (in %)",
            data: HumidityData,
            borderColor: "#557C56",
            backgroundColor: "#6A9C89",
            fill: false,
          },
        ],
      }}
      options={{
        ...graphOptions,
        scales: {
          ...graphOptions.scales,
          y: {
            min: 0,  // Set the desired range for Humidity
            max: 100,
          },
        },
        plugins: {
          annotation: {
            annotations: {
              threshold: {
                type: "line",
                yMin: 65, // Set threshold value for Temperature
                yMax: 65,
                borderColor: "red",
                borderWidth: 2,
                label: {
                  content: "Threshold",
                  enabled: true,
                  position: "end",
                },
              },
            },
          },
        },
      }}
    />
  </div>
 
   </div>
   <div style={{ marginBottom: "20px", display: "flex", gap: "10vw", marginLeft: "3vw" }}>
  
  <div style={{ marginBottom: "20px", width: "40vw" }}>
    <h2>Power Vs Time</h2>
    <Line
      data={{
        labels: timeLabels,
        datasets: [
          {
            label: "Power (W)",
            data: PowerData,
            borderColor: "#9229799",
            backgroundColor: "#48CFCB",
            fill: false,
          },
        ],
      }}
      options={{
        ...graphOptions,
        scales: {
          ...graphOptions.scales,
          y: {
            min: 0,  // Set the desired range for Power
            max: 850,
          },
        },
        plugins: {
          annotation: {
            annotations: {
              threshold: {
                type: "line",
                yMin: 800, // Set threshold value for Temperature
                yMax: 800,
                borderColor: "red",
                borderWidth: 2,
                label: {
                  content: "Threshold",
                  enabled: true,
                  position: "end",
                },
              },
            },
          },
        },
      }}
    />
  </div>
  <div style={{ marginBottom: "20px", width: "40vw" }}>
    <h2>Voltage Vs Time</h2>
    <Line
      data={{
        labels: timeLabels,
        datasets: [
          {
            label: "Voltage (V)",
            data: VoltageData,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            fill: false,
          },
        ],
      }}
      options={{
        ...graphOptions,
        scales: {
          ...graphOptions.scales,
          y: {
            min: 0,  // Set the desired range for Voltage
            max: 300,
          },
        },
        plugins: {
          annotation: {
            annotations: {
              threshold: {
                type: "line",
                yMin: 250, // Set threshold value for Temperature
                yMax: 250,
                borderColor: "red",
                borderWidth: 2,
                label: {
                  content: "Threshold",
                  enabled: true,
                  position: "end",
                },
              },
            },
          },
        },
      }}
    />
  </div>
  </div>
  <div style={{ marginBottom: "20px", display: "flex", gap: "10vw", marginLeft: "3vw" }}>
  
  <div style={{ marginBottom: "20px", width: "40vw" }}>
    <h2>Current Vs Time</h2>
    <Line
      data={{
        labels: timeLabels,
        datasets: [
          {
            label: "Current (A)",
            data: CurrentData,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            fill: false,
          },
        ],
      }}
      options={{
        ...graphOptions,
        scales: {
          ...graphOptions.scales,
          y: {
            min: 0,  // Set the desired range for Current
            max: 6,
          },
        },
        plugins: {
          annotation: {
            annotations: {
              threshold: {
                type: "line",
                yMin: 4, // Set threshold value for Temperature
                yMax: 4,
                borderColor: "red",
                borderWidth: 2,
                label: {
                  content: "Threshold",
                  enabled: true,
                  position: "end",
                },
              },
            },
          },
        },
      }}
    />
  </div>
   <div style={{ marginBottom: "20px", width: "40vw" }}>
    <h2>RPM Vs Time</h2>
    <Line
      data={{
        labels: timeLabels,
        datasets: [
          {
            label: "RPM",
            data: RpmData,
            borderColor: "#9B7EBD",
            backgroundColor: "#D4BEE4",
            fill: false,
          },
        ],
      }}
      options={{
        ...graphOptions,
        scales: {
          ...graphOptions.scales,
          y: {
            min: 0,  // Set the desired range for RPM
            max: 4000,
          },
        },
        plugins: {
          annotation: {
            annotations: {
              threshold: {
                type: "line",
                yMin: 3500, // Set threshold value for Temperature
                yMax: 3500,
                borderColor: "red",
                borderWidth: 2,
                label: {
                  content: "Threshold",
                  enabled: true,
                  position: "end",
                },
              },
            },
          },
        },
      }}
    />
  </div>
  </div>
  {/* <audio ref={audioRef} src={audio} /> */}

  </div>
  );
}

export default MQTTPage;
