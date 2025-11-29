import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Stepper, Step, StepLabel, Typography, Paper, Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import UILayout from '../Layouts/UILayout';
import DeveloperLayout from '../Layouts/DeveloperLayout';
import Testing from '../Layouts/Testing';
import { workflowAPI } from '../../services/workflowAPI';

const steps = [
  'UI/UX Phase',
  'Development',
  'Testing',
  'Completion'
];

const WorkflowManager = () => {
  const { projectId, phase } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState({});
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Map URL phase to step index and component
  const workflowSteps = [
    { 
      id: 'ui-ux', 
      label: 'UI/UX Phase',
      component: UILayout,
      nextPhase: 'development',
      canAccess: (completed) => true // First step is always accessible
    },
    { 
      id: 'development', 
      label: 'Development',
      component: DeveloperLayout,
      nextPhase: 'testing',
      canAccess: (completed) => completed['ui-ux'] === true
    },
    { 
      id: 'testing', 
      label: 'Testing',
      component: Testing,
      nextPhase: 'completion',
      canAccess: (completed) => completed['development'] === true
    },
    { 
      id: 'completion', 
      label: 'Completion',
      component: ProjectCompletion,
      canAccess: (completed) => completed['testing'] === true
    }
  ];

  // Create phase map for quick lookup
  const phaseMap = workflowSteps.reduce((acc, step, index) => {
    acc[step.id] = index;
    return acc;
  }, {});

  const fetchWorkflowStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await workflowAPI.getWorkflowStatus(projectId);
      setProject(response.data);
      
      // Update completed steps based on API response
      const completedPhases = response.data.completedPhases || {};
      setCompleted(completedPhases);
      
      // Determine current phase from URL or project data
      let currentPhase = phase || response.data.currentPhase || 'ui-ux';
      
      // Ensure user can access the requested phase
      const currentStepIndex = workflowSteps.findIndex(step => step.id === currentPhase);
      if (currentStepIndex !== -1) {
        const currentStep = workflowSteps[currentStepIndex];
        if (!currentStep.canAccess(completedPhases)) {
          // Redirect to the first incomplete phase
          const firstIncomplete = workflowSteps.find(step => !completedPhases[step.id]);
          if (firstIncomplete) {
            navigate(`/project/${projectId}/workflow/${firstIncomplete.id}`, { replace: true });
            return;
          }
        }
      }
      
      setActiveStep(phaseMap[currentPhase] || 0);
      
    } catch (err) {
      console.error('Error fetching workflow status:', err);
      setError('Failed to load workflow status. Please try again.');
      setSnackbar({
        open: true,
        message: 'Failed to load workflow status',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, phase, navigate]);

  useEffect(() => {
    fetchWorkflowStatus();
  }, [fetchWorkflowStatus]);

  const handleNext = async () => {
    try {
      setLoading(true);
      const currentStep = workflowSteps[activeStep];
      
      if (!currentStep) {
        throw new Error('Invalid workflow step');
      }
      
      // Mark current phase as completed
      await workflowAPI.completePhase(projectId, currentStep.id);
      
      // Update local state
      const newCompleted = { 
        ...completed, 
        [currentStep.id]: true 
      };
      setCompleted(newCompleted);
      
      // Move to next phase if exists
      if (currentStep.nextPhase) {
        await workflowAPI.updatePhase(projectId, currentStep.nextPhase);
        navigate(`/project/${projectId}/workflow/${currentStep.nextPhase}`);
      }
      
      setSnackbar({
        open: true,
        message: `Successfully completed ${currentStep.label} phase`,
        severity: 'success',
      });
      
    } catch (err) {
      console.error('Error completing phase:', err);
      setSnackbar({
        open: true,
        message: `Failed to complete phase: ${err.response?.data?.message || err.message}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = async () => {
    try {
      setLoading(true);
      const phaseMap = ['ui-ux', 'development', 'testing', 'completion'];
      const prevStep = activeStep - 1;
      
      if (prevStep >= 0) {
        const prevPhase = phaseMap[prevStep];
        await workflowAPI.updatePhase(projectId, prevPhase);
        navigate(`/project/${projectId}/workflow/${prevPhase}`);
      }
    } catch (err) {
      console.error('Error navigating to previous phase:', err);
      setSnackbar({
        open: true,
        message: 'Failed to navigate to previous phase',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (stepIndex) => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box p={3} textAlign="center">
          <Typography color="error">{error}</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={fetchWorkflowStatus}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Box>
      );
    }

    const currentStep = workflowSteps[stepIndex];
    if (!currentStep) {
      return <div>Invalid workflow step</div>;
    }

    // Check if user can access this step
    if (!currentStep.canAccess(completed)) {
      // Find first incomplete step
      const firstIncomplete = workflowSteps.find(step => !completed[step.id]);
      if (firstIncomplete) {
        navigate(`/project/${projectId}/workflow/${firstIncomplete.id}`, { replace: true });
        return null;
      }
    }

    const commonProps = {
      projectId,
      onComplete: handleNext,
      onError: (message) => {
        setSnackbar({
          open: true,
          message,
          severity: 'error',
        });
      }
    };

    const StepComponent = currentStep.component;
    return <StepComponent {...commonProps} />;
  };

  const ProjectCompletion = () => (
    <Box sx={{ textAlign: 'center', p: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Project Successfully Completed!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          All phases have been completed successfully.
        </Typography>
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate(`/projects/${projectId}`)}
      >
        Back to Project
      </Button>
    </Box>
  );

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3, position: 'relative' }}>
        {loading && (
          <Box 
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1,
            }}
          >
            <CircularProgress />
          </Box>
        )}
        
        <Typography variant="h4" gutterBottom>
          Project Workflow
          {project?.name && ` - ${project.name}`}
        </Typography>
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {workflowSteps.map((step, index) => {
            const isCompleted = completed[step.id];
            const isActive = index === activeStep;
            const isAccessible = step.canAccess(completed);
            
            return (
              <Step 
                key={step.id} 
                completed={isCompleted}
                disabled={!isAccessible && !isActive}
              >
                <StepLabel 
                  StepIconProps={{
                    sx: {
                      '&.Mui-completed': {
                        color: 'success.main',
                      },
                      '&.Mui-disabled': {
                        color: 'action.disabled',
                      },
                    },
                  }}
                >
                  {step.label}
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>
        
        <Box sx={{ mt: 2, mb: 2, minHeight: '400px' }}>
          {renderStepContent(activeStep)}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
          <Button
            disabled={activeStep === 0 || loading}
            onClick={handleBack}
            sx={{ mr: 1 }}
            variant="outlined"
          >
            Back
          </Button>
          <Box>
            {activeStep !== steps.length - 1 && (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
                sx={{ ml: 1 }}
              >
                {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WorkflowManager;
