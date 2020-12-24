import { Task } from "./models/Task";
import { Dependency }  from "./models/Dependency";
import * as Ix from "ix";
import { ITaskRepository } from "./ITaskRepository";

export class TaskRepository implements ITaskRepository {
    private taskEnumerable: Ix.Enumerable<Task>;
    private dependencyEnumerable: Ix.Enumerable<Dependency>;

    constructor(tasks: Array<Task>, dependencies?: Array<Dependency>) {
        this.taskEnumerable = Ix.Enumerable.fromArray(tasks);
        this.dependencyEnumerable = dependencies ? Ix.Enumerable.fromArray(dependencies) : Ix.Enumerable.empty();
    }

    public tasks(): Ix.Enumerable<Task> {
        return this.taskEnumerable;
    }
    
    public get(taskId: number): Task | null {
        return this.taskEnumerable.where(task => task.id === taskId).firstOrDefault();
    }

    public getParent(taskId: number): Task | null {
        let task = this.get(taskId);
        let parentTask: Task | null = null;
        if(task && task.parentId){
            parentTask = this.get(task.parentId);
        }
        return parentTask;
    }

    public children(taskId: number): Ix.Enumerable<Task> {
        return this.taskEnumerable.where(task => task.parentId === taskId);
    }

    public allChildren(taskId: number): Ix.Enumerable<Task> {
        let childTasks: Ix.Enumerable<Task> = this.children(taskId);
        if(childTasks.any()) {
            childTasks = childTasks.concat(childTasks.selectMany(childTask => this.allChildren(childTask.id)));
        }
        return childTasks;
    }

    public getPredecessorDependencies(taskId: number): Ix.Enumerable<Dependency> {
        return this.dependencyEnumerable.where(dependency => dependency.successorId === taskId);
    }

    public getSuccessorDependencies(taskId: number): Ix.Enumerable<Dependency> {
        return this.dependencyEnumerable.where(dependency => dependency.predecessorId === taskId);
    }
}