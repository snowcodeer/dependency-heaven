// src/components/VisualizationControls.tsx
interface VisualizationControlsProps {
    filter: string
    onFilterChange: (filter: string) => void
    searchTerm: string
    onSearchChange: (term: string) => void
  }
  
  export function VisualizationControls({ 
    filter, 
    onFilterChange, 
    searchTerm, 
    onSearchChange 
  }: VisualizationControlsProps) {
    const filters = [
      { id: 'all', label: 'Show All' },
      { id: 'conflicts', label: 'Conflicts' },
      { id: 'security', label: 'Security' },
      { id: 'critical', label: 'Critical' },
      { id: 'shared', label: 'Shared' }
    ]
  
    return (
      <section className="mb-8">
        <h3 className="text-green-400 text-lg font-semibold mb-4 pb-2 border-b border-slate-700">
          🎛️ Visualization Filters
        </h3>
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map(f => (
            <button
              key={f.id}
              className={`px-4 py-2 rounded transition-all duration-300 text-sm ${
                filter === f.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
              onClick={() => onFilterChange(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        
        <div className="mb-6">
          <h4 className="text-green-400 font-semibold mb-3">🔍 Search Dependencies</h4>
          <input
            type="text"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded focus:border-green-500 focus:outline-none text-sm"
            placeholder="Search packages..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
  
        <div>
          <h4 className="text-green-400 font-semibold mb-3">🏷️ Legend</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-500 border border-white" />
              <span>Main</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Prod</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Dev</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Peer</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span>Shared</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span>Security</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span>Conflict</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-300" />
              <span>Conflict-Prone</span>
            </div>
          </div>
        </div>
      </section>
    )
  }