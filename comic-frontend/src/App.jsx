import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, Youtube, Sparkles, Zap, Download, 
  Layout, Baby, School, GraduationCap, 
  Terminal, Image as ImageIcon, Wand2, MonitorPlay
} from 'lucide-react';

const API_URL = "http://localhost:8000";

const App = () => {
  // State
  const [mode, setMode] = useState('topic');
  const [topic, setTopic] = useState('');
  const [url, setUrl] = useState('');
  const [ageGroup, setAgeGroup] = useState('2-5');
  const [numPages, setNumPages] = useState(3);
  
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]); 
  const [resultImage, setResultImage] = useState(null);
  
  // Auto-scroll for logs
  const logsEndRef = useRef(null);
  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [logs]);

  const addLog = (message) => {
    setLogs(prev => [...prev, `> ${message}`]);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setLogs([]); 
    setResultImage(null);
    addLog("Initializing EduComic Engine v2.1...");

    try {
      let context = "General explanation";

      // --- STEP 1: CONTENT ANALYSIS ---
      if (mode === 'youtube' && url) {
        addLog(`Connecting to YouTube stream...`);
        addLog(`Target: ${url}`);
        
        const res = await fetch(`${API_URL}/process-content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            theme: topic || "Educational Video",
            youtube_url: url,
            age_group: ageGroup
          })
        });
        
        if (!res.ok) throw new Error("Content analysis failed.");
        const data = await res.json();
        context = data.context;
        addLog("Audio analysis complete. Concept extracted.");
      } else {
        addLog(`Mode: Direct Topic Generation`);
        addLog(`Topic: ${topic}`);
      }

      // --- STEP 2: COMIC GENERATION ---
      addLog("Engaging Storyteller Agent...");
      
      const formData = new FormData();
      formData.append('theme', topic || "The Video Topic");
      formData.append('context', context);
      formData.append('age_group', ageGroup);
      formData.append('num_pages', numPages);

      addLog(`Generating ${numPages} unique panels...`);
      
      const comicRes = await fetch(`${API_URL}/generate-comic`, {
        method: 'POST',
        body: formData
      });

      if (!comicRes.ok) throw new Error("Image generation failed.");

      addLog("Stitching final strip...");
      const blob = await comicRes.blob();
      const imageUrl = URL.createObjectURL(blob);
      setResultImage(imageUrl);
      addLog("Process Complete. Rendering output.");

    } catch (err) {
      console.error(err);
      addLog(`ERROR: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-300 font-sans overflow-hidden selection:bg-cyan-500 selection:text-white">
      
      {/* LEFT SIDEBAR - CONTROLS */}
      <div className="w-[400px] flex flex-col border-r border-slate-800 bg-[#1e293b] shadow-2xl z-10 shrink-0">
        
        {/* Logo Area */}
        <div className="p-6 border-b border-slate-700 bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-3 text-cyan-400 mb-1">
            <Zap className="w-6 h-6 fill-current" />
            <h1 className="text-xl font-bold tracking-wider text-white">EDUCOMIC<span className="text-slate-500 font-light">PRO</span></h1>
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">AI Educational Suite</p>
        </div>

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Section 1: Source */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <MonitorPlay className="w-4 h-4" /> Input Source
            </label>
            
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-lg border border-slate-700">
              <button 
                onClick={() => setMode('topic')}
                className={`flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                  mode === 'topic' ? 'bg-slate-700 text-cyan-400 shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Sparkles className="w-4 h-4" /> Topic
              </button>
              <button 
                onClick={() => setMode('youtube')}
                className={`flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                  mode === 'youtube' ? 'bg-slate-700 text-red-400 shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Youtube className="w-4 h-4" /> YouTube
              </button>
            </div>

            <div className="space-y-3">
               {mode === 'youtube' && (
                <div className="relative group">
                   <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                   <input 
                    type="text" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste YouTube URL here..." 
                    className="relative w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder-slate-600"
                  />
                </div>
               )}
               
               <div className="relative group">
                 <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                 <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={mode === 'youtube' ? "Title (Optional)" : "e.g. Quantum Physics, Photosynthesis..."} 
                  className="relative w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 placeholder-slate-600"
                />
               </div>
            </div>
          </div>

          {/* Section 2: Target Audience */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Layout className="w-4 h-4" /> Target Audience
            </label>
            
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: '2-5', label: 'Toddlers', sub: 'Simple & Cute', icon: Baby, color: 'text-pink-400', border: 'hover:border-pink-500/50' },
                { id: '6-10', label: 'Kids', sub: 'Fun & Dynamic', icon: School, color: 'text-yellow-400', border: 'hover:border-yellow-500/50' },
                { id: '11+', label: 'Teens', sub: 'Detailed & Cool', icon: GraduationCap, color: 'text-purple-400', border: 'hover:border-purple-500/50' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setAgeGroup(item.id)}
                  className={`relative flex items-center gap-4 p-3 rounded-xl border transition-all duration-200 text-left group ${
                    ageGroup === item.id 
                      ? 'bg-slate-800 border-cyan-500 ring-1 ring-cyan-500/50' 
                      : `bg-slate-900 border-slate-800 ${item.border}`
                  }`}
                >
                  <div className={`p-2 rounded-lg bg-slate-950 ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${ageGroup === item.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                      {item.label}
                    </div>
                    <div className="text-xs text-slate-600">{item.sub}</div>
                  </div>
                  {ageGroup === item.id && (
                    <div className="absolute right-4 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Length */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Comic Length
              </label>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/30 px-2 py-1 rounded border border-cyan-900">
                {numPages} PAGES
              </span>
            </div>
            {/* UPDATED SLIDER: Darker track, explicit accent color */}
            <input 
              type="range" 
              min="1" max="5" 
              value={numPages}
              onChange={(e) => setNumPages(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600 hover:accent-cyan-500 transition-colors"
            />
             <div className="flex justify-between text-[10px] text-slate-500 font-mono px-1">
                <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
             </div>
          </div>

        </div>

        {/* Generate Button Area */}
        <div className="p-6 bg-slate-900 border-t border-slate-800">
          <button
            onClick={handleGenerate}
            disabled={loading || (!topic && !url)}
            className={`w-full relative group overflow-hidden rounded-lg p-4 transition-all duration-300 ${
              loading ? 'cursor-not-allowed opacity-70' : 'hover:scale-[1.02]'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 transition-all duration-300 ${loading ? 'opacity-50' : 'opacity-100 group-hover:opacity-110'}`}></div>
            <div className="relative flex items-center justify-center gap-2 text-white font-bold tracking-wide">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  PROCESSING...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" /> GENERATE COMIC
                </>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* RIGHT MAIN - PREVIEW CANVAS */}
      <div className="flex-1 flex flex-col bg-[#0b101e] relative">
        
        {/* Top Bar */}
        <div className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#0f172a]/80 backdrop-blur z-20 sticky top-0">
          <div className="flex items-center gap-2 text-slate-500">
            <Layout className="w-4 h-4" />
            <span className="text-xs font-mono uppercase">Canvas View</span>
          </div>
          {resultImage && (
             <a 
               href={resultImage} 
               download={`educomic-${Date.now()}.png`}
               className="flex items-center gap-2 px-4 py-2 bg-green-600/10 text-green-400 hover:bg-green-600/20 border border-green-600/50 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
             >
               <Download className="w-4 h-4" /> Export PNG
             </a>
          )}
        </div>

        {/* Main Canvas Area - UPDATED to allow scrolling for tall strips */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 flex justify-center relative custom-scrollbar">
          
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
          </div>

          {!resultImage && !loading && (
            <div className="self-center text-center space-y-4 opacity-30 select-none">
              <BookOpen className="w-24 h-24 mx-auto text-slate-600" />
              <div className="text-2xl font-light text-slate-500">Ready to Create</div>
            </div>
          )}

          {loading && (
             <div className="self-center w-full max-w-md bg-slate-900 rounded-lg border border-slate-700 overflow-hidden shadow-2xl font-mono text-xs z-10">
                <div className="bg-slate-800 p-2 flex items-center gap-2 border-b border-slate-700 text-slate-400">
                   <Terminal className="w-4 h-4" /> 
                   <span>SYSTEM LOG</span>
                </div>
                <div className="p-4 h-64 overflow-y-auto space-y-2 text-green-400/90 custom-scrollbar">
                   {logs.map((log, i) => (
                     <div key={i} className="animate-pulse">{log}</div>
                   ))}
                   <div ref={logsEndRef} />
                </div>
             </div>
          )}

          {resultImage && (
            <div className="relative group animate-in fade-in zoom-in duration-500 mb-10 h-max">
               {/* Removed max-h constraint so strip can grow full height */}
              <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
              <img 
                src={resultImage} 
                alt="Generated Comic" 
                className="relative w-full max-w-2xl rounded-lg shadow-2xl border border-slate-700 bg-white" 
              />
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default App;