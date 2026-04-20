import React, { useState, useEffect, useMemo } from "react";
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Flame, 
  Star,
  Settings,
  RefreshCcw,
  Zap
} from "lucide-react";

// Minimalist category list
const CATEGORIES = ["Personal", "Work", "Health", "Focus"];

// Daily prompts for empty states
const INTENTIONS = [
  "What is your main objective today?",
  "Focus on one small win.",
  "Clear space, clear mind.",
  "Ready to start fresh?",
  "What would make today a success?"
];

interface Task {
  id: string;
  name: string;
  completed: boolean;
  priority: boolean;
  isHabit: boolean;
  category: string;
  createdAt: number;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Personal");
  const [streak, setStreak] = useState(0);
  const [lastCheckIn, setLastCheckIn] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [greeting, setGreeting] = useState("");

  // Setup: Confetti Script & Greeting
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
    script.async = true;
    document.body.appendChild(script);
    
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    return () => { document.body.removeChild(script); };
  }, []);

  // Initialization: Load from Local Storage
  useEffect(() => {
    const savedTasks = localStorage.getItem("minimal-tasks");
    const savedStreak = localStorage.getItem("minimal-streak");
    const savedLastDate = localStorage.getItem("minimal-last-date");

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedStreak) setStreak(parseInt(savedStreak, 10) || 0);
    if (savedLastDate) setLastCheckIn(savedLastDate);
  }, []);

  // Daily Reset Logic
  useEffect(() => {
    const today = new Date().toDateString();
    if (lastCheckIn && lastCheckIn !== today) {
      // Uncheck all tasks for the new day
      setTasks(prev => prev.map(t => ({ ...t, completed: false })));
      setLastCheckIn(today);
      localStorage.setItem("minimal-last-date", today);
    } else if (!lastCheckIn) {
      setLastCheckIn(today);
      localStorage.setItem("minimal-last-date", today);
    }
  }, [lastCheckIn]);

  // Sync tasks to Local Storage
  useEffect(() => {
    localStorage.setItem("minimal-tasks", JSON.stringify(tasks));
  }, [tasks]);

  // UI Sounds (Web Audio API)
  const playPop = (freq = 400) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(freq * 2, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {}
  };

  const triggerConfetti = () => {
    if ((window as any).confetti) {
      (window as any).confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#000000', '#ffffff', '#a3a3a3']
      });
    }
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const task: Task = {
      id: crypto.randomUUID(),
      name: newTask.trim(),
      completed: false,
      priority: false,
      isHabit: false,
      category: selectedCategory,
      createdAt: Date.now()
    };
    setTasks([task, ...tasks]);
    setNewTask("");
    playPop(300);
  };

  const toggleTask = (id: string) => {
    const wasEveryTaskDone = tasks.length > 0 && tasks.every(t => t.completed);
    const updatedTasks = tasks.map(t => {
      if (t.id === id) {
        if (!t.completed) playPop(500);
        return { ...t, completed: !t.completed };
      }
      return t;
    });

    const isEveryTaskDoneNow = updatedTasks.length > 0 && updatedTasks.every(t => t.completed);
    if (isEveryTaskDoneNow && !wasEveryTaskDone) {
      triggerConfetti();
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem("minimal-streak", newStreak.toString());
    }
    setTasks(updatedTasks);
  };

  const saveEdit = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, name: editText } : t));
    setEditingId(null);
  };

  // Sorting: Active Priority > Active > Completed
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.priority !== b.priority) return a.priority ? -1 : 1;
      return b.createdAt - a.createdAt;
    });
  }, [tasks]);

  const progress = tasks.length === 0 ? 0 : Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-black text-neutral-900 dark:text-neutral-100 p-6 sm:p-12 transition-colors duration-500 font-sans">
      <div className="max-w-md mx-auto">
        
        <header className="mb-12">
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
                {greeting} — {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
              <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                Focus
                {tasks.filter(t => !t.completed).length > 0 && (
                  <span className="text-xs bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded-md text-neutral-400 font-bold">
                    {tasks.filter(t => !t.completed).length}
                  </span>
                )}
              </h1>
            </div>
            <div className="flex items-center gap-1.5 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-2xl text-sm font-black shadow-xl">
              <Flame size={16} fill="currentColor" />
              <span>{streak}</span>
            </div>
          </div>
          <div className="relative h-1 w-full bg-neutral-100 dark:bg-neutral-900 rounded-full overflow-hidden">
            <div className="h-full bg-black dark:bg-white transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </header>

        <form onSubmit={addTask} className="mb-12">
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="What is your focus today?"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="w-full bg-white dark:bg-[#0a0a0a] border-none rounded-[1.5rem] py-5 pl-14 pr-6 outline-none focus:ring-1 ring-neutral-200 dark:ring-neutral-800 transition-all text-lg shadow-sm"
            />
            <Plus className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300" size={24} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? "bg-black dark:bg-white text-white dark:text-black" : "bg-neutral-100 dark:bg-[#0a0a0a] text-neutral-400"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </form>

        <div className="space-y-3">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-[2.5rem]">
              <p className="text-neutral-400 text-sm font-medium">{INTENTIONS[0]}</p>
            </div>
          ) : (
            sortedTasks.map((task) => (
              <div key={task.id} className={`group flex items-center gap-4 p-5 rounded-[2rem] transition-all border ${task.completed ? "bg-transparent border-transparent opacity-40 scale-[0.97]" : "bg-white dark:bg-[#0a0a0a] border-neutral-100 dark:border-neutral-900 shadow-sm"}`}>
                <button onClick={() => toggleTask(task.id)} className="shrink-0 active:scale-50 transition-transform">
                  {task.completed ? <CheckCircle2 className="text-black dark:text-white" size={26} /> : <Circle className="text-neutral-200 dark:text-neutral-800" size={26} />}
                </button>
                <div className="flex-1 min-w-0">
                  {editingId === task.id ? (
                    <input 
                      autoFocus 
                      value={editText} 
                      onChange={(e) => setEditText(e.target.value)} 
                      onBlur={() => saveEdit(task.id)} 
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit(task.id)}
                      className="w-full bg-transparent border-none outline-none font-bold" 
                    />
                  ) : (
                    <div onClick={() => { setEditingId(task.id); setEditText(task.name); }}>
                      <p className={`font-bold truncate ${task.completed ? "line-through text-neutral-400" : ""}`}>{task.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-neutral-400">{task.category}</span>
                        {task.isHabit && <RefreshCcw size={10} className="text-neutral-400" />}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); setTasks(tasks.map(t => t.id === task.id ? { ...t, isHabit: !t.isHabit } : t)); playPop(600); }} className={`p-2 rounded-full ${task.isHabit ? "text-blue-500" : "text-neutral-200"}`}><Zap size={16} fill={task.isHabit ? "currentColor" : "none"} /></button>
                  <button onClick={(e) => { e.stopPropagation(); setTasks(tasks.map(t => t.id === task.id ? { ...t, priority: !t.priority } : t)); }} className={`p-2 ${task.priority ? "text-black dark:text-white" : "text-neutral-200"}`}><Star size={16} fill={task.priority ? "currentColor" : "none"} /></button>
                  <button onClick={(e) => { e.stopPropagation(); setTasks(tasks.filter(t => t.id !== task.id)); playPop(200); }} className="p-2 text-neutral-200 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
            ))
          )}
        </div>
        <footer className="mt-20 mb-10 text-center opacity-40">
            <div className="inline-flex items-center gap-2">
                <Settings size={12} />
                <span className="text-[9px] font-black uppercase tracking-[0.4em]">Essentialist Mode</span>
            </div>
        </footer>
      </div>
    </div>
  );
}