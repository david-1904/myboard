import { useState, useEffect, useRef } from 'react';
import { WidgetProps } from '../types';

interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  dueDate?: string; // ISO date string (YYYY-MM-DD)
}

export default function TodoWidget({ widget, onConfigChange }: WidgetProps) {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newText, setNewText] = useState('');
  const [newDate, setNewDate] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const saved = widget.config.todos as TodoItem[] | undefined;
    if (saved) setTodos(saved);
    const showComp = widget.config.showCompleted;
    if (showComp !== undefined) setShowCompleted(showComp as boolean);
  }, [widget.config.todos, widget.config.showCompleted]);

  const saveTodos = (updated: TodoItem[]) => {
    setTodos(updated);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      onConfigChange({ ...widget.config, todos: updated });
    }, 300);
  };

  const addTodo = () => {
    if (!newText.trim()) return;
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: newText.trim(),
      done: false,
      dueDate: newDate || undefined,
    };
    saveTodos([...todos, newTodo]);
    setNewText('');
    setNewDate('');
  };

  const toggleTodo = (id: string) => {
    saveTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const removeTodo = (id: string) => {
    saveTodos(todos.filter(t => t.id !== id));
  };

  const toggleShowCompleted = () => {
    const newVal = !showCompleted;
    setShowCompleted(newVal);
    onConfigChange({ ...widget.config, showCompleted: newVal });
  };

  const isOverdue = (todo: TodoItem): boolean => {
    if (!todo.dueDate || todo.done) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(todo.dueDate);
    return due < today;
  };

  const isDueToday = (todo: TodoItem): boolean => {
    if (!todo.dueDate || todo.done) return false;
    const today = new Date().toISOString().split('T')[0];
    return todo.dueDate === today;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  };

  // Sort: overdue first, then by date, then without date
  const sortedTodos = [...todos].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const aOverdue = isOverdue(a);
    const bOverdue = isOverdue(b);
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });

  const visibleTodos = showCompleted ? sortedTodos : sortedTodos.filter(t => !t.done);
  const completedCount = todos.filter(t => t.done).length;

  return (
    <div className="todo-widget">
      <div className="todo-input-row">
        <input
          type="text"
          className="todo-input-text"
          placeholder="Neue Aufgabe..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
        />
        <input
          type="date"
          className="todo-input-date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
        />
        <button className="todo-add-btn" onClick={addTodo}>+</button>
      </div>

      <div className="todo-list">
        {visibleTodos.length === 0 && (
          <div className="todo-empty">
            {todos.length === 0 ? 'Keine Aufgaben' : 'Alle Aufgaben erledigt'}
          </div>
        )}
        {visibleTodos.map(todo => (
          <div
            key={todo.id}
            className={`todo-item ${todo.done ? 'done' : ''} ${isOverdue(todo) ? 'overdue' : ''} ${isDueToday(todo) ? 'due-today' : ''}`}
          >
            <input
              type="checkbox"
              className="todo-checkbox"
              checked={todo.done}
              onChange={() => toggleTodo(todo.id)}
            />
            <span className="todo-text">{todo.text}</span>
            {todo.dueDate && (
              <span className="todo-date">{formatDate(todo.dueDate)}</span>
            )}
            <button className="todo-remove" onClick={() => removeTodo(todo.id)}>×</button>
          </div>
        ))}
      </div>

      {completedCount > 0 && (
        <div className="todo-footer">
          <button className="todo-toggle-completed" onClick={toggleShowCompleted}>
            {showCompleted ? 'Erledigte ausblenden' : `Erledigte anzeigen (${completedCount})`}
          </button>
        </div>
      )}
    </div>
  );
}
