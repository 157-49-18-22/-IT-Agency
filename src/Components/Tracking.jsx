import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FiPlay, FiPause, FiStopCircle, FiClock, FiTag, FiFilter, FiChevronDown, FiPlus, FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Tracking.css';
import { timeTrackingAPI, projectAPI } from '../services/api';

// Format time in HH:MM:SS
function fmtHMS(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

export default function Tracking() {
  const [entries, setEntries] = useState([]);
  const [filterProject, setFilterProject] = useState('all');
  const [filterMember, setFilterMember] = useState('all');
  const [range, setRange] = useState({ from: '', to: '' });
  const [projects, setProjects] = useState([
    { id: '1', name: 'Website Project' },
    { id: '2', name: 'Mobile App' },
    { id: '3', name: 'API Development' }
  ]);
  const [members, setMembers] = useState([
    'John Doe (Developer)',
    'Jane Smith (Designer)',
    'Alex Johnson (PM)',
    'Sarah Lee (QA)',
    'Mike Brown (DevOps)'
  ]);

  // Timer state
  const [running, setRunning] = useState(false);
  const [current, setCurrent] = useState({ 
    projectId: '', 
    projectName: '',
    task: '', 
    member: '', 
    notes: '' 
  });
  const [seconds, setSeconds] = useState(0);
  const [activeTimer, setActiveTimer] = useState(null);
  const timerRef = useRef(null);

  // Modal for add/edit manual entry
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    project: '', 
    task: '', 
    member: '', 
    notes: '', 
    hours: 0, 
    minutes: 30 
  });

  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Default projects in case API call fails
        const defaultProjects = [
          { id: '1', name: 'Website Project' },
          { id: '2', name: 'Mobile App' },
          { id: '3', name: 'API Development' }
        ];
        
        let projectsData = [];
        let membersData = [];
        let timeEntries = [];
        
        // Fetch projects
        try {
          console.log('Fetching projects...');
          const projectsResponse = await projectAPI.getAll();
          console.log('Projects response:', projectsResponse);
          
          // Handle different response structures
          projectsData = Array.isArray(projectsResponse) 
            ? projectsResponse 
            : (projectsResponse?.data || []);
            
          if (!Array.isArray(projectsData)) {
            console.warn('Unexpected projects data format, using default projects');
            projectsData = [];
          }
          
        } catch (error) {
          console.error('Error fetching projects:', error);
          toast.error('Failed to load projects. Using default data.');
          projectsData = [];
        }
        
        // If no projects from API, use defaults
        if (projectsData.length === 0) {
          projectsData = defaultProjects;
        }
        
        setProjects(projectsData);
        
        // Fetch time entries
        try {
          console.log('Fetching time entries...');
          const entriesResponse = await timeTrackingAPI.getAll();
          timeEntries = Array.isArray(entriesResponse) 
            ? entriesResponse 
            : (entriesResponse?.data || []);
          console.log('Time entries loaded:', timeEntries.length);
        } catch (error) {
          console.error('Error fetching time entries:', error);
          toast.error('Failed to load time entries. Some data may be missing.');
          timeEntries = [];
        }
        
        setEntries(timeEntries);
        
        // Fetch members
        try {
          console.log('Fetching members...');
          const membersResponse = await fetch('http://localhost:5000/api/users?role=member');
          
          if (membersResponse.ok) {
            const data = await membersResponse.json();
            membersData = Array.isArray(data) 
              ? data.map(user => user.name || user.username || user.email || user)
              : [];
          } else {
            console.warn('Failed to fetch members, using defaults');
            throw new Error('Failed to fetch members');
          }
        } catch (error) {
          console.warn('Error fetching members, using default members:', error);
          membersData = [
            'John Doe (Developer)',
            'Jane Smith (Designer)',
            'Alex Johnson (PM)',
            'Sarah Lee (QA)',
            'Mike Brown (DevOps)'
          ];
        }
        
        setMembers(membersData);
        
        // Set default values will be handled after projects and members are loaded
        setCurrent({
          projectId: defaultProject?.id || '',
          projectName: defaultProject?.name || '',
          task: '',
          member: defaultMember,
          notes: ''
        });
        
        setForm(prev => ({
          ...prev,
          project: defaultProject,
          member: defaultMember
        }));
        
        // Check for active timer
        try {
          const activeTimerResponse = await timeTrackingAPI.getActive();
          if (activeTimerResponse.data) {
            setActiveTimer(activeTimerResponse.data);
            const startTime = new Date(activeTimerResponse.data.startTime);
            const now = new Date();
            setSeconds(Math.floor((now - startTime) / 1000));
            start();
          }
        } catch (error) {
          console.error('Error checking for active timer:', error);
        }

        // Try to fetch members from API with fallback
        try {
          const membersResponse = await fetch('http://localhost:5000/api/users?role=member');
          if (membersResponse.ok) {
            const membersData = await membersResponse.json();
            const memberNames = Array.isArray(membersData)
              ? membersData.map(user => user.name || user.username || user.email || user)
              : [];
            
            // If no members from API, use our default members
            if (memberNames.length === 0) {
              console.log('No members from API, using default members');
              setMembers([
                'John Doe (Developer)',
                'Jane Smith (Designer)',
                'Alex Johnson (PM)',
                'Sarah Lee (QA)',
                'Mike Brown (DevOps)'
              ]);
            } else {
              setMembers(memberNames);
            }
          } else {
            console.warn('API returned non-OK status, using default members');
            setMembers([
              'John Doe (Developer)',
              'Jane Smith (Designer)',
              'Alex Johnson (PM)',
              'Sarah Lee (QA)',
              'Mike Brown (DevOps)'
            ]);
          }
        } catch (error) {
          console.warn('Error fetching members, using default members:', error);
          setMembers([
            'John Doe (Developer)',
            'Jane Smith (Designer)',
            'Alex Johnson (PM)',
            'Sarah Lee (QA)',
            'Mike Brown (DevOps)'
          ]);
        }

        // Debug logging
        console.log('Projects:', projects);
        console.log('Members:', members);
        
        // Ensure projects and members are arrays
        const safeProjects = Array.isArray(projects) ? projects : [];
        const safeMembers = Array.isArray(members) ? members : [];
        
        // Set default values after loading projects and members
        const defaultProject = safeProjects.length > 0 ? safeProjects[0] : null;
        const defaultMember = safeMembers.length > 0 ? safeMembers[0] : '';
        
        console.log('Default Project:', defaultProject);
        console.log('Default Member:', defaultMember);
        
        setCurrent({
          projectId: defaultProject ? defaultProject.id : '',
          projectName: defaultProject ? defaultProject.name : '',
          task: '',
          member: defaultMember,
          notes: ''
        });
        
        setForm(prev => ({
          ...prev,
          project: defaultProject,
          member: defaultMember
        }));

        // Check for active timer
        const activeTimerResponse = await timeTrackingAPI.getActive();
        if (activeTimerResponse.data) {
          setActiveTimer(activeTimerResponse.data);
          const startTime = new Date(activeTimerResponse.data.startTime);
          const now = new Date();
          setSeconds(Math.floor((now - startTime) / 1000));
          start();
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load time tracking data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Fetch time entries when filters change
  useEffect(() => {
    const fetchFilteredEntries = async () => {
      try {
        setLoading(true);
        const params = {};
        if (filterProject !== 'all') params.project = filterProject;
        if (filterMember !== 'all') params.member = filterMember;
        if (range.from) params.startDate = range.from;
        if (range.to) params.endDate = range.to;

        const response = await timeTrackingAPI.getAll({ params });
        setEntries(response.data || []);
      } catch (error) {
        console.error('Error fetching filtered entries:', error);
        toast.error('Failed to filter entries');
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredEntries();
  }, [filterProject, filterMember, range]);

  const handleStartTimer = async () => {
    try {
      if (!current.projectId) {
        throw new Error('Please select a project');
      }

      // Get user ID from localStorage or auth context
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }

      const response = await timeTrackingAPI.start({
        projectId: current.projectId,
        task: current.task,
        userId: user.id,
        description: current.notes,
        startTime: new Date()
      });
      
      setActiveTimer(response.data);
      start();
      toast.success('Timer started');
    } catch (error) {
      console.error('Error starting timer:', error);
      toast.error(error.message || 'Failed to start timer');
    }
  };

  const handleStopTimer = async () => {
    try {
      if (!activeTimer) return;
      
      await timeTrackingAPI.stop(activeTimer.id);
      setActiveTimer(null);
      reset();
      
      // Refresh entries
      const response = await timeTrackingAPI.getAll();
      setEntries(response.data || []);
      
      toast.success('Timer stopped and time logged');
    } catch (error) {
      console.error('Error stopping timer:', error);
      toast.error('Failed to stop timer');
    }
  };

  const start = () => {
    if (running) return;
    setRunning(true);
    timerRef.current = setInterval(() => setSeconds(prev => prev + 1), 1000);
  };

  const pause = () => { 
    setRunning(false); 
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const reset = () => { 
    setRunning(false); 
    if (timerRef.current) clearInterval(timerRef.current); 
    setSeconds(0); 
    setCurrent(prev => ({
      ...prev,
      task: '',
      notes: ''
    }));
  };

  const stopAndLog = async () => {
    if (seconds === 0) {
      toast.info('No time to log');
      return;
    }
    
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() - (seconds * 1000));
      
      // Get user ID from localStorage or auth context
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        const error = new Error('User not authenticated');
        console.error('Authentication error:', error);
        toast.error('Please log in to track time');
        return;
      }

      // Ensure we have a project ID
      if (!current.projectId) {
        const error = new Error('No project selected');
        console.error('Validation error:', error);
        toast.error('Please select a project before saving time entry');
        return;
      }
      
      // Create the time entry with only the required fields
      // Let the backend handle defaults and calculations
      const timeEntry = {
        startTime: startTime, // Send as Date object
        endTime: now,        // Send as Date object
        projectId: Number(current.projectId),
        description: current.notes || null,
        isBillable: true,
        // Don't send duration as it's calculated by the backend
        // Don't send userId as it's set by the protect middleware
      };

      console.log('Creating time entry:', {
        ...timeEntry,
        startTime: timeEntry.startTime.toISOString(),
        endTime: timeEntry.endTime.toISOString()
      });
      
      // Show loading state
      const toastId = toast.loading('Saving time entry...');
      
      try {
        const response = await timeTrackingAPI.create(timeEntry);
        console.log('Time entry created successfully:', response.data);
        
        // Refresh entries
        const entriesResponse = await timeTrackingAPI.getAll();
        setEntries(entriesResponse.data || []);
        
        reset();
        toast.update(toastId, {
          render: 'Time entry saved successfully',
          type: 'success',
          isLoading: false,
          autoClose: 3000
        });
      } catch (error) {
        console.error('API Error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to save time entry';
        console.error('Error details:', error.response?.data);
        toast.update(toastId, {
          render: `Error: ${errorMessage}`,
          type: 'error',
          isLoading: false,
          autoClose: 5000
        });
        throw error;
      }
    } catch (error) {
      console.error('Error saving time entry:', error);
      toast.error('Failed to save time entry');
    }
  };

  // Ensure entries is always an array and handle potential undefined/null values
  const safeEntries = Array.isArray(entries) ? entries : [];
  
  const totalSeconds = useMemo(() => {
    try {
      return safeEntries.reduce((sum, e) => {
        // Ensure e.seconds is a number, default to 0 if not
        const seconds = typeof e.seconds === 'number' ? e.seconds : 0;
        return sum + seconds;
      }, 0);
    } catch (error) {
      console.error('Error calculating total seconds:', error);
      return 0;
    }
  }, [safeEntries]);

  const todayKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }, []);

  const todaySeconds = useMemo(() => {
    try {
      return safeEntries
        .filter(e => e && e.date === todayKey)
        .reduce((sum, e) => {
          const seconds = typeof e.seconds === 'number' ? e.seconds : 0;
          return sum + seconds;
        }, 0);
    } catch (error) {
      console.error('Error calculating today\'s seconds:', error);
      return 0;
    }
  }, [safeEntries, todayKey]);

  const filtered = useMemo(() => {
    try {
      return safeEntries.filter(e => {
        if (!e) return false; // Skip null/undefined entries
        if (filterProject !== 'all' && e.project !== filterProject) return false;
        if (filterMember !== 'all' && e.member !== filterMember) return false;
        if (range.from && e.date < range.from) return false;
        if (range.to && e.date > range.to) return false;
        return true;
      });
    } catch (error) {
      console.error('Error filtering entries:', error);
      return [];
    }
  }, [entries, filterProject, filterMember, range]);

  const groupedByDate = useMemo(() => {
    const map = new Map();
    filtered.forEach(e => {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date).push(e);
    });
    return Array.from(map.entries()).sort((a,b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const openAdd = (entry) => {
    if (entry) {
      setEditingId(entry.id);
      const hours = Math.floor(entry.seconds/3600);
      const minutes = Math.round((entry.seconds%3600)/60);
      setForm({ 
        date: entry.date, 
        project: entry.project, 
        task: entry.task, 
        member: entry.member, 
        notes: entry.notes, 
        hours, 
        minutes 
      });
    } else {
      setEditingId(null);
      setForm({ 
        date: new Date().toISOString().split('T')[0], 
        project: projects[0] ? projects[0].id : '', 
        task: '', 
        member: members[0] || '', 
        notes: '', 
        hours: 0, 
        minutes: 30 
      });
    }
    setShowModal(true);
  };

  const saveEntry = async () => {
    const secs = (Number(form.hours)||0)*3600 + (Number(form.minutes)||0)*60;
    if (!form.date || secs <= 0) {
      toast.error('Please enter a valid date and time');
      return;
    }

    try {
      // Parse the date and calculate start/end times
      const startTime = new Date(form.date);
      const endTime = new Date(startTime.getTime() + (secs * 1000));
      
      // Get user ID from localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }

      // Format data according to backend expectations
      const entryData = {
        startTime: startTime,
        endTime: endTime,
        projectId: Number(form.project),
        description: form.notes || null,
        isBillable: true,
        // The backend will set userId from the auth token
      };

      console.log('Saving time entry:', {
        ...entryData,
        startTime: entryData.startTime.toISOString(),
        endTime: entryData.endTime.toISOString()
      });

      if (editingId) {
        // Update existing entry
        await timeTrackingAPI.update(editingId, entryData);
        toast.success('Time entry updated successfully');
      } else {
        // Create new entry
        await timeTrackingAPI.create(entryData);
        toast.success('Time entry created successfully');
      }

      // Refresh entries
      const response = await timeTrackingAPI.getAll();
      setEntries(response.data || []);
      setShowModal(false);
    } catch (error) {
      console.error('Error saving time entry:', error);
      toast.error(`Failed to ${editingId ? 'update' : 'create'} time entry`);
    }
  };

  const deleteEntry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      await timeTrackingAPI.delete(id);
      
      // Refresh entries
      const response = await timeTrackingAPI.getAll();
      setEntries(response.data || []);
      
      toast.success('Time entry deleted successfully');
    } catch (error) {
      console.error('Error deleting time entry:', error);
      toast.error('Failed to delete time entry');
    }
  };

  return (
    <div className="time-tracking-container">
      <div className="track-header">
        <div>
          <h2>Time Tracking</h2>
          <p>Track time with a live timer, manage timesheets, and view daily/weekly totals.</p>
        </div>
        <div className="header-actions">
          <button className="primary-btn" onClick={() => openAdd(null)}><FiPlus/> Add Entry</button>
        </div>
      </div>

      {/* Timer */}
      <div className="timer-card">
        <div className="timer-left">
          <div className="hms"><FiClock/> {fmtHMS(seconds)}</div>
          <div className="timer-controls">
            {!running ? (
              <button 
                className="btn success" 
                onClick={handleStartTimer}
                disabled={!current.projectId || !current.member}
              >
                <FiPlay/> {activeTimer ? 'Resume' : 'Start'}
              </button>
            ) : (
              <button className="btn warning" onClick={pause}><FiPause/> Pause</button>
            )}
            <button 
              className="btn" 
              onClick={reset}
              disabled={!running && seconds === 0}
            >
              <FiStopCircle/> Reset
            </button>
            <button 
              className="btn primary" 
              onClick={activeTimer ? handleStopTimer : stopAndLog} 
              disabled={!running && seconds === 0}
            >
              <FiTag/> {activeTimer ? 'Stop & Save' : 'Log Time'}
            </button>
          </div>
        </div>
        <div className="timer-right">
          <div className="form-row">
            <div className="form-group">
              <label>Project *</label>
              <div className="custom-select">
                <select 
                  value={current.projectId || ''}
                  onChange={e => {
                    const projectId = e.target.value;
                    const selectedProject = projects.find(p => p.id === projectId);
                    console.log('Selected project ID:', projectId, 'Project:', selectedProject);
                    setCurrent(prev => ({
                      ...prev,
                      projectId: selectedProject ? selectedProject.id : '',
                      projectName: selectedProject ? selectedProject.name : ''
                    }));
                  }}
                  className="form-control select-dropdown"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 36px 10px 12px',
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1em',
                    appearance: 'none',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    lineHeight: '1.25rem',
                    color: '#111827',
                    backgroundColor: '#fff',
                    transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                    cursor: 'pointer'
                  }}
                >
                  <option value="" style={{ padding: '10px', background: '#fff', color: '#111' }}>
                    {projects.length > 0 ? 'Select Project' : 'Loading projects...'}
                  </option>
                  {Array.isArray(projects) && projects.map((project) => (
                    <option 
                      key={project.id} 
                      value={project.id}
                      style={{ 
                        padding: '10px 15px',
                        background: '#fff',
                        color: '#111',
                        fontSize: '14px'
                      }}
                    >
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Task</label>
              <input value={current.task} onChange={e=>setCurrent({...current, task:e.target.value})} placeholder="What are you doing?"/>
            </div>
            <div className="form-group">
              <label>Member *</label>
              <div className="custom-select">
                <select 
                  value={current.member || ''} 
                  onChange={e => setCurrent({...current, member: e.target.value})}
                  className="form-control select-dropdown"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 36px 10px 12px',
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '16px',
                    cursor: 'pointer',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none'
                  }}
                >
                  <option value="" style={{ padding: '10px', background: '#fff', color: '#111' }}>Select Member</option>
                  {Array.isArray(members) && members.map((m, i) => (
                    <option 
                      key={i} 
                      value={m}
                      style={{ 
                        padding: '10px 15px',
                        background: '#fff',
                        color: '#111',
                        fontSize: '14px'
                      }}
                    >
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <input value={current.notes} onChange={e=>setCurrent({...current, notes:e.target.value})} placeholder="Optional notes"/>
          </div>
        </div>
        <div className="timer-summary">
          <div className="sum-item">
            <div className="sum-label">Today</div>
            <div className="sum-value">{fmtHMS(todaySeconds)}</div>
          </div>
          <div className="sum-item">
            <div className="sum-label">All Time</div>
            <div className="sum-value">{fmtHMS(totalSeconds)}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter">
          <FiFilter className="icon"/>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select 
              value={filterProject}
              onChange={e => setFilterProject(e.target.value)}
              className="form-select mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              required
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <FiChevronDown className="chev"/>
        </div>
        <div className="filter">
          <select value={filterMember} onChange={e=>setFilterMember(e.target.value)}>
            <option value="all">All Members</option>
            {members.map((m, index) => <option key={index} value={m}>{m}</option>)}
          </select>
          <FiChevronDown className="chev"/>
        </div>
        <div className="daterange">
          <FiCalendar className="icon"/>
          <input type="date" value={range.from} onChange={e=>setRange(r=>({...r, from:e.target.value}))}/>
          <span>to</span>
          <input type="date" value={range.to} onChange={e=>setRange(r=>({...r, to:e.target.value}))}/>
        </div>
      </div>

      {/* Timesheet */}
      <div className="sheet">
        <div className="sheet-header">
          <div>Date</div>
          <div>Project</div>
          <div>Task</div>
          <div>Member</div>
          <div>Notes</div>
          <div className="right">Duration</div>
          <div className="right">Actions</div>
        </div>
        <div className="sheet-body">
          {groupedByDate.map(([date, items]) => (
            <div key={date} className="date-group">
              <div className="date-row"><span>{date}</span><span className="total">{fmtHMS(items.reduce((s,e)=>s+e.seconds,0))}</span></div>
              {items.map(e => (
                <div key={e.id} className="sheet-row">
                  <div>{e.date}</div>
                  <div>{e.project}</div>
                  <div className="truncate" title={e.task}>{e.task}</div>
                  <div>{e.member}</div>
                  <div className="truncate" title={e.notes}>{e.notes || '—'}</div>
                  <div className="right mono">{fmtHMS(e.seconds)}</div>
                  <div className="right actions">
                    <button className="icon-btn" title="Edit" onClick={()=>openAdd(e)}><FiEdit2/></button>
                    <button className="icon-btn" title="Delete" onClick={()=>deleteEntry(e.id)}><FiTrash2/></button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Entry' : 'Add Entry'}</h3>
              <button className="close" onClick={()=>setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <div className="date-input">
                    <input 
                      type="date" 
                      value={form.date} 
                      onChange={e => setForm({...form, date: e.target.value})} 
                      required
                      max={new Date().toISOString().split('T')[0]}
                    />
                    <FiCalendar className="icon" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Project</label>
                  <select 
                    value={form.project} 
                    onChange={e => setForm({...form, project: e.target.value})}
                  >
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Task</label>
                  <input value={form.task} onChange={e=>setForm({...form, task:e.target.value})} placeholder="Task name"/>
                </div>
                <div className="form-group">
                  <label>Member *</label>
                  <select 
                    value={form.member} 
                    onChange={e => setForm({...form, member: e.target.value})}
                    required
                  >
                    <option value="">Select Member</option>
                    {members.map(m => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <input value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} placeholder="Optional"/>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Time Spent *</label>
                  <div className="time-inputs">
                    <input 
                      type="number" 
                      min="0" 
                      max="24"
                      value={form.hours} 
                      onChange={e => setForm({...form, hours: Math.min(24, Math.max(0, parseInt(e.target.value) || 0))})} 
                      placeholder="Hours"
                      required
                    />
                    <span>:</span>
                    <input 
                      type="number" 
                      min="0" 
                      max="59" 
                      value={form.minutes} 
                      onChange={e => setForm({...form, minutes: Math.min(59, Math.max(0, parseInt(e.target.value) || 0))})} 
                      placeholder="Minutes"
                      required
                    />
                  </div>
                  {(form.hours === 0 && form.minutes === 0) && (
                    <p className="error">Please enter a valid time (greater than 0)</p>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
              <button 
                className="btn primary" 
                onClick={saveEntry}
                disabled={!form.date || !form.project || !form.member || (form.hours === 0 && form.minutes === 0)}
              >
                {editingId ? 'Update Entry' : 'Add Entry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
