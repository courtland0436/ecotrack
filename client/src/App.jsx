import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import Login from './Login'
import Dashboard from './Dashboard'

const LoadingScreen = () => (
  <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
    <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4"></div>
    <h2 className="text-white text-xl font-bold tracking-tight animate-pulse">
      Syncing EcoTrack...
    </h2>
    <p className="text-slate-400 text-sm mt-2">Connecting to your smart systems</p>
  </div>
);

const ProtectedRoute = ({ user, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const [user, setUser] = useState(null)
  const [systems, setSystems] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [newSystemName, setNewSystemName] = useState("")
  const [isResetting, setIsResetting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isShrunk, setIsShrunk] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/check_session").then((res) => {
      if (res.ok) {
        res.json().then((user) => {
          setUser(user);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
    const handleScroll = () => setIsShrunk(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      fetch(`/systems?page=${pagination.page}&per_page=6&search=${searchTerm}`)
        .then(res => res.json())
        .then(data => {
          setSystems(data.systems);
          setPagination(prev => ({ ...prev, totalPages: data.total_pages }));
        })
    }
  }, [user, pagination.page, searchTerm])

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchTerm]);

  const handleLogout = () => {
    fetch("/logout", { method: "DELETE" }).then((res) => {
      if (res.ok) {
        setUser(null);
        setSystems([]);
        toast.success("Successfully logged out");
      }
    });
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    const grid = document.getElementById('systems-grid');
    if (grid) {
      const offset = grid.offsetTop - 120;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    if (window.confirm("This will replace your data with starter tasks. Continue?")) {
      setIsResetting(true)
      fetch('/reset', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          setSystems(data.systems);
          setPagination({ page: 1, totalPages: data.total_pages });
          setIsResetting(false);
          toast.success("App data reset to defaults");
        })
        .catch(() => {
          setIsResetting(false);
          toast.error("Failed to reset application");
        })
    }
  }

  const handleAddSystem = (e) => {
    e.preventDefault()
    fetch('/systems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newSystemName })
    })
    .then(res => res.json())
    .then(newSys => {
      setNewSystemName("")
      toast.success(`${newSys.name} system created`);
      
      // Fetch fresh data for page 1 to show the new card immediately
      fetch(`/systems?page=1&per_page=6&search=${searchTerm}`)
        .then(res => res.json())
        .then(data => {
          setSystems(data.systems);
          setPagination({ page: 1, totalPages: data.total_pages });
        });
    })
  }

  const handleAddTask = (taskName, systemId, serviceDate) => {
    fetch('/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: taskName, system_id: systemId, service_date: serviceDate })
    }).then(res => res.json()).then(newTask => {
      setSystems(systems.map(sys => sys.id === systemId ? { ...sys, tasks: [...sys.tasks, newTask] } : sys))
      toast.success("New task added");
    })
  }

  const handleToggleTask = (taskId, systemId, currentStatus) => {
    fetch(`/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !currentStatus })
    })
    .then(res => res.json())
    .then(updatedTask => {
      setSystems(systems.map(sys => sys.id === systemId ? {
        ...sys, tasks: sys.tasks.map(t => t.id === taskId ? updatedTask : t)
      } : sys));

      if (updatedTask.completed && updatedTask.advice) {
        toast(updatedTask.advice, {
          icon: '🛠️',
          duration: 6000,
          style: { borderRadius: '12px', background: '#1e293b', color: '#fff', border: '1px solid #3b82f6', marginBottom: '20px' },
        });
      }
    })
  }

  const handleDeleteTask = (taskId, systemId) => {
    fetch(`/tasks/${taskId}`, { method: 'DELETE' }).then(() => {
      setSystems(systems.map(sys => sys.id === systemId ? { ...sys, tasks: sys.tasks.filter(t => t.id !== taskId) } : sys))
      toast.error("Task deleted");
    })
  }

  const handleDeleteSystem = (systemId) => {
    fetch(`/systems/${systemId}`, { method: 'DELETE' }).then(() => {
      fetch(`/systems?page=${pagination.page}&per_page=6&search=${searchTerm}`)
        .then(res => res.json())
        .then(data => {
          // If current page is now empty and we aren't on page 1, go back a page
          if (data.systems.length === 0 && pagination.page > 1) {
            setPagination(prev => ({ ...prev, page: prev.page - 1 }));
          } else {
            setSystems(data.systems);
            setPagination(prev => ({ ...prev, totalPages: data.total_pages }));
          }
        })
      toast.error("System removed");
    })
  }

  if (loading) return <LoadingScreen />;

  return (
    <>
      <Toaster position="bottom-center" />
      <Routes>
        <Route path="/" element={
          <ProtectedRoute user={user}>
            <Dashboard 
              isShrunk={isShrunk}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onLogout={handleLogout}
              newSystemName={newSystemName}
              setNewSystemName={setNewSystemName}
              onAddSystem={handleAddSystem}
              filteredSystems={systems}
              onDeleteTask={handleDeleteTask}
              onAddTask={handleAddTask}
              onDeleteSystem={handleDeleteSystem}
              onToggleTask={handleToggleTask}
              onReset={handleReset}
              isResetting={isResetting}
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </ProtectedRoute>
        } />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

export default App