import React, { useState, useEffect, useMemo, ChangeEvent, FormEvent } from "react";
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Flame, 
  Star,
  Zap,
  History,
  X,
  GripVertical,
  RefreshCcw
} from "lucide-react";

// 1. Define the Task interface
interface Task {
  id: string;
  name: string;
  completed: boolean;
  priority: boolean;
  isHabit: boolean;
  category: string;
  createdAt: number;
}

// 2. Fixed CustomWindow interface to include standard AudioContext
interface CustomWindow extends Window {
  confetti?: any;
  AudioContext: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
}

declare const window: CustomWindow;

const CATEGORIES = ["Personal", "Work", "Health", "Focus"];
const INTENTIONS = [
  "What is your main objective today?",
  "Focus on one small win.",
  "Clear space, clear mind.",
  "What would make today a success?"
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Personal");
  const [streak, setStreak] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [greeting, setGreeting] = useState("");
  const [lastCheckIn, setLastCheckIn] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    const greeting = 
        hour < 12 ? "Good morning" :
        hour < 18 ? "Good afternoon" :
        hour < 22 ? "Good evening" : 
        "Good night";
    setGreeting(greeting);

    const savedTasks = localStorage.getItem("essentialist-tasks");
    const savedStreak = localStorage.getItem("essentialist-streak");
    const savedDate = localStorage.getItem("essentialist-last-date");

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedStreak) setStreak(parseInt(savedStreak, 10) || 0);
    if (savedDate) setLastCheckIn(savedDate);
  }, []);

  useEffect(() => {
    const today = new Date().toDateString();
    if (lastCheckIn && lastCheckIn !== today) {
      setTasks(prev => prev.map(t => ({ ...t, completed: false })));
      setLastCheckIn(today);
      localStorage.setItem("essentialist-last-date", today);
    } else if (!lastCheckIn) {
      setLastCheckIn(today);
      localStorage.setItem("essentialist-last-date", today);
    }
  }, [lastCheckIn]);

  useEffect(() => {
    localStorage.setItem("essentialist-tasks", JSON.stringify(tasks));
    localStorage.setItem("essentialist-streak", streak.toString());
  }, [tasks, streak]);

  const playPop = (freq = 400) => {
    try {
      // Access AudioContext safely using the defined CustomWindow interface
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtxClass) return;
      const audioCtx = new AudioCtxClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 2, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(); osc.stop(audioCtx.currentTime + 0.1);
    } catch (e) {}
  };

  const triggerConfetti = () => {
    if (window.confetti) {
      window.confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#000000', '#ffffff', '#737373']
      });
    }
  };

  const activeTasks = useMemo(() => tasks.filter(t => !t.completed), [tasks]);
  const completedTasks = useMemo(() => tasks.filter(t => t.completed), [tasks]);
  const progress = tasks.length === 0 ? 0 : Math.round((completedTasks.length / tasks.length) * 100);

  const addTask = (e: FormEvent) => {
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
    const newTasks = tasks.map(t => {
      if (t.id === id) {
        if (!t.completed) playPop(500);
        return { ...t, completed: !t.completed };
      }
      return t;
    });
    setTasks(newTasks);
    const isEveryTaskDoneNow = newTasks.length > 0 && newTasks.every(t => t.completed);
    if (isEveryTaskDoneNow && !wasEveryTaskDone) {
      triggerConfetti();
      setStreak(s => s + 1);
    }
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    playPop(200);
  };

  const saveEdit = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, name: editText } : t));
    setEditingId(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newActiveTasks = [...activeTasks];
    const draggedItem = newActiveTasks[draggedIndex];
    newActiveTasks.splice(draggedIndex, 1);
    newActiveTasks.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    setTasks([...newActiveTasks, ...completedTasks]);
  };

  return (
    <div className="flex h-screen bg-[#fafafa] dark:bg-black text-neutral-900 dark:text-neutral-100 overflow-hidden transition-colors duration-500 font-sans">
      
      {/* SIDEBAR ARCHIVE */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-neutral-900 shadow-2xl transform transition-transform duration-500 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} border-r border-neutral-100 dark:border-neutral-800`}>
        <div className="h-full flex flex-col p-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-xl font-black tracking-tight">Archive</h2>
            <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
            {completedTasks.length === 0 ? (
              <p className="text-neutral-400 text-sm italic">Nothing archived yet.</p>
            ) : (
              completedTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-black/40 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-3 min-w-0 opacity-60">
                    <button onClick={() => toggleTask(task.id)} className="text-black dark:text-white shrink-0">
                      <CheckCircle2 size={18} />
                    </button>
                    <span className="text-sm font-medium truncate line-through">{task.name}</span>
                  </div>
                  <button onClick={() => deleteTask(task.id)} className="text-neutral-300 hover:text-red-500 p-1 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {completedTasks.length > 0 && (
            <button 
              onClick={() => setTasks(tasks.filter(t => !t.completed))}
              className="mt-6 w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-2xl transition-all"
            >
              Clear Archive
            </button>
          )}
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="flex-1 flex flex-col overflow-y-auto no-scrollbar relative">
        <div className="max-w-xl w-full mx-auto p-6 sm:p-12 pb-32">
          
          <header className="mb-12">
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSidebarOpen(true)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors group"
                  >
                    <History size={12} className="group-hover:rotate-[-10deg] transition-transform" />
                    Archive
                  </button>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-300">
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <h1 className="text-5xl font-black tracking-tighter mt-2">{greeting}</h1>
              </div>
              <div className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-full text-sm font-black shadow-xl shrink-0 transition-transform hover:scale-105">
                <Flame size={18} fill="currentColor" />
                <span>{streak}</span>
              </div>
            </div>

            <div className="relative h-1.5 w-full bg-neutral-100 dark:bg-neutral-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-black dark:bg-white transition-all duration-1000 ease-out" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </header>

          <form onSubmit={addTask} className="mb-12 relative group">
            <div className="relative">
              <input
                type="text"
                placeholder="What is your focus?"
                value={newTask}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTask(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900 border-none rounded-[2rem] py-6 pl-14 pr-6 outline-none focus:ring-4 ring-black/5 dark:ring-white/5 transition-all text-xl shadow-sm placeholder:text-neutral-200 dark:placeholder:text-neutral-800"
              />
              <Plus className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300 dark:text-neutral-700" size={24} />
            </div>
            
            <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    selectedCategory === cat 
                    ? "bg-black dark:bg-white text-white dark:text-black scale-105 shadow-md" 
                    : "bg-neutral-200/50 dark:bg-neutral-900 text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </form>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-300">Objectives</h3>
              <span className="text-[10px] font-black text-neutral-400">{activeTasks.length} Pending</span>
            </div>

            {activeTasks.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-neutral-100 dark:border-neutral-900 rounded-[3rem]">
                <p className="text-neutral-300 font-medium px-8">{INTENTIONS[Math.floor(Math.random() * INTENTIONS.length)]}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-200 mt-2">All tasks completed or archived</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeTasks.map((task, index) => (
                  <div 
                    key={task.id}
                    draggable
                    onDragStart={() => setDraggedIndex(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={() => setDraggedIndex(null)}
                    className={`group flex items-center gap-4 p-6 rounded-[2.5rem] bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm transition-all active:scale-[0.98] cursor-default ${draggedIndex === index ? "opacity-30 scale-90" : ""}`}
                  >
                    <button onClick={() => toggleTask(task.id)} className="shrink-0 text-neutral-200 dark:text-neutral-800 hover:text-black dark:hover:text-white transition-colors active:scale-75">
                      <Circle size={28} />
                    </button>

                    <div className="flex-1 min-w-0">
                      {editingId === task.id ? (
                        <input 
                          autoFocus 
                          value={editText} 
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setEditText(e.target.value)} 
                          onBlur={() => saveEdit(task.id)} 
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit(task.id)}
                          className="w-full bg-transparent border-none outline-none font-bold text-lg" 
                        />
                      ) : (
                        <div onClick={() => { setEditingId(task.id); setEditText(task.name); }}>
                          <p className="font-bold text-lg leading-tight truncate">{task.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">{task.category}</span>
                            {task.isHabit && <RefreshCcw size={10} className="text-blue-400" />}
                            {task.priority && <Star size={10} fill="currentColor" className="text-orange-400" />}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => setTasks(tasks.map(t => t.id === task.id ? { ...t, isHabit: !t.isHabit } : t))} 
                        className={`p-2 rounded-full transition-colors ${task.isHabit ? "text-blue-500" : "text-neutral-200"}`}
                      >
                        <Zap size={18} fill={task.isHabit ? "currentColor" : "none"} />
                      </button>
                      <button 
                        onClick={() => setTasks(tasks.map(t => t.id === task.id ? { ...t, priority: !t.priority } : t))}
                        className={`p-2 rounded-full transition-colors ${task.priority ? "text-orange-400" : "text-neutral-200"}`}
                      >
                        <Star size={18} fill={task.priority ? "currentColor" : "none"} />
                      </button>
                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-neutral-200 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                      <div className="cursor-grab active:cursor-grabbing p-2 text-neutral-200 hover:text-neutral-400">
                        <GripVertical size={18} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}