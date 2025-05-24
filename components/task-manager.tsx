"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Play, Trash2, Clock, Repeat } from "lucide-react"

interface Task {
    id: string
    title: string
    icon: string
    duration: number // in minutes
    repeat: boolean
    completed: boolean
    createdAt: Date
}

const taskIcons = [
    { value: "🧘‍♂️", label: "Meditation" },
    { value: "📚", label: "Study" },
    { value: "💻", label: "Work" },
    { value: "🏃‍♂️", label: "Exercise" },
    { value: "🍳", label: "Cooking" },
    { value: "🎨", label: "Creative" },
    { value: "📞", label: "Calls" },
    { value: "🧹", label: "Cleaning" },
]

export function TaskManager() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [newTask, setNewTask] = useState({
        title: "",
        icon: "💻",
        duration: 25,
        repeat: false,
    })

    // Load tasks from localStorage on mount
    useEffect(() => {
        const savedTasks = localStorage.getItem("karyayana-tasks")
        if (savedTasks) {
            setTasks(JSON.parse(savedTasks))
        }
    }, [])

    // Save tasks to localStorage whenever tasks change
    useEffect(() => {
        localStorage.setItem("karyayana-tasks", JSON.stringify(tasks))
    }, [tasks])

    const addTask = () => {
        if (!newTask.title.trim()) return

        const task: Task = {
            id: Date.now().toString(),
            title: newTask.title,
            icon: newTask.icon,
            duration: newTask.duration,
            repeat: newTask.repeat,
            completed: false,
            createdAt: new Date(),
        }

        setTasks((prev) => [...prev, task])
        setNewTask({ title: "", icon: "💻", duration: 25, repeat: false })
        setIsAddDialogOpen(false)
    }

    const deleteTask = (id: string) => {
        setTasks((prev) => prev.filter((task) => task.id !== id))
    }

    const toggleComplete = (id: string) => {
        setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
    }

    const startTimer = (task: Task) => {
        // This would integrate with the timer panel
        console.log("Starting timer for:", task.title)
    }

    return (
        <div className="space-y-6">
            {/* Add Task Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white">Add New Task</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-serif">Create New Task</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="title">Task Title</Label>
                            <Input
                                id="title"
                                value={newTask.title}
                                onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                                placeholder="Enter task name..."
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="icon">Icon</Label>
                            <Select value={newTask.icon} onValueChange={(value) => setNewTask((prev) => ({ ...prev, icon: value }))}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {taskIcons.map((icon) => (
                                        <SelectItem key={icon.value} value={icon.value}>
                                            <span className="flex items-center gap-2">
                                                <span className="text-lg">{icon.value}</span>
                                                {icon.label}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="duration">Duration (minutes)</Label>
                            <Input
                                id="duration"
                                type="number"
                                value={newTask.duration}
                                onChange={(e) => setNewTask((prev) => ({ ...prev, duration: Number.parseInt(e.target.value) || 25 }))}
                                min="1"
                                max="240"
                                className="mt-1"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="repeat"
                                checked={newTask.repeat}
                                onCheckedChange={(checked) => setNewTask((prev) => ({ ...prev, repeat: checked }))}
                            />
                            <Label htmlFor="repeat">Repeat daily</Label>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button onClick={addTask} className="flex-1 bg-orange-500 hover:bg-orange-600">
                                Create Task
                            </Button>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Tasks Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tasks.map((task) => (
                    <Card
                        key={task.id}
                        className={`transition-all duration-200 hover:shadow-md ${task.completed ? "opacity-60" : ""}`}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center justify-between text-lg">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{task.icon}</span>
                                    <span className={task.completed ? "line-through" : ""}>{task.title}</span>
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => startTimer(task)}
                                        className="h-8 w-8 p-0 hover:bg-orange-100 dark:hover:bg-orange-900"
                                    >
                                        <Play className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteTask(task.id)}
                                        className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {task.duration}m
                                    </div>
                                    {task.repeat && (
                                        <div className="flex items-center gap-1">
                                            <Repeat className="h-4 w-4" />
                                            Daily
                                        </div>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleComplete(task.id)}
                                    className={`text-xs ${task.completed ? "text-green-600" : "text-slate-500"}`}
                                >
                                    {task.completed ? "Completed" : "Mark Done"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {tasks.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🧘‍♂️</div>
                    <h3 className="text-xl font-serif font-medium text-slate-700 dark:text-slate-300 mb-2">Begin Your Journey</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                        Create your first task to start your mindful productivity practice.
                    </p>
                    <Button onClick={() => setIsAddDialogOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white">
                        Create First Task
                    </Button>
                </div>
            )}
        </div>
    )
}
