// import React from 'react';
// import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
// import Login from '../src/pages/Login';
// import Homepage from '../src/pages/Homepage';
// import MQTTPage from '../src/pages/MQTTPage';
// import './App.css';
// import Home from '../src/pages/Home';


// function App() {
//   return (
//     <Router>
//       <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#333', color: '#fff' }}>
//         <div>
//           <Link to="/" style={{ margin: '0 10px', color: '#fff', textDecoration: 'none' }}>Home</Link>
//           <Link to="/motor" style={{ margin: '0 10px', color: '#fff', textDecoration: 'none' }}>Motor</Link>
//         </div>
//         <Link to="/login" style={{ margin: '0 10px', color: '#fff', textDecoration: 'none' }}>Login</Link>
//       </div>
//       <Routes>
//         <Route path="/login" element={<Login />} />
//         <Route path="/" element={<Home/>} />
//         <Route path="/motor" element={<Homepage/>} />
//         <Route path="/mqtt/:id" element={<MQTTPage />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;


import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signin from './pages/Signin';
import Homepage from './pages/Homepage';
import MQTTPage from './pages/MQTTPage';
import './App.css';
import Home from './pages/Home';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './pages/ProtectedRoute';
// import FeedbackForm from ".pages/FeedbackForm";


function App() {
  return (
    <Router>
      {/* <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#333', color: '#fff' }}>
        <div>
          <Link to="/" style={{ margin: '0 10px', color: '#fff', textDecoration: 'none' }}>Home</Link> 
          <Link to="/motor" style={{ margin: '0 10px', color: '#fff', textDecoration: 'none' }}>Motor</Link> 
        </div>
        <Link to="/login" style={{ margin: '0 10px', color: '#fff', textDecoration: 'none' }}>Login</Link>
      </div> */}

      <Routes>
        <Route path="/signin" element={<Signin/>} />
        <Route path="/" element={<Home />} /> 
        <Route path="/motor" element={<Homepage />} /> 
        <Route path="/mqtt/:id" element={<MQTTPage />} />
        <Route path="/sign-in" element={<Signin/>}/>
        <Route path="/about" element={<About/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route element={<ProtectedRoute allowedRoles={['admin']}/>}/>
      </Routes>
    </Router>
  );
}

export default App;

