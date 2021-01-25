import { Task } from "./models/Task";
import { Dependency }  from "./models/Dependency";

export interface ITaskRepository {
    get(taskId: number): Task | undefined;
    getParent(taskId: number): Task | undefined;
    children(taskId: number): Ix.Enumerable<Task>;
    allChildren(taskId: number): Ix.Enumerable<Task>;
    getSuccessorDependencies(taskId: number): Ix.Enumerable<Dependency>;
    getPredecessorDependencies(taskId: number): Ix.Enumerable<Dependency>;
}