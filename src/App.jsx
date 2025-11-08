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
import DevelopmentTask from './Components/Development/Task';
import Version from './Components/Development/Version';

// Import Testing Components
import Bug from './Components/Testing/Bug';
import Cases from './Components/Testing/Cases';
import Performance from './Components/Testing/Performance';
import Uat from './Components/Testing/Uat';

// Import Team Component
import Team from './Components/Team';
// Import standalone Tasks page
import Task from './Components/Development/Task';
// Import Calendar Component
import Calendar from './Components/Calendar';
import Tracking from './Components/Tracking';
// Import Report Components
import ProjectProgress from './Components/Reports/ProjectProgress';
import TeamPerformance from './Components/Reports/TeamPerformance';
import Finacial from './Components/Reports/Finacial';
import Custom from './Components/Reports/Custom';
import Approvals from './Components/Approvals';
import Deliverables from './Components/Deliverables';
import Activity from './Components/Activity';
import Messages from './Components/Messages';
import Notifications from './Components/Notifications';

// Import NEW Components
import Backlog from './Components/Development/Backlog';
import Sprints from './Components/Development/Sprints';
import StageTransition from './Components/StageManagement/StageTransition';
import ClientDashboard from './Components/ClientPortal/ClientDashboard';
import ClientApprovals from './Components/ClientPortal/ClientApprovals';

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
            <Route path="/team" element={<Team />} />
            
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
              <Route path="backlog" element={<Backlog />} />
              <Route path="sprints" element={<Sprints />} />
              <Route path="code" element={<Code />} />
              <Route path="deployment" element={<Deployment />} />
              <Route path="task" element={<Task />} />
              <Route path="version" element={<Version />} />
            </Route>

            {/* Testing Routes */}
            <Route path="/testing">
              <Route index element={<Navigate to="bug" replace />} />
              <Route path="bug" element={<Bug />} />
              <Route path="Bug" element={<Bug />} />
              <Route path="cases" element={<Cases />} />
              <Route path="Cases" element={<Cases />} />
              <Route path="performance" element={<Performance />} />
              <Route path="Performance" element={<Performance />} />
              <Route path="uat" element={<Uat />} />
              <Route path="Uat" element={<Uat />} />
              <Route path="Runs" element={<div>Test Runs</div>} />
            </Route>
            
            <Route path="/tasks" element={<DevelopmentTask />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/time-tracking" element={<Tracking />} />
            {/* New top-level routes from sidebar */}
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/files" element={<Deliverables />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/activity" element={<Activity />} />
            {/* Reports Routes */}
            <Route path="/reports">
              <Route path="project-progress" element={<ProjectProgress />} />
              <Route path="team-performance" element={<TeamPerformance />} />
              <Route path="financial" element={<Finacial />} />
              <Route path="custom" element={<Custom />} />
            </Route>

            {/* Stage Management */}
            <Route path="/stage-transition" element={<StageTransition />} />

            {/* Client Portal Routes */}
            <Route path="/client">
              <Route path="dashboard" element={<ClientDashboard />} />
              <Route path="approvals" element={<ClientApprovals />} />
            </Route>

            {/* Settings placeholders */}
            <Route path="/settings">
              <Route path="project" element={<div>Project Settings</div>} />
              <Route path="organization" element={<div>Organization Settings</div>} />
              <Route path="integrations" element={<div>Integrations & Webhooks</div>} />
              <Route path="templates" element={<div>Templates</div>} />
              <Route path="audit" element={<div>Audit Trail</div>} />
            </Route>
            
            {/* Add other protected routes here */}
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;