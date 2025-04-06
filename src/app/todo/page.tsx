// pages/todos.tsx or app/todos/page.tsx
"use client";

import { useState, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash, Edit, Plus, Save, Loader2, CheckCircle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Toaster, toast } from "sonner";

// Define TypeScript interfaces
interface TodoItem {
    id: number;
    todo: string;
    completed: boolean;
    created_at: string;
}

type PostgrestError = {
    message: string;
    details: string | null;
    hint: string | null;
    code: string;
  }
  

export default function TodoApp() {
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [newTodo, setNewTodo] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editText, setEditText] = useState<string>("");

    // Fetch todos when component mounts
    useEffect(() => {
        fetchTodos();
    }, []);

    async function fetchTodos() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("Todo")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setTodos(data || []);
        } catch (error: PostgrestError | any) {
            console.error("Error fetching todos:", error);
            toast.error("Error fetching todos", {
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    }

    async function addTodo() {
        if (!newTodo.trim()) return;

        try {
            setSubmitting(true);
            const { data, error } = await supabase
                .from("Todo")
                .insert({
                    todo: newTodo,
                    completed: false,
                })
                .select();

            if (error) throw error;

            // Update local state with the new todo
            if (data && data[0]) {
                setTodos([data[0], ...todos]);
                setNewTodo("");
                toast.success("Task added successfully");
            }
        } catch (error: PostgrestError | any ) {
            console.error("Error adding todo:", error);
            if (error.message.includes("row-level security")) {
                toast.error("Permission denied", {
                    description: "You don't have permission to add tasks. Please contact your administrator or disable RLS for development."
                });
            } else {
                toast.error("Error adding task", {
                    description: error.message,
                });
            }
        } finally {
            setSubmitting(false);
        }
    }

    async function toggleComplete(id: number, currentStatus: boolean) {
        try {
            const optimisticTodos = todos.map(todo =>
                todo.id === id ? { ...todo, completed: !currentStatus } : todo
            );
            setTodos(optimisticTodos);

            const { error } = await supabase
                .from("Todo")
                .update({ completed: !currentStatus })
                .eq("id", id);

            if (error) {
                // Revert the optimistic update
                setTodos(todos);
                throw error;
            }
        } catch (error: PostgrestError | any) {
            console.error("Error updating todo:", error);
            if (error.message.includes("row-level security")) {
                toast.error("Permission denied", {
                    description: "You don't have permission to update tasks. Please contact your administrator or disable RLS for development."
                });
            } else {
                toast.error("Error updating task", {
                    description: error.message,
                });
            }
        }
    }

    async function deleteTodo(id: number) {
        try {
            const optimisticTodos = todos.filter(todo => todo.id !== id);
            setTodos(optimisticTodos);

            const { error } = await supabase
                .from("Todo")
                .delete()
                .eq("id", id);

            if (error) {
                // Revert the optimistic update
                setTodos(todos);
                throw error;
            }

            toast.success("Task deleted successfully");
        } catch (error: PostgrestError | any) {
            console.error("Error deleting todo:", error);
            if (error.message.includes("row-level security")) {
                toast.error("Permission denied", {
                    description: "You don't have permission to delete tasks. Please contact your administrator or disable RLS for development."
                });
            } else {
                toast.error("Error deleting task", {
                    description: error.message,
                });
            }
        }
    }

    function startEdit(todo: TodoItem) {
        setEditingId(todo.id);
        setEditText(todo.todo);
    }

    async function saveEdit() {
        if (!editingId || !editText.trim()) return;

        try {
            setSubmitting(true);
            const { error } = await supabase
                .from("Todo")
                .update({ todo: editText })
                .eq("id", editingId);

            if (error) throw error;

            // Update local state
            setTodos(todos.map(todo =>
                todo.id === editingId ? { ...todo, todo: editText } : todo
            ));

            setEditingId(null);
            toast.success("Task updated successfully");
        } catch (error: PostgrestError | any) {
            console.error("Error updating todo:", error);
            if (error.message.includes("row-level security")) {
                toast.error("Permission denied", {
                    description: "You don't have permission to edit tasks. Please contact your administrator or disable RLS for development."
                });
            } else {
                toast.error("Error updating task", {
                    description: error.message,
                });
            }
        } finally {
            setSubmitting(false);
        }
    }

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !submitting) {
            addTodo();
        }
    };

    const handleEditKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !submitting) {
            saveEdit();
        }
    };

    const calculateDueDate = (created_at: string) => {
        const date = new Date(created_at);
        date.setDate(date.getDate() + 7); // Due in 7 days from creation
        return date.toLocaleDateString();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <main className="min-h-screen bg-background flex flex-col items-center py-12 px-4">
            <Toaster position="top-center" />

            <div className="w-full max-w-2xl">
                <h1 className="text-3xl font-bold mb-6 text-center">Task Manager</h1>

                <Card className="shadow-lg border-border">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <CheckCircle className="text-primary h-5 w-5" />
                            My Tasks
                        </CardTitle>
                        <CardDescription>
                            Manage your daily tasks and track your progress
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="flex gap-2 mb-8">
                            <Input
                                placeholder="Add a new task..."
                                value={newTodo}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTodo(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="focus-visible:ring-primary"
                                disabled={submitting}
                            />
                            <Button
                                onClick={addTodo}
                                disabled={submitting || !newTodo.trim()}
                                className="gap-1"
                            >
                                {submitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" />
                                        Add
                                    </>
                                )}
                            </Button>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
                            </div>
                        ) : todos.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>No tasks yet. Add one to get started!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {todos.map((todo) => (
                                    <div
                                        key={todo.id}
                                        className={`flex items-start rounded-lg border p-4 transition-all ${todo.completed ? 'bg-muted/50' : 'hover:bg-accent/50'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3 flex-1">
                                            <Checkbox
                                                checked={todo.completed}
                                                onCheckedChange={() => toggleComplete(todo.id, todo.completed)}
                                                id={`todo-${todo.id}`}
                                                className="mt-1"
                                            />

                                            <div className="flex-1">
                                                {editingId === todo.id ? (
                                                    <Input
                                                        value={editText}
                                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setEditText(e.target.value)}
                                                        onKeyPress={handleEditKeyPress}
                                                        className="mb-1"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <label
                                                        htmlFor={`todo-${todo.id}`}
                                                        className={`font-medium block ${todo.completed ? 'line-through text-muted-foreground' : ''}`}
                                                    >
                                                        {todo.todo}
                                                    </label>
                                                )}

                                                <div className="text-xs text-muted-foreground mt-1 flex gap-4">
                                                    <span>Created: {formatDate(todo.created_at)}</span>
                                                    {!todo.completed && (
                                                        <span>Due: {calculateDueDate(todo.created_at)}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-1">
                                            {editingId === todo.id ? (
                                                <Button
                                                    onClick={saveEdit}
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={submitting}
                                                >
                                                    {submitting ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Save className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => startEdit(todo)}
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            )}

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button size="sm" variant="outline">
                                                        <Trash className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Task</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete this task? This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => deleteTodo(todo.id)}>
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex justify-between border-t p-4">
                        <div className="text-sm text-muted-foreground">
                            {todos.length} total task{todos.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {todos.filter(t => t.completed).length} completed
                        </div>
                    </CardFooter>
                </Card>

                {todos.length > 0 && (
                    <div className="mt-4 text-center text-sm text-muted-foreground">
                        <p>
                            {todos.filter(t => !t.completed).length} pending task{todos.filter(t => !t.completed).length !== 1 ? 's' : ''} remaining
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}