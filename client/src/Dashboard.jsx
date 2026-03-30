import React from 'react';
import Banner from './Banner';
import SystemCard from './SystemCard';

function Dashboard({ 
  isShrunk, 
  searchTerm, 
  onSearchChange, 
  onLogout, 
  newSystemName, 
  setNewSystemName, 
  onAddSystem, 
  filteredSystems, 
  onDeleteTask, 
  onAddTask, 
  onDeleteSystem, 
  onToggleTask, 
  onReset, 
  isResetting,
  pagination,
  onPageChange
}) {
  return (
    <div className="min-h-[120vh] bg-slate-50 pb-24">
      <Banner 
        isShrunk={isShrunk} 
        searchTerm={searchTerm} 
        onSearchChange={onSearchChange} 
        onLogout={onLogout} 
      />
      
      {/* Spacer for the fixed/absolute banner */}
      <div className="h-[350px]"></div>
      
      <div className="sticky top-20 z-40 bg-slate-50/95 backdrop-blur-md py-6 mb-8 border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-6">
          <form onSubmit={onAddSystem} className="flex gap-3 bg-white p-2 rounded-2xl shadow-md border border-slate-200">
            <input 
              type="text" 
              placeholder="Add a new system (e.g. HVAC, Solar)..." 
              className="flex-1 bg-transparent px-5 py-2 outline-none text-slate-700 font-medium" 
              value={newSystemName} 
              onChange={(e) => setNewSystemName(e.target.value)} 
              required 
            />
            <button type="submit" className="bg-blue-600 text-white px-8 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95">
              + Add
            </button>
          </form>
        </div>
      </div>

      <main id="systems-grid" className="max-w-7xl mx-auto px-10">
        {filteredSystems.length > 0 ? (
          /* key={pagination.page} ensures the fade animation restarts on page change */
          <div key={pagination.page} className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredSystems.map(system => (
                <SystemCard 
                  key={system.id} 
                  system={system} 
                  onDeleteTask={onDeleteTask} 
                  onAddTask={onAddTask} 
                  onDeleteSystem={onDeleteSystem} 
                  onToggleTask={onToggleTask} 
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-16 pb-10">
                <button 
                  disabled={pagination.page === 1}
                  onClick={() => onPageChange(pagination.page - 1)}
                  className="w-full sm:w-auto px-8 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 disabled:opacity-30 hover:bg-slate-50 hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm"
                >
                  ← Previous
                </button>
                
                <span className="text-slate-500 font-semibold bg-slate-100 px-4 py-2 rounded-full text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                
                <button 
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => onPageChange(pagination.page + 1)}
                  className="w-full sm:w-auto px-8 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 disabled:opacity-30 hover:bg-slate-50 hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-slate-200/50 p-8 rounded-full mb-6">
              <span className="text-6xl">📡</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800">
              {searchTerm ? `No results for "${searchTerm}"` : "No systems tracked yet"}
            </h3>
            <p className="text-slate-500 mt-2 max-w-sm">
              {searchTerm 
                ? "Try adjusting your search or check your spelling." 
                : "Get started by adding your first home system above!"}
            </p>
          </div>
        )}
      </main>

      <button 
        onClick={onReset} 
        disabled={isResetting} 
        className="fixed bottom-10 right-10 bg-red-500 text-white px-8 py-4 rounded-full font-bold shadow-2xl z-50 transition-all hover:bg-red-600 active:scale-95"
      >
        {isResetting ? "Resetting..." : "Reset App"}
      </button>
    </div>
  );
}

export default Dashboard;