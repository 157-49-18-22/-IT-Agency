import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './App.css';

// Import your components
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';
import AllProjects from './Components/AllProjects';
import Active from './Components/Active';
import Completed from './Components/Completed';
import Sidebar from './Components/Sidebar';

// Import UI/UX Components
import Design from './Components/UI/Design';
import Wireframes from './Components/UI/Wireframes';
import Mockups from './Components/UI/Mockups';
import Prototypes from './Components/UI/Prototypes';
import Client from './Components/UI/Client';

// Import Development Components
import Code from './Components/Development/Code';
import Deployment from './Components/Development/Deployment';
import Task from './Components/Development/Task';
import Version from './Components/Development/Version';

// Import Testing Components
import Bug from './Components/Testing/Bug';
import Cases from './Components/Testing/Cases';
import Performance from './Components/Testing/Performance';
import Uat from './Components/Testing/Uat';

// Layout component that includes the Sidebar
const MainLayout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

// A simple protected route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? <MainLayout>{children}</MainLayout> : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<AllProjects />} />
            <Route path="/projects/active" element={<Active />} />
            <Route path="/projects/completed" element={<Completed />} />
            <Route path="/team" element={<div>Team Page</div>} />
            
            {/* UI/UX Design Routes */}
            <Route path="/uiux" element={<Design />}>
              <Route index element={<Navigate to="wireframes" replace />} />
              <Route path="wireframes" element={<Wireframes />} />
              <Route path="mockups" element={<Mockups />} />
              <Route path="prototypes" element={<Prototypes />} />
              <Route path="design-system" element={<div>Design System</div>} />
              <Route path="client-approval" element={<div>Client Approval</div>} />
            </Route>
            
            <Route path="/clients" element={<Client />} />
            
            {/* Development Routes */}
            <Route path="/development">
              <Route index element={<Navigate to="code" replace />} />
              <Route path="code" element={<Code />} />
              <Route path="deployment" element={<Deployment />} />
              <Route path="task" element={<Task />} />
              <Route path="version" element={<Version />} />
            </Route>

            {/* Testing Routes */}
            <Route path="/testing">
              <Route index element={<Navigate to="bug" replace />} />
              <Route path="bug" element={<Bug />} />
              <Route path="cases" element={<Cases />} />
              <Route path="performance" element={<Performance />} />
              <Route path="uat" element={<Uat />} />
            </Route>
            
            <Route path="/calendar" element={<div>Calendar Page</div>} />
            <Route path="/time-tracking" element={<div>Time Tracking Page</div>} />
            
            {/* Add other protected routes here */}
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;