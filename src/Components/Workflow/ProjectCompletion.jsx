import React from 'react';
import { Box, Typography, Button, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { FaCheckCircle, FaDownload, FaEnvelope, FaFilePdf, FaFileWord, FaFileArchive } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';

const ProjectCompletion = ({ projectId }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  const deliverables = [
    { id: 1, name: 'Final Source Code', type: 'zip', size: '24.5 MB' },
    { id: 2, name: 'Project Documentation', type: 'pdf', size: '3.2 MB' },
    { id: 3, name: 'API Documentation', type: 'pdf', size: '1.8 MB' },
    { id: 4, name: 'User Manual', type: 'docx', size: '2.1 MB' },
    { id: 5, name: 'Test Reports', type: 'pdf', size: '1.5 MB' },
  ];

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FaFilePdf style={{ color: '#f44336' }} />;
      case 'docx':
        return <FaFileWord style={{ color: '#2196f3' }} />;
      case 'zip':
        return <FaFileArchive style={{ color: '#ff9800' }} />;
      default:
        return <FaFilePdf />;
    }
  };

  const handleDownloadAll = () => {
    // TODO: Implement download all functionality
    console.log('Downloading all deliverables...');
  };

  const handleSendToClient = () => {
    // TODO: Implement send to client functionality
    console.log('Sending deliverables to client...');
  };

  const handleDownload = (file) => {
    // TODO: Implement individual file download
    console.log('Downloading:', file.name);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <FaCheckCircle style={{ fontSize: '4rem', color: '#4caf50', marginBottom: '1rem' }} />
        <Typography variant="h4" gutterBottom>
          Project Successfully Completed!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Congratulations! All phases have been completed successfully.
          The project is now ready for delivery to the client.
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Project Deliverables
        </Typography>
        
        <List sx={{ mb: 3 }}>
          {deliverables.map((file) => (
            <ListItem 
              key={file.id} 
              sx={{ 
                border: '1px solid #eee', 
                mb: 1, 
                borderRadius: 1,
                '&:hover': { bgcolor: '#f9f9f9' }
              }}
              secondaryAction={
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => handleDownload(file)}
                >
                  Download
                </Button>
              }
            >
              <ListItemIcon>
                {getFileIcon(file.type)}
              </ListItemIcon>
              <ListItemText 
                primary={file.name} 
                secondary={`${file.type.toUpperCase()} • ${file.size}`} 
              />
            </ListItem>
          ))}
        </List>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<FaDownload />}
            onClick={handleDownloadAll}
            sx={{ textTransform: 'none' }}
          >
            Download All
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<FaEnvelope />}
            onClick={handleSendToClient}
            sx={{ textTransform: 'none' }}
          >
            Send to Client
          </Button>
        </Box>
      </Paper>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          What would you like to do next?
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate(`/projects/${id || projectId}`)}
          >
            View Project
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/projects')}
          >
            All Projects
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/projects/new')}
          >
            New Project
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectCompletion;
