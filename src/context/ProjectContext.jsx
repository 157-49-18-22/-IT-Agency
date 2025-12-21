import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState(() => {
    // Load projects from localStorage if available
    const savedProjects = localStorage.getItem('projects');
    return savedProjects ? JSON.parse(savedProjects) : [];
  });

  // Save to localStorage whenever projects change
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
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
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === id ? { ...project, ...updatedData } : project
      )
    );
  };

  const deleteProject = (id) => {
    setProjects(prevProjects => prevProjects.filter(project => project.id !== id));
  };

  const getProjectById = (id) => {
    return projects.find(project => project.id === id);
  };

  const getActiveProjects = () => {
    return projects.filter(project => project.status === 'in-progress');
  };

  const getCompletedProjects = () => {
    return projects.filter(project => project.status === 'completed');
  };

  // Get projects by department
  const getProjectsByDepartment = (department) => {
    if (!department) return [];

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
    if (!userId) return [];
    return projects.filter(project =>
      project.teamMembers && project.teamMembers.some(member => member.id === userId)
    );
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
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
