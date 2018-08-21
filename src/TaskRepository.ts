import { Task } from "./models/Task";
import { Dependency }  from "./models/Dependency";
import * as Ix from "ix";
import { ITaskRepository } from "./ITaskRepository";

export class TaskRepository implements ITaskRepository {
    private taskEnumerable: Ix.Enumerable<Task>;
    private dependencyEnumerable: Ix.Enumerable<Dependency>;

    constructor(tasks: Array<Task>, dependencies: Array<Dependency>) {
        this.taskEnumerable = Ix.Enumerable.fromArray(tasks);
        this.dependencyEnumerable = dependencies ? Ix.Enumerable.fromArray(dependencies) : Ix.Enumerable.empty();
    }

    get(taskId: number): Task {
        return this.taskEnumerable.where(task => task.id === taskId).firstOrDefault();
    }

    getParent(taskId: number): Task {
        return this.get(this.get(taskId).parentId);
    }

    children(taskId: number): Ix.Enumerable<Task> {
        return this.taskEnumerable.where(task => task.parentId === taskId);
    }

    allChildren(taskId: number): Ix.Enumerable<Task> {
        let childTasks: Ix.Enumerable<Task> = this.children(taskId);
        if(childTasks.any()) {
            childTasks = childTasks.concat(childTasks.selectMany(childTask => this.allChildren(childTask.id)));
        }
        return childTasks;
    }

    getPredecessorDependencies(taskId: number): Ix.Enumerable<Dependency> {
        return this.dependencyEnumerable.where(dependency => dependency.successorId === taskId);
    }

    getSuccessorDependencies(taskId: number): Ix.Enumerable<Dependency> {
        return this.dependencyEnumerable.where(dependency => dependency.predecessorId === taskId);
    }
}