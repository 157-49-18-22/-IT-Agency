import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Stepper, Step, StepLabel, Typography, Paper } from '@mui/material';
import ProjectCreation from './ProjectCreation';
import UIPhase from './UIPhase';
import DevelopmentPhase from './DevelopmentPhase';
import TestingPhase from './TestingPhase';
import ProjectCompletion from './ProjectCompletion';

const steps = [
  'Project Creation',
  'UI/UX Phase',
  'Development Phase',
  'Testing Phase',
  'Project Completion'
];

const ProjectWorkflow = () => {
  const { projectId } = useParams();
  const [activeStep, setActiveStep] = useState(0);
  const [project, setProject] = useState(null);

  // Load project data when component mounts
  useEffect(() => {
    const fetchProject = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/projects/${projectId}`);
        // const data = await response.json();
        // setProject(data);
        // setActiveStep(data.currentStep || 0);
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
    // TODO: Update project step in the backend
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <ProjectCreation onNext={handleNext} project={project} />;
      case 1:
        return <UIPhase onNext={handleNext} onBack={handleBack} projectId={projectId} />;
      case 2:
        return <DevelopmentPhase onNext={handleNext} onBack={handleBack} projectId={projectId} />;
      case 3:
        return <TestingPhase onNext={handleNext} onBack={handleBack} projectId={projectId} />;
      case 4:
        return <ProjectCompletion projectId={projectId} />;
      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Project Workflow
        </Typography>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ mt: 2 }}>
          {renderStepContent(activeStep)}
        </Box>
      </Paper>
    </Box>
  );
};

export default ProjectWorkflow;
