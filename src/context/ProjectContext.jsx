import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

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

  const addProject = (newProject) => {
    // Extract departments from team members
    const departments = [];
    const teamMembersWithDept = newProject.teamMembers.map(member => {
      if (member.department && !departments.includes(member.department)) {
        departments.push(member.department);
      }
      return member;
    });

    const projectWithId = {
      ...newProject,
      teamMembers: teamMembersWithDept,
      departments: [...new Set(departments)], // Remove duplicates
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: newProject.status || 'planning',
      createdBy: user?.id || 'system'
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
      project.teamMembers.some(member => member.id === userId)
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
