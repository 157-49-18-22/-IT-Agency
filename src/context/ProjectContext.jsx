import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const { user, currentUser } = useContext(AuthContext);
  const [projects, setProjects] = useState(() => {
    // Load projects from localStorage if available
    try {
      const savedProjects = localStorage.getItem('projects');
      return savedProjects ? JSON.parse(savedProjects) : [];
    } catch (error) {
      console.error('Error loading projects from localStorage:', error);
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch projects from backend on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const { projectsAPI } = await import('../services/api');
        const response = await projectsAPI.getAllProjects();

        console.log('API Response:', response);

        // Handle different response structures
        let projectsData = [];
        if (response && response.data) {
          // If response.data is already an array
          if (Array.isArray(response.data)) {
            projectsData = response.data;
          }
          // If response.data has a projects property
          else if (response.data.projects && Array.isArray(response.data.projects)) {
            projectsData = response.data.projects;
          }
          // If response.data is an object with data property
          else if (response.data.data && Array.isArray(response.data.data)) {
            projectsData = response.data.data;
          }

          console.log('Processed projects data:', projectsData);
          setProjects(projectsData);

          // Also save to localStorage
          if (projectsData.length > 0) {
            localStorage.setItem('projects', JSON.stringify(projectsData));
          }
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err.message);
        // If API fails, try to use localStorage data
        try {
          const savedProjects = localStorage.getItem('projects');
          if (savedProjects) {
            const parsed = JSON.parse(savedProjects);
            // Ensure it's an array
            setProjects(Array.isArray(parsed) ? parsed : []);
          }
        } catch (storageErr) {
          console.error('Error loading from localStorage:', storageErr);
          setProjects([]); // Fallback to empty array
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we have a user
    if (user || currentUser) {
      fetchProjects();
    } else {
      setIsLoading(false);
    }
  }, [user, currentUser]);

  // Save to localStorage whenever projects change
  useEffect(() => {
    if (projects.length > 0) {
      try {
        localStorage.setItem('projects', JSON.stringify(projects));
      } catch (error) {
        console.error('Error saving projects to localStorage:', error);
      }
    }
  }, [projects]);

  const addProject = async (newProject) => {
    try {
      // Extract departments from team members
      const departments = [];
      let hasDesigner = false;

      const teamMembersWithDept = newProject.teamMembers.map(member => {
        // Check if any team member is a designer
        if (member.role && member.role.toLowerCase().includes('designer')) {
          hasDesigner = true;
        }

        if (member.department && !departments.includes(member.department)) {
          departments.push(member.department);
        }
        return member;
      });

      // If there's a designer, ensure UI/UX department is included
      if (hasDesigner && !departments.includes('UI/UX')) {
        departments.push('UI/UX');
      }


      // Transform data to match backend API format
      const projectData = {
        name: newProject.name || newProject.projectName,
        description: newProject.description || 'No description provided',
        clientId: typeof newProject.client === 'object' ? newProject.client.id : parseInt(newProject.clientId || newProject.client),
        status: newProject.status || 'Planning',
        priority: newProject.priority || 'Medium',
        currentPhase: newProject.currentPhase || 'UI/UX Design',
        startDate: newProject.startDate,
        endDate: newProject.endDate,
        budget: newProject.budget ? parseFloat(newProject.budget) : null,
        projectManagerId: user?.id || 1, // Use current user or default
        teamMemberIds: teamMembersWithDept.map(m => m.id) // Extract just the IDs
      };

      console.log('Sending project data to backend:', projectData);


      // Save to backend database via API
      const { projectsAPI } = await import('../services/api');
      const response = await projectsAPI.createProject(projectData);

      // Use the project returned from backend (with proper ID from database)
      const savedProject = response.data;

      // Also save to local state
      setProjects(prevProjects => [...prevProjects, savedProject]);

      return savedProject;
    } catch (error) {
      console.error('Error saving project to database:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error; // Re-throw so the component can handle it
    }
  };

  const updateProject = (id, updatedData) => {
    if (!Array.isArray(projects)) return;
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === id ? { ...project, ...updatedData } : project
      )
    );
  };

  const deleteProject = (id) => {
    if (!Array.isArray(projects)) return;
    setProjects(prevProjects => prevProjects.filter(project => project.id !== id));
  };

  const getProjectById = (id) => {
    if (!Array.isArray(projects)) return null;
    return projects.find(project => project.id === id);
  };

  const getActiveProjects = () => {
    if (!Array.isArray(projects)) return [];
    return projects.filter(project => (project.status || '').toLowerCase() === 'in progress' || (project.status || '').toLowerCase() === 'in-progress');
  };

  const getCompletedProjects = () => {
    if (!Array.isArray(projects)) return [];
    return projects.filter(project => (project.status || '').toLowerCase() === 'completed');
  };

  // Get projects by department
  const getProjectsByDepartment = (department) => {
    if (!department || !Array.isArray(projects)) return [];

    // Normalize department name for comparison
    const normalizedDept = department.toLowerCase().replace('-', '/');

    return projects.filter(project =>
      project.departments &&
      project.departments.some(dept =>
        dept.toLowerCase().replace(' ', '/') === normalizedDept
      )
    );
  };

  // Get projects assigned to a specific user
  const getProjectsByUser = (userId) => {
    if (!userId || !Array.isArray(projects)) return [];
    return projects.filter(project =>
      project.teamMembers && project.teamMembers.some(member => member.id === userId)
    );
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        isLoading,
        error,
        addProject,
        updateProject,
        deleteProject,
        getProjectById,
        getActiveProjects,
        getCompletedProjects,
        getProjectsByDepartment,
        getProjectsByUser
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectContext;
