import { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ProjectProvider } from './context/ProjectContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// Import Layouts
import MainLayout from './Components/Sidebar';
import DeveloperLayout from './Components/Layouts/DeveloperLayout';

// Import your components
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';
import AllProjects from './Components/AllProjects';
import NewProjects from './Components/NewProjects';
import Active from './Components/Active';
import Completed from './Components/Completed';

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

// Protected route with role-based layouts
const ProtectedRoute = () => {
  const { currentUser, isLoading } = useAuth();
  
  console.log('ProtectedRoute - currentUser:', currentUser);
  console.log('ProtectedRoute - isLoading:', isLoading);
  
  // Show loading state while checking auth
  if (isLoading) {
    console.log('ProtectedRoute - Loading user data...');
    return <div className="loading">Loading...</div>;
  }
  
  // Only redirect to login if we're done loading and there's no user
  if (!isLoading && !currentUser) {
    console.log('ProtectedRoute - No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // Check if user is a developer (case-insensitive comparison)
  const isDeveloper = currentUser && String(currentUser.role || '').toLowerCase() === 'developer';
  console.log('ProtectedRoute - isDeveloper:', isDeveloper);
  
  // Use the appropriate layout based on user role
  const Layout = isDeveloper ? DeveloperLayout : MainLayout;
  
  return (
    <div className="app-container">
      <Layout />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

// Main App Routes
const AppRoutes = () => {
  const { currentUser } = useAuth();
  // Case-insensitive role comparison
  const isDeveloper = currentUser && String(currentUser.role || '').toLowerCase() === 'developer';
  
  console.log('AppRoutes - currentUser:', currentUser);
  console.log('AppRoutes - isDeveloper:', isDeveloper);
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        {/* Common routes for all authenticated users */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/calendar" element={<Calendar />} />
        
        {/* Developer specific routes */}
        {isDeveloper && (
          <Route path="/development">
            <Route index element={<Navigate to="code" replace />} />
            <Route path="backlog" element={<Backlog />} />
            <Route path="sprints" element={<Sprints />} />
            <Route path="code" element={<Code />} />
            <Route path="deployment" element={<Deployment />} />
            <Route path="task" element={<Task />} />
            <Route path="version" element={<Version />} />
          </Route>
        )}
        
        {/* Admin only routes */}
        {!isDeveloper && currentUser && (
          <>
            <Route path="/projects">
              <Route index element={<AllProjects />} />
              <Route path="new" element={<NewProjects />} />
              <Route path="active" element={<Active />} />
              <Route path="completed" element={<Completed />} />
            </Route>
            
            <Route path="/team" element={<Team />} />
            
            {/* UI/UX Design Routes */}
            <Route path="/uiux" element={<Design />}>
              <Route index element={<Navigate to="wireframes" replace />} />
              <Route path="wireframes" element={<Wireframes />} />
              <Route path="mockups" element={<Mockups />} />
              <Route path="prototypes" element={<Prototypes />} />
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
              <Route path="cases" element={<Cases />} />
              <Route path="performance" element={<Performance />} />
              <Route path="uat" element={<Uat />} />
            </Route>
            
            <Route path="/tasks" element={<DevelopmentTask />} />
            <Route path="/time-tracking" element={<Tracking />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/files" element={<Deliverables />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/activity" element={<Activity />} />
            
            {/* Reports Routes */}
            <Route path="/reports">
              <Route index element={<Navigate to="project-progress" replace />} />
              <Route path="project-progress" element={<ProjectProgress />} />
              <Route path="team-performance" element={<TeamPerformance />} />
              <Route path="financial" element={<Finacial />} />
              <Route path="custom" element={<Custom />} />
            </Route>

            {/* Stage Management */}
            <Route path="/stage-transition/:projectId?" element={<StageTransition />} />

            {/* Client Portal */}
            <Route path="/client-portal">
              <Route index element={<ClientDashboard />} />
              <Route path="approvals" element={<ClientApprovals />} />
            </Route>
          </>
        )}
        
        {/* Catch all other routes */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <Router>
          <div className="app">
            <AppRoutes />
          </div>
        </Router>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;