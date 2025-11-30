import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  IconButton, 
  Menu, 
  MenuItem,
  TextField,
  Button,
  Box,
  LinearProgress
} from '@mui/material';
import { 
  FaEllipsisV, 
  FaCheck, 
  FaPaperclip, 
  FaComment, 
  FaClock,
  FaTrash,
  FaEdit,
  FaCheckCircle,
  FaRegCircle
} from 'react-icons/fa';
import { format } from 'date-fns';

const TaskItem = ({ 
  task, 
  onStatusChange, 
  onAddComment, 
  onFileUpload,
  onDelete,
  onUpdate
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [comment, setComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({ ...task });

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusToggle = () => {
    const newStatus = task.status === 'Completed' ? 'In Progress' : 'Completed';
    onStatusChange(task.id, newStatus);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    onAddComment(task.id, comment);
    setComment('');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(task.id, e.target.files[0]);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    handleMenuClose();
  };

  const handleSave = () => {
    onUpdate(task.id, editedTask);
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Card className="task-card">
      <CardContent>
        <div className="task-header">
          {isEditing ? (
            <TextField
              name="title"
              value={editedTask.title}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              size="small"
              margin="dense"
            />
          ) : (
            <Typography variant="h6" component="h3">
              {task.title}
            </Typography>
          )}
          <div className="task-actions">
            <IconButton onClick={handleStatusToggle} size="small">
              {task.status === 'Completed' ? (
                <FaCheckCircle className="completed-icon" />
              ) : (
                <FaRegCircle className="incomplete-icon" />
              )}
            </IconButton>
            <IconButton onClick={handleMenuOpen} size="small">
              <FaEllipsisV />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleEdit}>
                <FaEdit style={{ marginRight: 8 }} /> Edit
              </MenuItem>
              <MenuItem onClick={() => onDelete(task.id)}>
                <FaTrash style={{ marginRight: 8 }} /> Delete
              </MenuItem>
            </Menu>
          </div>
        </div>

        {isEditing ? (
          <Box mt={2}>
            <TextField
              name="description"
              label="Description"
              value={editedTask.description}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              margin="normal"
            />
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button 
                variant="outlined" 
                onClick={() => setIsEditing(false)}
                style={{ marginRight: 8 }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleSave}
              >
                Save
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography variant="body2" color="textSecondary" component="p">
            {task.description}
          </Typography>
        )}

        <Box mt={2} display="flex" alignItems="center">
          <Chip 
            label={task.status} 
            size="small"
            color={
              task.status === 'Completed' ? 'success' : 
              task.status === 'In Progress' ? 'primary' : 'default'
            }
            style={{ marginRight: 8 }}
          />
          <Typography variant="caption" color="textSecondary">
            Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
          </Typography>
          {task.priority && (
            <Chip 
              label={`Priority: ${task.priority}`} 
              size="small"
              color={
                task.priority === 'high' ? 'error' :
                task.priority === 'medium' ? 'warning' : 'default'
              }
              style={{ marginLeft: 8 }}
            />
          )}
        </Box>

        {task.checklist && task.checklist.length > 0 && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Checklist ({task.checklist.filter(item => item.completed).length}/{task.checklist.length})
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(task.checklist.filter(item => item.completed).length / task.checklist.length) * 100} 
              style={{ marginBottom: 8 }}
            />
            <div className="checklist">
              {task.checklist.map(item => (
                <div key={item.id} className="checklist-item">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => onUpdate(task.id, {
                      ...task,
                      checklist: task.checklist.map(i => 
                        i.id === item.id ? { ...i, completed: !i.completed } : i
                      )
                    })}
                  />
                  <span className={item.completed ? 'completed' : ''}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </Box>
        )}

        {(task.attachments && task.attachments.length > 0) && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Attachments
            </Typography>
            <div className="attachments">
              {task.attachments.map(file => (
                <a 
                  key={file.id} 
                  href={file.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="attachment"
                >
                  <FaPaperclip /> {file.name}
                </a>
              ))}
            </div>
          </Box>
        )}

        <Box mt={2} className="task-footer">
          <div className="task-meta">
            {task.timeSpent && (
              <div className="time-spent">
                <FaClock size={14} /> {task.timeSpent}
              </div>
            )}
            {(task.comments && task.comments.length > 0) && (
              <div className="comment-count">
                <FaComment size={14} /> {task.comments.length}
              </div>
            )}
          </div>
          <input
            type="file"
            id={`file-upload-${task.id}`}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <label htmlFor={`file-upload-${task.id}`} className="attach-file">
            <FaPaperclip size={14} /> Attach
          </label>
        </Box>

        <Box mt={2} className="comment-section">
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              InputProps={{
                endAdornment: (
                  <Button 
                    type="submit" 
                    color="primary"
                    size="small"
                    disabled={!comment.trim()}
                  >
                    Post
                  </Button>
                )
              }}
            />
          </form>
          
          {task.comments && task.comments.length > 0 && (
            <div className="comments">
              {task.comments.map(comment => (
                <div key={comment.id} className="comment">
                  <div className="comment-header">
                    <strong>{comment.user}</strong>
                    <span className="comment-time">{comment.time}</span>
                  </div>
                  <div className="comment-text">{comment.text}</div>
                </div>
              ))}
            </div>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaskItem;
