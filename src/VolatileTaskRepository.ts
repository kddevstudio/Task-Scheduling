import { Task } from "./models/Task";
import { Dependency }  from "./models/Dependency";
import * as Ix from "ix";
import { ITaskRepository } from "./ITaskRepository";
import { TaskMoveResult } from "./Scheduler";

export class VolatileTaskRepository implements ITaskRepository {
    volatileTaskEnumerable: Ix.Enumerable<Task>;

    constructor(private taskRepository: ITaskRepository, private taskMoveResults: TaskMoveResult[]) {
        this.volatileTaskEnumerable = Ix.Enumerable.fromArray(taskMoveResults).select(taskMoveResult => taskMoveResult.task);
    }

    public get(taskId: number): Task {
        let task: Task = <Task>this.volatileTaskEnumerable.where(task => task.id === taskId).firstOrDefault();

        if(!task) {
            task = this.taskRepository.get(taskId);
        }

        return task;
    }

    public getParent(taskId: number): Task {
        return this.get(this.get(taskId).parentId);
    }

    public children(taskId: number): Ix.Enumerable<Task> {
        return this.volatileTaskEnumerable.where(task => task.parentId === taskId)
        .join(this.taskRepository.children(taskId),
            volatileTask => volatileTask.id,
            task => task.id,
            (volatileTask, task) => volatileTask || task);
    }

    public allChildren(taskId: number): Ix.Enumerable<Task> {
        let childTasks: Ix.Enumerable<Task> = this.children(taskId);
        if(childTasks.any()) {
            childTasks = childTasks.concat(childTasks.selectMany(childTask => this.allChildren(childTask.id)));
        }
        return childTasks;
    }

    public getSuccessorDependencies(taskId: number): Ix.Enumerable<Dependency> {
        return this.taskRepository.getSuccessorDependencies(taskId);
    }

    public getPredecessorDependencies(taskId: number): Ix.Enumerable<Dependency> {
        return this.taskRepository.getPredecessorDependencies(taskId);
    }
}