import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar as CalendarIcon, 
  List as ListIcon, 
  RefreshCw, 
  AlertCircle, 
  Terminal,
  Search,
  Filter,
  CheckCircle2,
  Database
} from 'lucide-react';

// Import custom views
import CalendarView from './components/CalendarView';
import ListView from './components/ListView';

// Define the API base URL. Express backend runs on port 5000.
const API_BASE_URL = 'http://localhost:5000/api/contests';

function App() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Syncing state tracks live fetches from Codeforces API
  const [syncing, setSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState(null);

  // Filter and view states
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
  const [showAll, setShowAll] = useState(false);       // false = only upcoming (phase: BEFORE), true = all cached
  const [searchQuery, setSearchQuery] = useState('');   // search input filter

  /**
   * Fetch Contests from our backend DB
   */
  const fetchContests = async (all = false) => {
    setLoading(true);
    setError(null);
    try {
      const url = all ? `${API_BASE_URL}?all=true` : API_BASE_URL;
      const response = await axios.get(url);
      
      if (response.data && response.data.success) {
        setContests(response.data.data);
      } else {
        throw new Error('Invalid response structure from server');
      }
    } catch (err) {
      console.error('Error fetching contests:', err);
      setError(
        err.response?.data?.message || 
        'System Offline. Make sure the Express backend server is running on http://localhost:5000'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sync database with live Codeforces contests
   */
  const handleSync = async () => {
    setSyncing(true);
    setSyncSuccessMsg(null);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/sync`);
      
      if (response.data && response.data.success) {
        setSyncSuccessMsg(response.data.message);
        await fetchContests(showAll);
        
        setTimeout(() => {
          setSyncSuccessMsg(null);
        }, 5000);
      } else {
        throw new Error('Sync failed with unknown response');
      }
    } catch (err) {
      console.error('Error syncing contests:', err);
      setError(err.response?.data?.message || 'Sync connection failed. Make sure the backend server is running.');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchContests(showAll);
  }, [showAll]);

  // Real-time client-side name filtering
  const filteredContests = contests.filter((contest) =>
    contest.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-dark-900 text-gray-300 flex flex-col font-sans">
      
      {/* Terminal Wordmark Header */}
      <header className="border-b border-dark-700 bg-dark-800/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          
          {/* Logo Section (CLI Inspired) */}
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-brand-green" />
            <span className="text-md font-bold font-mono tracking-wider text-white">
              CP_TRACKER<span className="text-brand-green animate-pulse">_</span>
            </span>
          </div>

          {/* Sync Button (Outlined/Ghost with Glow) */}
          <button
            onClick={handleSync}
            disabled={syncing}
            id="sync-button"
            className={`flex items-center gap-2 py-1.5 px-4 rounded-lg font-mono text-xs font-semibold transition-all duration-300 ${
              syncing
                ? 'bg-dark-700 text-gray-600 border border-dark-600 cursor-not-allowed'
                : 'border border-brand-green text-brand-green bg-transparent hover:bg-brand-green hover:text-dark-900 hover:shadow-[0_0_15px_rgba(57,255,20,0.3)] active:scale-95'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'SYNCING_DB...' : 'SYNC_LIVE'}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Connection Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-950/20 border border-rose-500/20 text-rose-300 flex items-start gap-3 shadow-md font-mono text-xs">
            <AlertCircle className="w-4 h-4 text-accent-rose flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white uppercase">&gt; SYSTEM_OFFLINE_ERR</h4>
              <p className="mt-1 text-gray-400">{error}</p>
              <button 
                onClick={() => fetchContests(showAll)} 
                className="mt-2 text-brand-green font-semibold underline hover:text-[#52ff37]"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {syncSuccessMsg && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 flex items-center gap-3 shadow-md font-mono text-xs">
            <CheckCircle2 className="w-4 h-4 text-accent-green flex-shrink-0" />
            <p className="font-bold text-white uppercase">&gt; SYNC_SUCCESS: {syncSuccessMsg}</p>
          </div>
        )}

        {/* Dashboard Search & View Toggles */}
        <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl terminal-card">
          
          {/* Controls: Search and Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            
            {/* Console styled Search Input */}
            <div className="relative flex-grow sm:flex-grow-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search queries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-60 pl-10 pr-4 py-2 rounded-lg bg-dark-700 border border-dark-600 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all"
              />
            </div>

            {/* Dropdown Filter */}
            <div className="relative">
              <select
                value={showAll ? 'all' : 'upcoming'}
                onChange={(e) => setShowAll(e.target.value === 'all')}
                className="w-full sm:w-auto pl-4 pr-10 py-2 rounded-lg bg-dark-700 border border-dark-600 text-xs font-mono text-gray-300 focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green appearance-none cursor-pointer"
              >
                <option value="upcoming">&gt; Upcoming (Active)</option>
                <option value="all">&gt; All Cached Records</option>
              </select>
              <Filter className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* View Toggles (Restyled Active State) */}
          <div className="flex items-center gap-1.5 bg-dark-900 p-1 rounded-lg border border-dark-700 w-full sm:w-auto justify-center">
            
            {/* Calendar tab */}
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 py-1.5 px-4 rounded-md font-mono text-xs font-bold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-brand-dimGreen text-brand-green border border-brand-green/30 shadow-[0_0_10px_rgba(57,255,20,0.1)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              CALENDAR
            </button>

            {/* List tab */}
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 py-1.5 px-4 rounded-md font-mono text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-brand-dimGreen text-brand-green border border-brand-green/30 shadow-[0_0_10px_rgba(57,255,20,0.1)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              LIST_CARD
            </button>
          </div>
        </div>

        {/* Console loading state / Grid displaying Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-24 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-brand-green/20 border-t-brand-green animate-spin mb-4"></div>
            <p className="text-gray-500 font-mono text-xs animate-pulse">&gt; LOADING_DATABASE_RECORDS...</p>
          </div>
        ) : (
          <div className="transition-all duration-300">
            {viewMode === 'calendar' ? (
              <CalendarView contests={filteredContests} />
            ) : (
              <ListView contests={filteredContests} />
            )}
          </div>
        )}
      </main>

      {/* Terminal Footer */}
      <footer className="border-t border-dark-700 bg-dark-900 py-6 mt-12 text-xs font-mono text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center text-center">
          <p className="hover:text-brand-green transition-colors tracking-wide">
            built by kashish // powered by{' '}
            <a 
              href="https://codeforces.com/apiHelp" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="underline hover:text-brand-green transition-all"
            >
              codeforces api
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
