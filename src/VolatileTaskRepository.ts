import { Task } from "./models/Task";
import { Dependency }  from "./models/Dependency";
import * as Ix from "ix";
import { ITaskRepository } from "./ITaskRepository";
import { TaskMoveResult } from "./Scheduler";
import { tsTypeAliasDeclaration } from "@babel/types";

export class VolatileTaskRepository implements ITaskRepository {
    
    private volatileTaskEnumerable: Ix.Enumerable<Task>;
    private taskMoveResultIndexMap: any = {};
    private taskMoveResults: TaskMoveResult[] = new Array<TaskMoveResult>();

    constructor(private taskRepository: ITaskRepository) {
        this.volatileTaskEnumerable = Ix.Enumerable.fromArray(this.taskMoveResults).select(taskMoveResult => taskMoveResult.task);
    }
   
    public addRange(taskMoveResults: TaskMoveResult[])
    {
        taskMoveResults.forEach(taskMoveResult => this.add(taskMoveResult));
    }

    private add(taskMoveResult: TaskMoveResult)
    {
        let taskMoveResultIndex = this.taskMoveResultIndexMap[taskMoveResult.task.id];

        if(taskMoveResultIndex){
            this.taskMoveResults[taskMoveResultIndex] = taskMoveResult
        }
        else{
            taskMoveResultIndex = this.taskMoveResults.push(taskMoveResult);
            this.taskMoveResultIndexMap[taskMoveResult.task.id] = taskMoveResultIndex;
        }
    }

    public get(taskId: number): Task | null {
        let task: Task | null = <Task>this.volatileTaskEnumerable.where(task => task.id === taskId).firstOrDefault();

        if(!task) {
            task = this.taskRepository.get(taskId);
        }

        return task;
    }

    public hasTask(taskId: number){
        return this.volatileTaskEnumerable.any(task => task.id === taskId);      
    }

    public getParent(taskId: number): Task | null {
        
        let task = this.get(taskId);
        let parent = null;
        
        if(task && task.parentId){
            parent = this.get(task.parentId);
        }

        return parent;
    }

    public children(taskId: number): Ix.Enumerable<Task> {
        let childTasks = this.taskRepository.children(taskId);
        return childTasks.select(childTask => this.volatileTaskEnumerable.firstOrDefault(vtask => vtask.id == childTask.id) || childTask);
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