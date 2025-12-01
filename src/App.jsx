import { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ProjectProvider } from './context/ProjectContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// Import Layouts
import MainLayout from './Components/Sidebar';
import DeveloperLayout from './Components/Layouts/DeveloperLayout';
import UILayout from './Components/Layouts/UILayout';
import Testing from './Components/Layouts/Testing';
import WorkflowManager from './Components/Workflow/WorkflowManager';

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
import TaskManagement from './Components/UIUX/TaskManagement';
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
import DepartmentProjects from './Components/DepartmentProjects';

// Import NEW Components
import Backlog from './Components/Development/Backlog';
import Sprints from './Components/Development/Sprints';
import StageTransition from './Components/StageManagement/StageTransition';
import ClientDashboard from './Components/ClientPortal/ClientDashboard';
import ClientApprovals from './Components/ClientPortal/ClientApprovals';

// Protected route with role-based layouts
const ProtectedRoute = () => {
  const { currentUser, isLoading, isDeveloper, isDesigner, isTester } = useAuth();

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

  console.log('ProtectedRoute - isDeveloper:', isDeveloper);
  console.log('ProtectedRoute - isDesigner:', isDesigner);
  console.log('ProtectedRoute - isTester:', isTester);

  // Use the appropriate layout based on user role
  let Layout = MainLayout; // Default to main layout

  if (isDeveloper) {
    Layout = DeveloperLayout;
  } else if (isDesigner) {
    Layout = UILayout;
  } else if (isTester) {
    Layout = Testing;
  }

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflow: 'hidden' }}>
      <Layout />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

// Main App Routes
const AppRoutes = () => {
  const { currentUser, isTester } = useAuth();
  // Case-insensitive role comparison
  const userRole = currentUser ? String(currentUser.role || '').toLowerCase() : '';
  const isDeveloper = userRole === 'developer';
  const isUIUX = userRole === 'ui/ux' || userRole === 'ui-ux' || userRole === 'ui ux' || userRole === 'designer';

  console.log('AppRoutes - currentUser:', currentUser);
  console.log('AppRoutes - userRole:', userRole);
  console.log('AppRoutes - isDeveloper:', isDeveloper);
  console.log('AppRoutes - isUIUX:', isUIUX);

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
        <Route path="/projects">
          <Route index element={<AllProjects />} />
          <Route path="new" element={!isDeveloper && !isUIUX && !isTester ? <NewProjects /> : <Navigate to="/projects" replace />} />
          <Route path="active" element={<Active />} />
          <Route path="completed" element={<Completed />} />
        </Route>
        <Route path="/task-management" element={<DevelopmentTask />} />

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

        {/* Tester specific routes */}
        {isTester && (
          <Route path="/testing">
            <Route index element={<Navigate to="bug" replace />} />
            <Route path="bug" element={<Bug />} />
            <Route path="cases" element={<Cases />} />
            <Route path="performance" element={<Performance />} />
            <Route path="uat" element={<Uat />} />
          </Route>
        )}

        {/* UI/UX specific routes */}
        {isUIUX && (
          <>
            <Route path="/design">
              <Route index element={<Navigate to="wireframes" replace />} />
              <Route path="wireframes" element={<Wireframes />} />
              <Route path="mockups" element={<Mockups />} />
              <Route path="prototypes" element={<Prototypes />} />
              <Route path="components" element={<div>UI Components</div>} />
              <Route path="styleguide" element={<div>Style Guide</div>} />
            </Route>
            <Route path="/tasks" element={<TaskManagement />} />
            <Route path="/tasks/:projectId" element={<TaskManagement />} />
            <Route path="/team" element={<Team />} />
          </>
        )}

        {/* Admin only routes */}
        {!isDeveloper && !isUIUX && !isTester && currentUser && (
          <>
            <Route path="/team" element={<Team />} />

            {/* Project Workflow Routes */}
            <Route path="/project/:projectId/workflow" element={<Navigate to="ui-ux" replace />} />
            <Route path="/project/:projectId/workflow/:phase" element={<WorkflowManager />} />

            {/* UI/UX Design Routes */}
            <Route path="/design" element={<Design />}>
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

            <Route path="tracking" element={<Tracking />} />
            <Route path="departments">
              <Route index element={<Navigate to="my-tasks" replace />} />
              <Route path="my-tasks" element={<DepartmentProjects department="my-tasks" />} />
              <Route path="development" element={<DepartmentProjects department="Development" />} />
              <Route path="ui-ux" element={<DepartmentProjects department="UI/UX" />} />
              <Route path="testing" element={<DepartmentProjects department="Testing" />} />
            </Route>
            <Route path="reports">
              <Route index element={<Navigate to="project-progress" replace />} />
              <Route path="project-progress" element={<ProjectProgress />} />
              <Route path="team-performance" element={<TeamPerformance />} />
              <Route path="financial" element={<Finacial />} />
              <Route path="custom" element={<Custom />} />
            </Route>
            <Route path="approvals" element={<Approvals />} />

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