import React, { createContext, useState, useEffect } from 'react';

export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState(() => {
    // Load projects from localStorage if available
    const savedProjects = localStorage.getItem('projects');
    return savedProjects ? JSON.parse(savedProjects) : [];
  });

  // Save to localStorage whenever projects change
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  const addProject = (newProject) => {
    const projectWithId = {
      ...newProject,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: newProject.status || 'planning'
    };
    
    setProjects(prevProjects => [...prevProjects, projectWithId]);
    return projectWithId;
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

  return (
    <ProjectContext.Provider 
      value={{
        projects,
        addProject,
        updateProject,
        deleteProject,
        getProjectById,
        getActiveProjects,
        getCompletedProjects
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectContext;
