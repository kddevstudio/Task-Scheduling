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

    private getStartBound(task: Task, sender: TaskActionSource): Date | null {
        // tslint:disable-next-line:max-line-length
        let predecessorDependencies: Ix.Enumerable<Dependency> = this.taskRepository.getPredecessorDependencies(task.id);

        let maxStartDate: Date | null = null;

        if(predecessorDependencies.any()) {
            // tslint:disable-next-line:max-line-length
            let startPredecessors: Ix.Enumerable<Dependency> = predecessorDependencies.where(dependency => dependency.type === DependencyType.FinishStart || dependency.type === DependencyType.StartStart);

            if(startPredecessors.any()) {
                maxStartDate = startPredecessors.select(dependency => {
                    let predTask: Task | null = this.volatileTaskRepository.get(dependency.predecessorId);
                    return predTask ? dependency.type === DependencyType.FinishStart ? predTask.end : predTask.start : null;
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
            let parentTask: Task | null = this.volatileTaskRepository.getParent(task.id);

            if(parentTask !== null) {
                if(maxStartDate == null || parentTask.start > maxStartDate ){
                    maxStartDate = parentTask.start;
                }
            }
        }

        return maxStartDate;
    }

    private getEndBound(task: Task, sender: TaskActionSource): Date | null {
        // tslint:disable-next-line:max-line-length
        let predecessorDependencies: Ix.Enumerable<Dependency> = this.taskRepository.getPredecessorDependencies(task.id);
        // tslint:disable-next-line:max-line-length

        let minEndDate: Date | null = null;

        if(predecessorDependencies.any()) {
            // tslint:disable-next-line:max-line-length
            let finishPredecessors: Ix.Enumerable<Dependency> = predecessorDependencies.where(dependency => dependency.type === DependencyType.FinishFinish || dependency.type === DependencyType.StartFinish);

            if(finishPredecessors.any()) {
                minEndDate = finishPredecessors.select(dependency => {
                    let predTask: Task | null = this.volatileTaskRepository.get(dependency.predecessorId);
                    return predTask ? dependency.type === DependencyType.FinishFinish ? predTask.end : predTask.start : null;
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
            let parentTask: Task | null = this.volatileTaskRepository.getParent(task.id);

            if(parentTask !== null) {
                if(minEndDate == null || parentTask.end > minEndDate ){
                    minEndDate = parentTask.end;
                }
            }
        }

        return minEndDate;
    }
    private getBounds(task: Task, sender: TaskActionSource): IDateRange {
        let maxStartDate: Date | null = this.getStartBound(task, sender);
        let minEndDate: Date | null = this.getEndBound(task, sender);

        return {
            start: maxStartDate,
            end: minEndDate
        };
    }

    // tslint:disable-next-line:max-line-length
    move(sender: TaskActionSource = TaskActionSource.User, task: Task, schedule?: Schedule ): Promise<TaskMoveResult[]> {

        let volatileTask: Task;

        // schedule is only provided for the original task
        if(schedule !== undefined) {
            volatileTask = new Task(task.name, schedule);
            Object.assign(volatileTask, task, { schedule });
        }
        // tslint:disable-next-line:one-line
        else {
            volatileTask = new Task(task.name, new Schedule(task.start, task.duration));
            Object.assign(volatileTask, task);
        }

        return new Promise((resolve, reject) => {

            let taskMoveResult: TaskMoveResult | null = null;

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
                            taskMoveResult = new TaskMoveResult(false, volatileTask, message);
                            
                            this.volatileTaskRepository.add(taskMoveResult);
                            reject(this.volatileTaskRepository.getVolatileTaskResults());
                            return;
                        }
                    break;
                }
            }

            // determine whether the task needs to be scheduled later
            if(scheduleWindow.start) {
                taskMoveResult = this.checkConstraint(volatileTask, new Schedule(scheduleWindow.start, volatileTask.duration));
            }

            // determine whether the task needs to be scheduled earlier
            if(scheduleWindow.end) {
                taskMoveResult = this.checkConstraint(volatileTask, new Schedule(scheduleWindow.end, volatileTask.duration, StartOrEnd.End));
            }

            // create a new taskMoveResult if not already present
            if(!taskMoveResult) {
                taskMoveResult = new TaskMoveResult(true, volatileTask);
            }

            // append taskMoveResult to array of updated tasks
            this.volatileTaskRepository.add(taskMoveResult);

            // check validity and return if invalid
            if(!taskMoveResult.valid) {
                reject(this.volatileTaskRepository.getVolatileTaskResults());
                return;
            }

            // cascade
            let promisesArray: Array<Promise<TaskMoveResult[]>> = [];

            // dependencies
            let successorDependencies: Ix.Enumerable<Dependency> = this.taskRepository.getSuccessorDependencies(volatileTask.id);

            if(successorDependencies.any()) {
                let dependencyPromiseArray: Promise<TaskMoveResult[]>[] = successorDependencies
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
                    let childTaskPromiseArray: Promise<TaskMoveResult[]>[] = childTaskEnumerable
                    .select(childTask => {
                        return this.move(TaskActionSource.Parent, childTask);
                    }).toArray();

                    promisesArray.unshift.apply(promisesArray, childTaskPromiseArray);
                }
            }

            if(taskMoveResult.valid && sender !== TaskActionSource.Parent) {
                // parent evaluation

                let parentTask: Task | null = this.volatileTaskRepository.getParent(volatileTask.id);

                // todo: check that this doesn't share an ancestor parent with a previously processed task e.g. a predecessor
                if(parentTask !== null) { 
                    let parentEvaluationPromise: Promise<TaskMoveResult[]> = this.move(TaskActionSource.Child, parentTask);

                    promisesArray.unshift(parentEvaluationPromise);
                }
            }

            // check all returned taskMoveResults
            if(promisesArray.length > 0) {
                Promise.all(promisesArray)
                    .then((promiseArrayResults: Array<TaskMoveResult[]>) => {
                        
                        // tslint:disable-next-line:max-line-length
                        const promiseResultEnumerable: Ix.Enumerable<TaskMoveResult> = Ix.Enumerable.fromArray(promiseArrayResults).selectMany(promiseArrayResult => {
                            
                            if(promiseArrayResult.length > 0) {
                                return Ix.Enumerable.fromArray(promiseArrayResult);
                            }
                            
                            // return empty enumerable
                            return Ix.Enumerable.fromArray(Array<TaskMoveResult>());
                        });

                        // todo: refactor opportunity; same general block as parent evaluation
                        if(promiseResultEnumerable.any()) {
                            promiseResultEnumerable.forEach(newTaskMoveResult => this.volatileTaskRepository.add(newTaskMoveResult));
                        }

                        taskMoveResult = taskMoveResult || new TaskMoveResult(true, volatileTask);

                        taskMoveResult.valid = taskMoveResult.valid && promiseResultEnumerable.all(result => result.valid);

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
                    });
            }
            else {
                resolve(this.volatileTaskRepository.getVolatileTaskResults());
            }
        });
    }

    checkConstraint(task: Task, schedule: Schedule): TaskMoveResult {

        let {start, end, duration, ...rest} = task;
        
        let volatileTask = new Task(rest.name, schedule);
        Object.assign(volatileTask, rest, { schedule } );
        
        let taskMoveResult: TaskMoveResult | null = null;

        // cannot move tasks with MustStart / MustEnd constraints
        if (task.constraint) {
            const constraint: Constraint = task.constraint;
            switch(constraint.constraintType) {
                case ConstraintType.MustStartOn:
                    if(constraint.date.getTime() !== volatileTask.start.getTime()) {
                        // todo: supply better error message
                        // tslint:disable-next-line:max-line-length
                        let message: string = `Task ${volatileTask.name} would start on ${volatileTask.start} but must start on ${constraint.date}`;
                        taskMoveResult = new TaskMoveResult(false, volatileTask, message);
                    }
                break;
                case ConstraintType.MustEndOn:
                    if(constraint.date.getTime() !== volatileTask.end.getTime()) {
                        // todo: supply better error message
                        // tslint:disable-next-line:max-line-length
                        let message: string = `Task ${volatileTask.name} would end on ${volatileTask.end} but must start on ${constraint.date}`;
                        taskMoveResult = new TaskMoveResult(false, volatileTask, message);
                    }
                break;
                case ConstraintType.MustStartBefore:
                    if (!(volatileTask.start < constraint.date)) {
                        // tslint:disable-next-line:max-line-length
                        taskMoveResult = new TaskMoveResult(false, volatileTask, `Start date ${volatileTask.start} succeeds MustStartBefore constraint ${constraint.date}`);
                    }
                    break;
                case ConstraintType.MustStartAfter:
                    if (!(volatileTask.start > constraint.date)) {
                        // tslint:disable-next-line:max-line-length
                        taskMoveResult = new TaskMoveResult(false, volatileTask, `Start date ${volatileTask.start} preceeds MustStartAfter constraint ${constraint.date}`);
                    }
                    break;
                case ConstraintType.MustEndBefore:
                    if (!(volatileTask.end < constraint.date)) {
                        // tslint:disable-next-line:max-line-length
                        taskMoveResult = new TaskMoveResult(false, volatileTask, `End date ${volatileTask.end} succeeds MustEndBefore constraint ${constraint.date}`);
                    }
                    break;
                case ConstraintType.MustEndAfter:
                    if (!(volatileTask.end > constraint.date)) {
                        // tslint:disable-next-line:max-line-length
                        taskMoveResult = new TaskMoveResult(false, volatileTask, `End date ${volatileTask.end} preceeds MustEndAfter constraint ${constraint.date}`);
                    }
                    break;
            }
        }

        if (!taskMoveResult) {
            taskMoveResult = new TaskMoveResult(true, volatileTask);
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
    constructor(public valid: boolean, public task: Task, public message?: string) {
    }
}

