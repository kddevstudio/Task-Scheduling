import { Task } from "./models/Task";
import { Dependency }  from "./models/Dependency";
import * as Ix from "ix";

export class TaskRepository {
    private taskEnumerable: Ix.Enumerable<Task>;
    private dependencyEnumerable: Ix.Enumerable<Dependency>;

    constructor(tasks: Array<Task>, dependencies: Array<Dependency>) {
        this.taskEnumerable = Ix.Enumerable.fromArray(tasks);
        this.dependencyEnumerable = Ix.Enumerable.fromArray(dependencies);
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

    getSuccessors(taskId: number): Ix.Enumerable<Dependency> {
        return this.dependencyEnumerable.where(dependency => dependency.predecessorId === taskId);
    }
}