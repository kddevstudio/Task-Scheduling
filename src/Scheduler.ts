import { StartOrEnd } from "./StartOrEnd";
import { Task } from "./models/Task";
import { Schedule } from "./models/Schedule";
import { Constraint } from "./models/Constraint";
import { ConstraintType } from "./ConstraintType";
import { DependencyType } from "./DependencyType";
import { TaskActionSource } from "./TaskActionSource";
import { ITaskRepository } from "./ITaskRepository";
import { VolatileTaskRepository } from "./VolatileTaskRepository";
import { Dependency } from "./models/Dependency";
import { IDateRange} from "./IDateRange";
import * as Ix from "ix";

export class Scheduler {

    private volatileTaskRepository: VolatileTaskRepository;

    constructor(private taskRepository: ITaskRepository) {
        this.volatileTaskRepository = new VolatileTaskRepository(this.taskRepository);
    }

    private isStartDependency(dependency: Dependency){
        return dependency.type === DependencyType.FinishStart || dependency.type === DependencyType.StartStart;
    }

    private getStartBound(task: Task, sender: TaskActionSource): Date | undefined {
        // tslint:disable-next-line:max-line-length
        let predecessorDependencies: Ix.Enumerable<Dependency> = this.taskRepository.getPredecessorDependencies(task.id);

        let maxStartDate: Date | undefined;

        if(predecessorDependencies.any()) {
            // tslint:disable-next-line:max-line-length
            let startPredecessors: Ix.Enumerable<Dependency> = predecessorDependencies.where(this.isStartDependency);

            if(startPredecessors.any()) {
                maxStartDate = startPredecessors.select(dependency => {
                    let predTask: Task | undefined = this.volatileTaskRepository.get(dependency.predecessorId);
                    return predTask ? (dependency.type === DependencyType.FinishStart ? predTask.end : predTask.start) : undefined;
                }).max();
            }
        }

        if(sender === TaskActionSource.Child){
            // tslint:disable-next-line:max-line-length
            let childTasks: Ix.Enumerable<Task> | null = this.volatileTaskRepository.children(task.id);

            // find minimum start date
            var minChildStartDate = childTasks.select(childTask => childTask.start).min();

            if(maxStartDate == null || minChildStartDate > maxStartDate){
                maxStartDate = minChildStartDate;
            }
        }

        // tslint:disable-next-line:one-line
        if(sender === TaskActionSource.Parent){
            // tslint:disable-next-line:max-line-length
            let parentTask: Task | undefined = this.volatileTaskRepository.getParent(task.id);

            if(parentTask !== undefined) {
                if(maxStartDate == undefined || parentTask.start > maxStartDate ){
                    maxStartDate = parentTask.start;
                }
            }
        }

        return maxStartDate;
    }

    private getEndBound(task: Task, sender: TaskActionSource): Date | undefined {
        // tslint:disable-next-line:max-line-length
        let predecessorDependencies: Ix.Enumerable<Dependency> = this.taskRepository.getPredecessorDependencies(task.id);
        // tslint:disable-next-line:max-line-length

        let minEndDate: Date | undefined;

        if(predecessorDependencies.any()) {
            // tslint:disable-next-line:max-line-length
            let finishPredecessors: Ix.Enumerable<Dependency> = predecessorDependencies.where(dependency => dependency.type === DependencyType.FinishFinish || dependency.type === DependencyType.StartFinish);

            if(finishPredecessors.any()) {
                minEndDate = finishPredecessors.select(dependency => {
                    let predTask: Task | undefined = this.volatileTaskRepository.get(dependency.predecessorId);
                    return predTask ? (dependency.type === DependencyType.FinishFinish ? predTask.end : predTask.start) : undefined;
                }).min();
            }
        }

        if(sender === TaskActionSource.Child){
            // tslint:disable-next-line:max-line-length
            let childTasks: Ix.Enumerable<Task> | null = this.volatileTaskRepository.children(task.id);

            // find minimum start date
            var maxChildEndDate = childTasks.select(childTask => childTask.end).max();

            if(minEndDate == null || maxChildEndDate > minEndDate){
                minEndDate = maxChildEndDate;
            }
        }

        // tslint:disable-next-line:one-line
        if(sender === TaskActionSource.Parent){
            // tslint:disable-next-line:max-line-length
            let parentTask: Task | undefined = this.volatileTaskRepository.getParent(task.id);

            if(parentTask !== undefined) {
                if(minEndDate == undefined || parentTask.end > minEndDate ){
                    minEndDate = parentTask.end;
                }
            }
        }

        return minEndDate;
    }
    private getBounds(task: Task, sender: TaskActionSource): IDateRange {
        let maxStartDate: Date | undefined = this.getStartBound(task, sender);
        let minEndDate: Date | undefined = this.getEndBound(task, sender);

        return {
            start: maxStartDate,
            end: minEndDate
        };
    }

    // tslint:disable-next-line:max-line-length
    move(sender: TaskActionSource = TaskActionSource.User, task: Task, date?: Date, startOrEnd: StartOrEnd = StartOrEnd.Start ): Promise<Map<number, TaskMoveResult>> {

        let {start: currentStart, end: currentEnd, duration: currentDuration, ...rest} = task;
        
        let volatileTask = new Task(rest.name, new Schedule(task.start, task.duration));
        Object.assign(volatileTask, rest);
        
        if(date != null) {
            if(startOrEnd === StartOrEnd.Start) {
                volatileTask.start = date;
            }
            if(startOrEnd === StartOrEnd.End) {
                volatileTask.end = date;
            }
        }
        
        return new Promise((resolve, reject) => {

            let taskMoveResult: TaskMoveResult | undefined;

            // find available task schedule 'window'
            const scheduleWindow: IDateRange = this.getBounds(volatileTask, sender);

            // todo: consider DST
            // tslint:disable-next-line:max-line-length
            const scheduleWindowDuration: number = scheduleWindow.start && scheduleWindow.end ? (scheduleWindow.end.getTime() - scheduleWindow.start.getTime()) / (86400 * 1000) : Infinity;
            
            if(scheduleWindowDuration && scheduleWindowDuration < Infinity) {
                
                switch(sender) {
                    case TaskActionSource.Child:
                        if(scheduleWindowDuration > volatileTask.duration){
                        }
                    break;
                    default:
                        if(scheduleWindowDuration < volatileTask.duration) {
                
                            // there is a defined window available for the task;  does it accommodate the task duration?
                            let message: string = `Task ${volatileTask.name} cannot be scheduled between ${scheduleWindow.start} and ${scheduleWindow.end}`;
                            taskMoveResult = new TaskMoveResult(false, scheduleWindow, message);
                            
                            this.volatileTaskRepository.add(volatileTask.id, taskMoveResult);
                            reject(this.volatileTaskRepository.getVolatileTaskResults());
                            return;
                        }
                    break;
                }
            }

            // determine whether the task needs to be scheduled later
            if(scheduleWindow.start) {
                // update volatile start date if greater than current volatile start date
                if(scheduleWindow.start > volatileTask.start){
                    volatileTask.start = scheduleWindow.start;
                }
                
                taskMoveResult = this.checkConstraint(volatileTask, new Schedule(volatileTask.start, volatileTask.duration));
            }

            // determine whether the task needs to be scheduled earlier
            if(scheduleWindow.end) {
                if(scheduleWindow.end < volatileTask.end){
                    volatileTask.end = scheduleWindow.end;
                }

                taskMoveResult = this.checkConstraint(volatileTask, new Schedule(volatileTask.end, volatileTask.duration, StartOrEnd.End));
            }
            
            // create a new taskMoveResult if not already present
            taskMoveResult = taskMoveResult || new TaskMoveResult(true, { start: volatileTask.start, end: volatileTask.end });

            // append taskMoveResult to array of updated tasks
            this.volatileTaskRepository.add(volatileTask.id, taskMoveResult);

            // check validity and return if invalid
            if(!taskMoveResult.valid) {
                reject(this.volatileTaskRepository.getVolatileTaskResults());
                return;
            }

            // cascade
            let promisesArray: Array<Promise<Map<number, TaskMoveResult>>> = [];

            // dependencies
            let successorDependencies: Ix.Enumerable<Dependency> = this.taskRepository.getSuccessorDependencies(volatileTask.id);

            if(successorDependencies.any()) {
                let dependencyPromiseArray: Promise<Map<number, TaskMoveResult>>[] = successorDependencies
                .select(dependency => {
                    let successorTask: Task = <Task>this.volatileTaskRepository.get(dependency.successorId);
                    return this.move(TaskActionSource.Predecessor, successorTask);
                }).toArray();

                promisesArray.unshift.apply(promisesArray, dependencyPromiseArray);
            }

            // child tasks
            if(taskMoveResult.valid && sender !== TaskActionSource.Child){
                let childTaskEnumerable: Ix.Enumerable<Task> = this.taskRepository.children(volatileTask.id);

                if(childTaskEnumerable.any()){
                    let childTaskPromiseArray: Promise<Map<number, TaskMoveResult>>[] = childTaskEnumerable
                    .select(childTask => {
                        return this.move(TaskActionSource.Parent, childTask);
                    }).toArray();

                    promisesArray.unshift.apply(promisesArray, childTaskPromiseArray);
                }
            }

            if(taskMoveResult.valid && sender !== TaskActionSource.Parent) {
                // parent evaluation

                let parentTask: Task | undefined = this.volatileTaskRepository.getParent(volatileTask.id);

                // todo: check that this doesn't share an ancestor parent with a previously processed task e.g. a predecessor
                if(parentTask !== undefined) { 
                    let parentEvaluationPromise: Promise<Map<number, TaskMoveResult>> = this.move(TaskActionSource.Child, parentTask);

                    promisesArray.unshift(parentEvaluationPromise);
                }
            }

            // check all returned taskMoveResults
            if(promisesArray.length > 0) {
                Promise.all(promisesArray)
                    .then((promiseArrayResults: Array<Map<number, TaskMoveResult>>) => {
                        
                        // tslint:disable-next-line:max-line-length
                        const promiseResultEnumerable: Ix.Enumerable<boolean> = Ix.Enumerable.fromArray(promiseArrayResults).selectMany(promiseArrayResult => {
                            
                            if(promiseArrayResult.size > 0) {
                                return Ix.Enumerable.fromArray(Array.from(promiseArrayResult.values())).select(taskMoveResult => taskMoveResult.valid);
                            }
                            
                            // return empty enumerable
                            return Ix.Enumerable.fromArray(Array<boolean>());
                        });

                        // todo: refactor opportunity; same general block as parent evaluation
                        // if(promiseResultEnumerable.any()) {
                        //     promiseResultEnumerable.forEach(newTaskMoveResult => this.volatileTaskRepository.add(newTaskMoveResult));
                        // }

                        // taskMoveResult = taskMoveResult || new TaskMoveResult(true, volatileTask);

                        taskMoveResult.valid = taskMoveResult.valid && promiseResultEnumerable.all(result => result);

                        if(!taskMoveResult.valid){
                            reject(this.volatileTaskRepository.getVolatileTaskResults());
                            return;
                        }

                        resolve(this.volatileTaskRepository.getVolatileTaskResults());
                        return;
                    })
                    .catch(badTaskMoveResults => {
                        if(taskMoveResult !== null){
                            taskMoveResult.valid = false;
                        }
                        
                        this.volatileTaskRepository.addRange(badTaskMoveResults);
                        reject(this.volatileTaskRepository.getVolatileTaskResults());
                        return;
                    });
            }
            else {
                resolve(this.volatileTaskRepository.getVolatileTaskResults());
            }
        });
    }

    checkConstraint(task: Task, schedule: Schedule): TaskMoveResult {
        
        let taskMoveResult: TaskMoveResult | null = null;
        let {start, end, duration } = schedule;

        // cannot move tasks with MustStart / MustEnd constraints
        if (task.constraint) {
            const constraint: Constraint = task.constraint;
            switch(constraint.constraintType) {
                case ConstraintType.MustStartOn:
                    if(constraint.date.getTime() !== schedule.start.getTime()) {
                        // todo: supply better error message
                        // tslint:disable-next-line:max-line-length
                        let message: string = `Task ${task.name} would start on ${start} but must start on ${constraint.date}`;
                        taskMoveResult = new TaskMoveResult(false, {start, end} , message);
                    }
                break;
                case ConstraintType.MustEndOn:
                    if(constraint.date.getTime() !== schedule.end.getTime()) {
                        // todo: supply better error message
                        // tslint:disable-next-line:max-line-length
                        let message: string = `Task ${task.name} would end on ${end} but must start on ${constraint.date}`;
                        taskMoveResult = new TaskMoveResult(false, {start, end}, message);
                    }
                break;
                case ConstraintType.MustStartBefore:
                    if (!(schedule.start < constraint.date)) {
                        // tslint:disable-next-line:max-line-length
                        taskMoveResult = new TaskMoveResult(false, {start, end}, `Start date ${start} succeeds MustStartBefore constraint ${constraint.date}`);
                    }
                    break;
                case ConstraintType.MustStartAfter:
                    if (!(schedule.start > constraint.date)) {
                        // tslint:disable-next-line:max-line-length
                        taskMoveResult = new TaskMoveResult(false, {start, end}, `Start date ${start} preceeds MustStartAfter constraint ${constraint.date}`);
                    }
                    break;
                case ConstraintType.MustEndBefore:
                    if (!(schedule.end < constraint.date)) {
                        // tslint:disable-next-line:max-line-length
                        taskMoveResult = new TaskMoveResult(false, {start, end}, `End date ${end} succeeds MustEndBefore constraint ${constraint.date}`);
                    }
                    break;
                case ConstraintType.MustEndAfter:
                    if (!(schedule.end > constraint.date)) {
                        // tslint:disable-next-line:max-line-length
                        taskMoveResult = new TaskMoveResult(false, {start, end}, `End date ${end} preceeds MustEndAfter constraint ${constraint.date}`);
                    }
                    break;
            }
        }

        if (!taskMoveResult) {
            taskMoveResult = new TaskMoveResult(true, {start, end});
        }

        return taskMoveResult;
    }

    change(schedule: Task, change: Date | number, startOrEnd?: StartOrEnd): void {
        let diff: number;
        if (change instanceof Date) {
            if (startOrEnd === StartOrEnd.Start) {
                if(change.getTime() === schedule.end.getTime()) {
                    throw new Error("Task cannot start on the same day that it ends");
                }

                // capture change in date
                schedule.start = change;
            } else {
                if(change.getTime() === schedule.start.getTime()) {
                    throw new Error("Task cannot end on the same day that it starts");
                }

                // capture change in date
                schedule.end = change;
            }
        } else {
            schedule.duration = change;
        }
    }
}

export class TaskMoveResult {
    constructor(public valid: boolean, public dateRange: IDateRange, public message?: string) {
    }
}

