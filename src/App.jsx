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
import DesignDeliverables from './Components/UI/DesignDeliverables';
import Client from './Components/UI/Client';

// Import Development Components
import Code from './Components/Development/Code';
import Deployment from './Components/Development/Deployment';
import DevelopmentTask from './Components/Development/Task';
import Version from './Components/Development/Version';
import Sprints from './Components/Development/Sprints';
import Backlog from './Components/Development/Backlog';
import ApprovedDesigns from './Components/Development/ApprovedDesigns';
import BugFixes from './Components/Development/BugFixes';
import UIUXMonitoring from './Components/Client/UIUXMonitoring';
import DevelopmentMonitoring from './Components/Client/DevelopmentMonitoring';
import TestingMonitoring from './Components/Client/TestingMonitoring';
import DeliverablesView from './Components/Client/DeliverablesView';
import FeedbackApproval from './Components/Client/FeedbackApproval';
import MessagesCenter from './Components/Client/MessagesCenter';

// Import Team Component
import Team from './Components/Team';
// Import standalone Tasks page
import Task from './Components/Development/Task';
import TaskManagement from './Components/UIUX/TaskManagement';
// Import Calendar Component
import Calendar from './Components/Calendar';
import Tracking from './Components/Tracking';
// Import Report Components
import ReportsProjectProgress from './Components/Reports/ProjectProgress';
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
import StageTransition from './Components/StageManagement/StageTransition';
import ClientApprovals from './Components/ClientPortal/ClientApprovals';

// Import ENHANCED Components (New Features)
import EnhancedDashboard from './Components/EnhancedDashboard';
import NotificationsCenter from './Components/NotificationsCenter';
import TaskBoard from './Components/Tasks/TaskBoard';
import DeliverablesManager from './Components/Deliverables/DeliverablesManager';

// Import Client Components
import ClientDashboard from './Components/Client/ClientDashboard';
import ClientLayout from './Components/Client/ClientLayout';
import ProjectProgress from './Components/Client/ProjectProgress';

// Import Developer Components
import AssignedTasks from './Components/Development/AssignedTasks';
import InProgressTasks from './Components/Development/InProgressTasks';
import CompletedTasks from './Components/Development/CompletedTasks';
import ApprovedProjects from './Components/Development/ApprovedProjects';
import EnvironmentSetup from './Components/Development/EnvironmentSetup';
import Blockers from './Components/Development/Blockers';
import CodingStandards from './Components/Development/CodingStandards';
import APIEndpoints from './Components/Development/APIEndpoints';
import Database from './Components/Development/Database';
import Integrations from './Components/Development/Integrations';
import DevelopmentTesting from './Components/Development/Testing';
import SelfTesting from './Components/Development/SelfTesting';
import CodeReview from './Components/Development/CodeReview';
import PeerReview from './Components/Development/PeerReview';
import VersionHistory from './Components/Development/VersionHistory';
import SubmissionChecklist from './Components/Development/SubmissionChecklist';
import DailyStandup from './Components/Development/DailyStandup';
import Discussions from './Components/Development/Discussions';
import Documentation from './Components/Development/Documentation';
import TimeLogs from './Components/Development/TimeLogs';
import ReviewFeedback from './Components/Development/ReviewFeedback';
import DeveloperDeliverables from './Components/Development/DeveloperDeliverables';

// Import Tester Components
import TestingDashboard from './Components/Testing/TestingDashboard';
import Bug from './Components/Testing/Bug';
import Cases from './Components/Testing/Cases';
import PerformanceTesting from './Components/Testing/PerformanceTesting';
import SecurityTesting from './Components/Testing/SecurityTesting';
import Uat from './Components/Testing/Uat';
import Performance from './Components/Testing/Performance';
import TestingApprovedProjects from './Components/Testing/ApprovedProjects';
import TestingDeliverables from './Components/Testing/TestingDeliverables';
import SubmitDeliverables from './Components/Testing/SubmitDeliverables';

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

  // DeveloperLayout, UILayout, and Testing already have <Outlet /> inside them
  // So we just render the Layout component
  return <Layout />;
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
        <Route path="/dashboard-enhanced" element={<EnhancedDashboard />} />
        <Route path="/notifications" element={<NotificationsCenter />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/projects">
          <Route index element={<AllProjects />} />
          <Route path="new" element={!isDeveloper && !isUIUX && !isTester ? <NewProjects /> : <Navigate to="/projects" replace />} />
          <Route path="active" element={<Active />} />
          <Route path="completed" element={<Completed />} />
        </Route>
        <Route path="/task-management" element={<DevelopmentTask />} />

        {/* Task Board */}
        <Route path="/tasks/board" element={<TaskBoard />} />
        <Route path="/tasks/board/:projectId" element={<TaskBoard />} />

        {/* Deliverables */}
        <Route path="/deliverables" element={<DeliverablesManager />} />
        <Route path="/projects/:projectId/deliverables" element={<DeliverablesManager />} />

        {/* Stage Transition */}
        <Route path="/projects/:projectId/stage-transition" element={<StageTransition />} />

        {/* Client Portal */}
        <Route path="/client/dashboard" element={<ClientDashboard />} />
        <Route path="/client/approvals" element={<ClientApprovals />} />

        {/* Developer specific routes */}
        {isDeveloper && (
          <>
            {/* Task Management Routes */}
            <Route path="/tasks/assigned" element={<AssignedTasks />} />
            <Route path="/tasks/in-progress" element={<InProgressTasks />} />
            <Route path="/tasks/completed" element={<CompletedTasks />} />
            <Route path="/tasks/design-files" element={<ApprovedDesigns />} />
            <Route path="/tasks/environment-setup" element={<EnvironmentSetup />} />
            <Route path="/tasks/blockers" element={<Blockers />} />
            <Route path="/projects/approved" element={<ApprovedProjects />} />

            {/* Development Routes */}
            <Route path="/development">
              <Route index element={<Navigate to="code" replace />} />
              <Route path="code" element={<Code />} />
              <Route path="coding-standards" element={<CodingStandards />} />
              <Route path="apis" element={<APIEndpoints />} />
              <Route path="database" element={<Database />} />
              <Route path="integrations" element={<Integrations />} />
              <Route path="testing" element={<DevelopmentTesting />} />
              <Route path="self-testing" element={<SelfTesting />} />
              <Route path="code-review" element={<CodeReview />} />
              <Route path="peer-review" element={<PeerReview />} />
              <Route path="version-history" element={<VersionHistory />} />
              <Route path="sprints" element={<Sprints />} />
              <Route path="bug-fixes" element={<BugFixes />} />
              <Route path="backlog" element={<Backlog />} />
              <Route path="deployment" element={<Deployment />} />
            </Route>

            {/* Deliverables Routes */}
            <Route path="/deliverables/checklist" element={<SubmissionChecklist />} />
            <Route path="/deliverables/code-review" element={<CodeReview />} />
            <Route path="/deliverables/peer-review" element={<PeerReview />} />
            <Route path="/deliverables/history" element={<VersionHistory />} />
            <Route path="/deliverables/feedback" element={<ReviewFeedback />} />
            <Route path="/deliverables/submit" element={<DeveloperDeliverables />} />

            {/* Time Tracking Routes */}
            <Route path="/time-logs" element={<TimeLogs />} />

            {/* Collaboration Routes */}
            <Route path="/collaboration/standup" element={<DailyStandup />} />
            <Route path="/collaboration/code-reviews" element={<CodeReview />} />
            <Route path="/collaboration/discussions" element={<Discussions />} />
            <Route path="/collaboration/documentation" element={<Documentation />} />

            {/* Calendar */}
            <Route path="/calendar" element={<div>Calendar</div>} />
          </>
        )}
        {/* Tester specific routes */}
        {isTester && (
          <Route path="/testing">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TestingDashboard />} />
            <Route path="bug" element={<Bug />} />
            <Route path="cases" element={<Cases />} />
            <Route path="performance" element={<PerformanceTesting />} />
            <Route path="security" element={<SecurityTesting />} />

            <Route path="uat" element={<Uat />} />
            <Route path="approved" element={<TestingApprovedProjects />} />
            <Route path="deliverables" element={<TestingDeliverables />} />
            <Route path="submit" element={<SubmitDeliverables />} />
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
              <Route path="design-system" element={<div>Design System - Work in Progress</div>} />
              <Route path="client-approval" element={<div>Client Approval - Work in Progress</div>} />
            </Route>
            <Route path="/files" element={<DesignDeliverables />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/tasks" element={<TaskManagement />} />
            <Route path="/tasks/:projectId" element={<TaskManagement />} />
            <Route path="/team" element={<Team />} />
          </>
        )}

        {/* Client routes */}
        {currentUser?.role === 'client' && (
          <Route path="/client" element={<ClientLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="progress" element={<ProjectProgress />} />
            <Route path="uiux-monitoring" element={<UIUXMonitoring />} />
            <Route path="development-monitoring" element={<DevelopmentMonitoring />} />
            <Route path="testing-monitoring" element={<TestingMonitoring />} />
            <Route path="deliverables" element={<DeliverablesView />} />
            <Route path="feedback" element={<FeedbackApproval />} />
            <Route path="messages" element={<MessagesCenter />} />
            <Route path="notifications" element={<div>Notifications - Coming Soon</div>} />
          </Route>
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
              <Route path="design-system" element={<div>Design System - Work in Progress</div>} />
              <Route path="client-approval" element={<div>Client Approval - Work in Progress</div>} />
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
              <Route path="project-progress" element={<ReportsProjectProgress />} />
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