import { useState, useEffect } from "react";
interface Task {
  name: string;
  completed: boolean;
}
const App = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    const savedTasksString = localStorage.getItem("dailyTasks");
    if (savedTasksString) {
      const savedTasks = JSON.parse(savedTasksString) || [];
      setTasks(savedTasks);
    }
  }, []);

  const handleTaskToggle = (index: number) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    setTasks(updatedTasks);
    localStorage.setItem("dailyTasks", JSON.stringify(updatedTasks));
  };

  const handleAddTask = () => {
    if (newTask.trim() !== "") {
      const updatedTasks = [
        ...tasks,
        { name: newTask.trim(), completed: false },
      ];
      setTasks(updatedTasks);
      localStorage.setItem("dailyTasks", JSON.stringify(updatedTasks));
      setNewTask("");
    }
  };

  useEffect(() => {
    const now = new Date();
    const midnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );
    const timeUntilMidnight = midnight.getTime() - now.getTime();
    const resetTimer = setTimeout(() => {
      const resetTasks = tasks.map((task) => ({ ...task, completed: false }));
      setTasks(resetTasks);
      localStorage.setItem("dailyTasks", JSON.stringify(resetTasks));
    }, timeUntilMidnight);

    return () => clearTimeout(resetTimer);
  }, [tasks]);

  return (
    <div>
      <h1>Daily Checklist</h1>
      <div>
        <input
          type="text"
          placeholder="Add a new task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button onClick={handleAddTask}>Add Task</button>
      </div>
      <ul>
        {tasks.map((task, index) => (
          <li key={index}>
            <label>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleTaskToggle(index)}
              />
              {task.name}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
