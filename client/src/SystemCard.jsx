import React, { useState } from 'react';

function SystemCard({ system, onDeleteTask, onAddTask, onDeleteSystem, onToggleTask }) {
  const [isAdding, setIsAdding] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [serviceDate, setServiceDate] = useState("");

  const handleSystemDelete = () => {
    if (window.confirm(`Delete ${system.name} and all its tasks?`)) {
      onDeleteSystem(system.id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskName.trim() !== "") {
      onAddTask(taskName, system.id, serviceDate);
      setTaskName("");
      setServiceDate("");
      setIsAdding(false);
    }
  };

  // Helper to calculate days between today and the service date
  const getDaysRemaining = (dateString) => {
    if (!dateString) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight for accurate day counting
    
    const target = new Date(dateString);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // SORTING LOGIC: 
  // 1. Create a copy of the tasks array
  // 2. Sort by date (Soonest at top). 
  // 3. Tasks without dates go to the bottom.
  const sortedTasks = [...(system.tasks || [])].sort((a, b) => {
    if (!a.service_date) return 1;
    if (!b.service_date) return -1;
    return new Date(a.service_date) - new Date(b.service_date);
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col relative min-h-[250px]">
      <div className="bg-slate-800 p-4 flex justify-between items-center">
        <h2 className="text-white font-bold text-lg">{system.name}</h2>
        <button 
          onClick={handleSystemDelete}
          className="text-slate-400 hover:text-red-400 transition-colors text-xl leading-none"
          title="Delete System"
        >
          ×
        </button>
      </div>

      <div className="p-4 flex-grow">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tasks</h3>
        <ul className="space-y-2">
          {sortedTasks.map((task) => {
            const daysLeft = getDaysRemaining(task.service_date);
            
            return (
              <li key={task.id} className="flex justify-between items-center text-slate-700 bg-slate-50 p-2 rounded group">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox"
                    checked={task.completed || false}
                    onChange={() => onToggleTask(task.id, system.id, task.completed)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className={task.completed ? "line-through text-slate-400" : ""}>
                      {task.name}
                    </span>
                    {task.service_date && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-blue-500 font-bold uppercase">
                          DUE: {task.service_date}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          daysLeft < 0 ? 'bg-red-100 text-red-600' : 
                          daysLeft <= 7 ? 'bg-orange-100 text-orange-600' : 
                          'bg-green-100 text-green-600'
                        }`}>
                          {daysLeft < 0 ? "OVERDUE" : 
                           daysLeft === 0 ? "TODAY" : 
                           `${daysLeft} days left`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onDeleteTask(task.id, system.id)}
                  className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 hover:text-white"
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
        {(!system.tasks || system.tasks.length === 0) && (
          <p className="text-slate-400 text-sm italic">No tasks yet.</p>
        )}
      </div>

      <div className="p-4 border-t border-slate-50">
        {isAdding ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input 
              className="border p-2 text-sm rounded outline-none focus:border-blue-500"
              placeholder="Task name..."
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              required
              autoFocus
            />
            <div className="flex gap-2">
              <input 
                type="date"
                className="border p-2 text-sm rounded flex-1 outline-none text-slate-600"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
              />
              <button type="submit" className="bg-blue-600 text-white px-4 rounded font-bold">+</button>
              <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 text-xs">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="flex justify-end">
            <button
              onClick={() => setIsAdding(true)}
              className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-2xl font-bold hover:bg-blue-700 shadow-md transition-all hover:scale-110"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SystemCard;