import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000/api/todos';

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const data = await response.json();
      setTodos(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch todos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  
  const addTodo = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });
      const newTodo = await response.json();
      setTodos([newTodo, ...todos]);
      setTitle('');
      setDescription('');
      setError('');
    } catch (err) {
      setError('Failed to add todo');
      console.error(err);
    }
  };


  const updateTodo = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const todoToUpdate = todos.find(t => t.id === editingId);
      const response = await fetch(`${API_URL}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          description,
          completed: todoToUpdate.completed 
        })
      });
      const updatedTodo = await response.json();
      setTodos(todos.map(t => t.id === editingId ? updatedTodo : t));
      setTitle('');
      setDescription('');
      setEditingId(null);
      setError('');
    } catch (err) {
      setError('Failed to update todo');
      console.error(err);
    }
  };

  
  const toggleComplete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}/toggle`, {
        method: 'PATCH'
      });
      const updatedTodo = await response.json();
      setTodos(todos.map(t => t.id === id ? updatedTodo : t));
      setError('');
    } catch (err) {
      setError('Failed to toggle todo');
      console.error(err);
    }
  };

  
  const deleteTodo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) return;

    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      setTodos(todos.filter(t => t.id !== id));
      setError('');
    } catch (err) {
      setError('Failed to delete todo');
      console.error(err);
    }
  };

  
  const startEdit = (todo) => {
    setEditingId(todo.id);
    setTitle(todo.title);
    setDescription(todo.description || '');
  };

  
  const cancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="App">
      <div className="container">
        <h1>📝 Todo Application</h1>
        
        {error && <div className="error">{error}</div>}

        <form onSubmit={editingId ? updateTodo : addTodo} className="todo-form">
          <input
            type="text"
            placeholder="Todo title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            required
          />
          <textarea
            placeholder="Description (optional)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="textarea"
            rows="3"
          />
          <div className="button-group">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update Todo' : 'Add Todo'}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="btn btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>

        {loading ? (
          <div className="loading">Loading todos...</div>
        ) : (
          <div className="todo-list">
            {todos.length === 0 ? (
              <p className="empty-message">No todos yet. Add one above!</p>
            ) : (
              todos.map(todo => (
                <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                  <div className="todo-content">
                    <div className="todo-header">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleComplete(todo.id)}
                        className="checkbox"
                      />
                      <h3>{todo.title}</h3>
                    </div>
                    {todo.description && <p className="description">{todo.description}</p>}
                    <small className="date">
                      Created: {new Date(todo.created_at).toLocaleString()}
                    </small>
                  </div>
                  <div className="todo-actions">
                    <button onClick={() => startEdit(todo)} className="btn-icon edit">
                      ✏️
                    </button>
                    <button onClick={() => deleteTodo(todo.id)} className="btn-icon delete">
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;