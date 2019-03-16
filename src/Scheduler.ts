import { StartOrEnd } from "./StartOrEnd";
import { Task } from "./models/Task";
import { Schedule } from "./models/Schedule";
import { Constraint } from "./models/Constraint";
import { ConstraintType } from "./ConstraintType";
import { TaskRepository } from "./TaskRepository";
import { DependencyType } from "./DependencyType";
import { TaskActionSource } from "./TaskActionSource";
import { ITaskRepository } from "./ITaskRepository";
import { VolatileTaskRepository } from "./VolatileTaskRepository";
import { Dependency } from "./models/Dependency";
import * as Ix from "ix";

export class Scheduler {

    constructor(private taskRepository: ITaskRepository) { }

    // tslint:disable-next-line:max-line-length
    move(sender: TaskActionSource = TaskActionSource.User, task: Task, taskMoveResults: TaskMoveResult[] ): Promise<TaskMoveResult[]> {

        return new Promise((resolve, reject) => {

            // tslint:disable-next-line:max-line-length
            let predecessorDependencies: Ix.Enumerable<Dependency> = this.taskRepository.getPredecessorDependencies(task.id);
            // tslint:disable-next-line:max-line-length
            if(predecessorDependencies.any()) {
                // tslint:disable-next-line:max-line-length
                let startPredecessors: Ix.Enumerable<Dependency> = predecessorDependencies.where(dependency => dependency.type === DependencyType.FinishStart || dependency.type === DependencyType.StartStart);
                let finishPredecessors: Ix.Enumerable<Dependency> = predecessorDependencies.except(startPredecessors);

                let volatileTaskRepository: VolatileTaskRepository = new VolatileTaskRepository(this.taskRepository, taskMoveResults);

                // tslint:disable-next-line:max-line-length
                var minStartDate: Date | null = startPredecessors.any() ? startPredecessors.select(dependency => (volatileTaskRepository.get(dependency.predecessorId) as Task).end).min() : null;
                // tslint:disable-next-line:max-line-length
                var maxEndDate: Date | null = finishPredecessors.any() ? finishPredecessors.select(dependency => volatileTaskRepository.get(dependency.predecessorId).start).min() : null;

                let taskMoveResult: TaskMoveResult | null = null;

                // determine whether the task needs to be scheduled later
                if(minStartDate && task.start < minStartDate) {

                    taskMoveResult = this.checkConstraint(task, new Schedule(minStartDate, task.duration));

                    if(!taskMoveResult.valid) {
                        reject(taskMoveResult);
                    }
                }

                // determine whether the task needs to be scheduled earlier
                if(maxEndDate && task.end < maxEndDate) {

                    taskMoveResult = this.checkConstraint(task, new Schedule(maxEndDate, task.duration, StartOrEnd.End));

                    if(!taskMoveResult.valid) {
                        reject(taskMoveResult);
                    }
                }

                if(taskMoveResult) {
                    // append taskMoveResult to array of updated tasks
                    taskMoveResults.unshift(taskMoveResult);

                    // cascade
                    let successorDependencies: Ix.Enumerable<Dependency> = this.taskRepository.getSuccessorDependencies(task.id);

                    if(successorDependencies.any()) {
                        let promiseArray: Promise<TaskMoveResult[]>[] = successorDependencies.select(dependency => {
                            let successorTask: Task = volatileTaskRepository.get(dependency.successorId);
                            return this.move(TaskActionSource.Predecessor, successorTask, taskMoveResults);
                        }).toArray();

                        Promise.all(promiseArray).then(promiseArrayResults => {
                            // tslint:disable-next-line:max-line-length
                            const promiseResultArray: TaskMoveResult[] = Ix.Enumerable.fromArray(promiseArrayResults).selectMany(function(promiseArrayResult){
                                if(promiseArrayResult.length) {
                                    return Ix.Enumerable.fromArray(promiseArrayResult);
                                }
                            }).toArray();

                            if(promiseResultArray.length) {
                                taskMoveResults.unshift.apply(null, promiseResultArray);
                            }

                            resolve(taskMoveResults);
                        });
                    }
                    // tslint:disable-next-line:one-line
                    else {
                        resolve(taskMoveResults);
                    }
                }
                // tslint:disable-next-line:one-line
                else {
                    // task does not need adjusted, return null
                    resolve(new Array<TaskMoveResult>());
                }
            }
        });
    }

    checkConstraint(task: Task, schedule: Schedule): TaskMoveResult {

        const volatileTask: Task = new Task(task.name, schedule.start, schedule.end);
        let taskMoveResult: TaskMoveResult | null = null;

        // cannot move tasks with MustStart / MustEnd constraints
        if (task.constraint) {
            const constraint: Constraint = task.constraint;
            switch(constraint.constraintType) {
                case ConstraintType.MustStartOn:
                    if(task.start.getTime() !== volatileTask.start.getTime()) {
                        // todo: supply better error message
                        // tslint:disable-next-line:max-line-length
                        let message: string = `Task {volatileTask.name} would start on {volatileTask.start} but must start on {constraint.date}`;
                        taskMoveResult = new TaskMoveResult(false, volatileTask, message);
                    }
                break;
                case ConstraintType.MustEndOn:
                    if(task.end.getTime() !== volatileTask.end.getTime()) {
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

