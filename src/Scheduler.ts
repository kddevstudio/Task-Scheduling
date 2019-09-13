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
import * as Ix from "ix";

export class Scheduler {

    private volatileTaskRepository: VolatileTaskRepository;
    
    constructor(private taskRepository: ITaskRepository) {
        this.volatileTaskRepository = new VolatileTaskRepository(this.taskRepository);
    }

    // tslint:disable-next-line:max-line-length
    move(sender: TaskActionSource = TaskActionSource.User, task: Task, taskMoveResults: TaskMoveResult[] ): Promise<TaskMoveResult[]> {

        if(taskMoveResults.length){
            this.volatileTaskRepository.addRange(taskMoveResults);
        }
                
        return new Promise((resolve, reject) => {
            
            // tslint:disable-next-line:max-line-length
            let predecessorDependencies: Ix.Enumerable<Dependency> = this.taskRepository.getPredecessorDependencies(task.id);
            // tslint:disable-next-line:max-line-length
            
            let maxStartDate: Date | null = null;
            let minEndDate: Date | null = null;

            if(predecessorDependencies.any()) {
                // tslint:disable-next-line:max-line-length
                let startPredecessors: Ix.Enumerable<Dependency> = predecessorDependencies.where(dependency => dependency.type === DependencyType.FinishStart || dependency.type === DependencyType.StartStart);
                let finishPredecessors: Ix.Enumerable<Dependency> = predecessorDependencies.except(startPredecessors);

                //let volatileTaskRepository: VolatileTaskRepository = new VolatileTaskRepository(this.taskRepository, taskMoveResults);

                // tslint:disable-next-line:max-line-length
                if(startPredecessors.any()) {
                    maxStartDate = startPredecessors.select(dependency => {
                        let predecessorTask: Task | null = this.volatileTaskRepository.get(dependency.predecessorId);
                        return predecessorTask ? dependency.type == DependencyType.FinishStart ? predecessorTask.end : predecessorTask.start : null;
                    }).max();
                }
                
                // tslint:disable-next-line:max-line-length
                if(finishPredecessors.any()) {
                    minEndDate = finishPredecessors.select(dependency => {
                        let predecessorTask: Task | null = this.volatileTaskRepository.get(dependency.predecessorId);
                        return predecessorTask ? dependency.type == DependencyType.FinishFinish ? predecessorTask.end : predecessorTask.start : null;
                    }).min();
                }
            }

            let taskMoveResult: TaskMoveResult | null = null;

            // determine whether the task needs to be scheduled later
            if(maxStartDate) {
                taskMoveResult = this.checkConstraint(task, new Schedule(maxStartDate, task.duration));
            }

            // determine whether the task needs to be scheduled earlier
            if(minEndDate) {
                taskMoveResult = this.checkConstraint(task, new Schedule(minEndDate, task.duration, StartOrEnd.End));
            }

            let promisesArray: Array<Promise<TaskMoveResult[]>> = [];

            if(taskMoveResult) {
                // append taskMoveResult to array of updated tasks
                taskMoveResults.unshift(taskMoveResult);

                if(!taskMoveResult.valid) {
                    reject(taskMoveResults);
                }
                // tslint:disable-next-line:one-line
                else {
                    // cascade
                                        
                    // dependencies
                    let successorDependencies: Ix.Enumerable<Dependency> = this.taskRepository.getSuccessorDependencies(task.id);

                    if(successorDependencies.any()) {
                        let dependencyPromiseArray: Promise<TaskMoveResult[]>[] = successorDependencies
                        .select(dependency => {
                            let successorTask: Task = <Task>this.volatileTaskRepository.get(dependency.successorId);
                            return this.move(TaskActionSource.Predecessor, successorTask, taskMoveResults);
                        }).toArray();

                        promisesArray.unshift.apply(null, dependencyPromiseArray);
                    }

                    // check all returned taskMoveResults
                    Promise.all(promisesArray).then(promiseArrayResults => {
                        // tslint:disable-next-line:max-line-length
                        const promiseResultArray: TaskMoveResult[] = Ix.Enumerable.fromArray(promiseArrayResults).selectMany(promiseArrayResult => {
                            if(promiseArrayResult.length) {
                                return Ix.Enumerable.fromArray(promiseArrayResult);
                            }
                            return Ix.Enumerable.fromArray(Array<TaskMoveResult>());
                        }).toArray();

                        if(promiseResultArray && promiseResultArray.length) {
                            //taskMoveResults.unshift.apply(null, promiseResultArray);
                            promiseResultArray.forEach(newTaskMoveResult => {
                                let taskMoveResultIndex = taskMoveResults.indexOf(taskMoveResults.filter(currentTaskMoveResult => currentTaskMoveResult.task.id === newTaskMoveResult.task.id)[0]);
                                if(taskMoveResultIndex === -1){
                                    taskMoveResults.unshift(newTaskMoveResult);
                                }
                                else{
                                    taskMoveResults.splice(taskMoveResultIndex, 1, newTaskMoveResult);
                                }
                            });
                        }

                        resolve(taskMoveResults);
                    });
                }
            }
            // tslint:disable-next-line:one-line
            else {
                resolve(taskMoveResults);
            }
        });
    }

    checkConstraint(task: Task, schedule: Schedule): TaskMoveResult {

        let volatileTask: Task = new Task(task.name, task.start, task.end);
        Object.assign(volatileTask, schedule);

        // copy all other 'own' properties of task to volatileTask
        
        let taskMoveResult: TaskMoveResult | null = null;

        // cannot move tasks with MustStart / MustEnd constraints
        if (task.constraint) {
            const constraint: Constraint = task.constraint;
            switch(constraint.constraintType) {
                case ConstraintType.MustStartOn:
                    if(constraint.date.getTime() !== volatileTask.start.getTime()) {
                        // todo: supply better error message
                        // tslint:disable-next-line:max-line-length
                        let message: string = `Task {volatileTask.name} would start on {volatileTask.start} but must start on {constraint.date}`;
                        taskMoveResult = new TaskMoveResult(false, volatileTask, message);
                    }
                break;
                case ConstraintType.MustEndOn:
                    if(constraint.date.getTime() !== volatileTask.end.getTime()) {
                        // todo: supply better error message
                        // tslint:disable-next-line:max-line-length
                        let message: string = `Task {volatileTask.name} would end on {volatileTask.end} but must start on {constraint.date}`;
                        taskMoveResult = new TaskMoveResult(false, volatileTask, message);
                    }
                break;
                case ConstraintType.MustStartBefore:
                    if (!(volatileTask.start < constraint.date)) {
                        // tslint:disable-next-line:max-line-length
                        taskMoveResult = new TaskMoveResult(false, volatileTask, `Start date {volatileTask.start} succeeds MustStartBefore constraint {constraint.date}`);
                    }
                    break;
                case ConstraintType.MustStartAfter:
                    if (!(volatileTask.start > constraint.date)) {
                        // tslint:disable-next-line:max-line-length
                        taskMoveResult = new TaskMoveResult(false, volatileTask, `Start date {volatileTask.start} preceeds MustStartAfter constraint {constraint.date}`);
                    }
                    break;
                case ConstraintType.MustEndBefore:
                    if (!(volatileTask.end < constraint.date)) {
                        // tslint:disable-next-line:max-line-length
                        taskMoveResult = new TaskMoveResult(false, volatileTask, `End date {volatileTask.end} succeeds MustEndBefore constraint {constraint.date}`);
                    }
                    break;
                case ConstraintType.MustEndAfter:
                    if (!(volatileTask.end > constraint.date)) {
                        // tslint:disable-next-line:max-line-length
                        taskMoveResult = new TaskMoveResult(false, volatileTask, `End date {volatileTask.end} preceeds MustEndAfter constraint {constraint.date}`);
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

