import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ExternalLink, Terminal, Hourglass } from 'lucide-react';

/**
 * ContestCard Component
 * Renders a single contest card with robust error-guards to prevent rendering crashes.
 */
function ContestCard({ contest }) {
  // Safe defaults for database fields to prevent undefined/null TypeError crashes
  const platform = contest?.platform || 'Codeforces';
  const externalId = contest?.externalId || 'N/A';
  const name = contest?.name || 'Untitled Contest';
  const startTimeVal = contest?.startTime;
  const durationSeconds = contest?.durationSeconds ?? 0;
  const url = contest?.url || '';
  const phase = contest?.phase || 'BEFORE';

  const [timeLeft, setTimeLeft] = useState('');
  const [currentPhase, setCurrentPhase] = useState(phase);

  useEffect(() => {
    // If there is no start time, we cannot calculate countdown
    if (!startTimeVal) {
      setTimeLeft('');
      return;
    }

    const calculateTimeLeft = () => {
      const targetTime = new Date(startTimeVal).getTime();
      if (isNaN(targetTime)) {
        return '';
      }
      
      const difference = targetTime - Date.now();
      
      if (difference <= 0) {
        if (currentPhase === 'BEFORE') {
          setCurrentPhase('CODING');
        }
        return '';
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);

      if (days > 0) {
        return `Starts in ${days}d ${hours}h ${minutes}m`;
      } else if (hours > 0) {
        return `Starts in ${hours}h ${minutes}m`;
      } else {
        return `Starts in ${minutes}m`;
      }
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000);

    return () => clearInterval(timer);
  }, [startTimeVal, currentPhase]);

  // Safe duration formatting helper
  const formatDuration = (seconds) => {
    if (seconds === undefined || seconds === null || isNaN(seconds)) {
      return 'N/A';
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    let durationStr = '';
    if (hours > 0) durationStr += `${hours}h `;
    if (minutes > 0 || durationStr === '') durationStr += `${minutes}m`;
    
    return durationStr.trim();
  };

  // Safe date formatting helper (prevents RangeError: Invalid time value)
  const formatDateTime = (dateVal) => {
    if (!dateVal) return 'N/A';
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    try {
      return date.toLocaleString('en-US', {
        weekday: 'short', 
        month: 'short',    
        day: 'numeric',   
        hour: '2-digit',  
        minute: '2-digit',
        hour12: true      
      });
    } catch (e) {
      return 'Invalid Format';
    }
  };

  const isUrlValid = url && (url.startsWith('http://') || url.startsWith('https://'));
  const borderAccentClass = platform.toLowerCase() === 'codeforces' 
    ? 'border-l-4 border-l-brand-green' 
    : 'border-l-4 border-l-brand-amber';

  return (
    <div className={`flex flex-col justify-between p-6 rounded-xl terminal-card text-gray-300 relative overflow-hidden ${borderAccentClass}`}>
      <div className="absolute top-0 right-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-brand-green/20 to-transparent"></div>

      <div>
        {/* Meta badges */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-brand-dimGreen text-brand-green border border-brand-green/20 font-mono">
            &gt; {platform}
          </span>
          
          {currentPhase === 'CODING' && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-rose-950/30 text-rose-400 border border-rose-500/20 font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              LIVE
            </span>
          )}

          {currentPhase === 'FINISHED' && (
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-800/40 text-gray-500 border border-gray-700/30 font-mono">
              Ended
            </span>
          )}
        </div>

        {/* Name */}
        <h3 className="text-md font-bold text-white mb-4 line-clamp-2 hover:text-brand-green transition-colors font-mono tracking-tight leading-snug">
          {name}
        </h3>

        {/* Start Time */}
        <div className="flex items-start gap-3 text-sm text-gray-400 mb-3">
          <Calendar className="w-4 h-4 mt-0.5 text-brand-green flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">Start Time</p>
            <p className="font-mono text-gray-300 text-xs">{formatDateTime(startTimeVal)}</p>
          </div>
        </div>

        {/* Live Countdown */}
        {currentPhase === 'BEFORE' && timeLeft && (
          <div className="flex items-start gap-3 text-sm mb-3">
            <Hourglass className="w-4 h-4 mt-0.5 text-brand-amber flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">Countdown</p>
              <p className="font-mono text-brand-amber text-xs font-semibold">{timeLeft}</p>
            </div>
          </div>
        )}

        {/* Duration */}
        <div className="flex items-start gap-3 text-sm text-gray-400 mb-6">
          <Clock className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">Duration</p>
            <p className="font-mono text-gray-300 text-xs">{formatDuration(durationSeconds)}</p>
          </div>
        </div>
      </div>

      {/* Button */}
      {isUrlValid ? (
        <a 
          href={url}
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-mono text-sm font-semibold border border-brand-green text-brand-green bg-transparent hover:bg-brand-green hover:text-dark-900 transition-all duration-300 active:scale-[0.98] hover:shadow-[0_0_15px_rgba(57,255,20,0.25)]"
        >
          Register &amp; View
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      ) : (
        <button 
          disabled
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-mono text-sm font-semibold border border-gray-700 text-gray-600 bg-transparent cursor-not-allowed"
        >
          Registration Closed
        </button>
      )}
    </div>
  );
}

/**
 * ListView parent component
 */
function ListView({ contests }) {
  if (!contests || contests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center terminal-panel rounded-2xl">
        <Terminal className="w-12 h-12 text-gray-600 mb-4 animate-pulse" />
        <h3 className="text-lg font-bold text-white font-mono">&gt; NO_CONTESTS_FOUND</h3>
        <p className="text-gray-500 mt-2 max-w-md text-sm">
          No matches found for this filter. Run the database sync request to pull the latest competitive programming schedule.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {contests.map((contest) => (
        <ContestCard 
          key={contest._id || contest.externalId} 
          contest={contest} 
        />
      ))}
    </div>
  );
}

export default ListView;
