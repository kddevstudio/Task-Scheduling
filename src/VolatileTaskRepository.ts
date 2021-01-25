import { Schedule } from './models/Schedule';
import { Task } from "./models/Task";
import { Dependency }  from "./models/Dependency";
import * as Ix from "ix";
import { ITaskRepository } from "./ITaskRepository";
import { TaskMoveResult } from "./Scheduler";

export class VolatileTaskRepository implements ITaskRepository {
    
    private volatileTaskEnumerable: Ix.Enumerable<Task>;
    // private taskMoveResultIndexMap: any = {};
    // private taskMoveResults: TaskMoveResult[] = new Array<TaskMoveResult>();

    private taskMoveResultMap: Map<number, TaskMoveResult> = new Map<number, TaskMoveResult>();
    private tasks: Map<number, Task> = new Map<number, Task>();

    constructor(private taskRepository: ITaskRepository) {
        this.volatileTaskEnumerable = Ix.Enumerable.fromArray(Array.from(this.tasks.values()));
    }
   
    public addRange(taskMoveResultsMap: Map<number, TaskMoveResult>)
    {
        taskMoveResultsMap.forEach((taskMoveResult, taskId) => this.add(taskId, taskMoveResult));
    }

    public add(taskId: number, taskMoveResult: TaskMoveResult)
    {
        // let taskMoveResultCardinalIndex = this.taskMoveResultIndexMap[taskMoveResult.task.id];

        // if(taskMoveResultCardinalIndex){
        //     this.taskMoveResults[taskMoveResultCardinalIndex-1] = taskMoveResult;
        // }
        // else{
        //     taskMoveResultCardinalIndex = this.taskMoveResults.push(taskMoveResult);
        //     this.taskMoveResultIndexMap[taskMoveResult.task.id] = taskMoveResultCardinalIndex;
        // }

        // fetching a task will add it to the volatile map
        this.get(taskId);

        // register the taskMoveResult against the task id
        this.taskMoveResultMap.set(taskId, taskMoveResult);
    }

    public get(taskId: number): Task | undefined {
        
        if(!this.tasks.has(taskId))
        {
            let currentTask = this.taskRepository.get(taskId);

            if(currentTask !== undefined) {
            
                // todo: extract: duplicate code to the clone process in scheduler module
                
                // clone task
                let {start, end, duration, ...rest} = currentTask;
                
                //let cloneTask = Object.assign({}, currentTask, { schedule: new Schedule(currentTask.start, currentTask.duration)} )
                let cloneTask = new Task(rest.name, new Schedule(currentTask.start, currentTask.duration));
                Object.assign(cloneTask, rest);
                
                this.tasks.set(taskId, cloneTask);
            }
        }

        let volatileTask = this.tasks.get(taskId);

        let volatileSchedule = this.taskMoveResultMap.get(taskId);
                
        // merge volatile schedule if available
        if(volatileSchedule !== undefined)
        {
            volatileTask.start = volatileSchedule.dateRange.start;
            volatileTask.end = volatileSchedule.dateRange.end;
        }
        
        return volatileTask;
    }

    public getVolatileTaskResults(): Map<number, TaskMoveResult>
    {
        return this.taskMoveResultMap;
    }

    public hasTask(taskId: number){
        return this.volatileTaskEnumerable.any(task => task.id === taskId);      
    }

    public getParent(taskId: number): Task | undefined {
        
        let task = this.get(taskId);
        let parent = undefined;
        
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