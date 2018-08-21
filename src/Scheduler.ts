import { StartOrEnd } from "./StartOrEnd";
import { Task } from "./models/Task";

import { Constraint } from "./models/Constraint";
import { ConstraintType } from "./ConstraintType";
import { TaskRepository } from "./TaskRepository";
import { DependencyType } from "./DependencyType";
import { TaskActionSource } from "./TaskActionSource";
import { ITaskRepository } from "./ITaskRepository";
import { VolatileTaskRepository } from "./VolatileTaskRepository";
import { Dependency } from "./models/Dependency";

export class Scheduler {

    constructor(private taskRepository: ITaskRepository) { }

    // tslint:disable-next-line:max-line-length
    move(sender: TaskActionSource = TaskActionSource.User, task: Task, taskMoveResults: TaskMoveResult[] ): Promise<TaskMoveResult[]> {

        return new Promise((resolve, reject) => {

            // tslint:disable-next-line:max-line-length
            let predecessorDependencies: Ix.Enumerable<Dependency> = this.taskRepository.getPredecessorDependencies(task.id);
            // tslint:disable-next-line:max-line-length
            let startPredecessors: Ix.Enumerable<Dependency> = predecessorDependencies.where(dependency => dependency.type === DependencyType.FinishStart || dependency.type === DependencyType.StartStart);
            let finishPredecessors: Ix.Enumerable<Dependency> = predecessorDependencies.except(startPredecessors);

            let volatileTaskRepository: VolatileTaskRepository = new VolatileTaskRepository(this.taskRepository, taskMoveResults);

            var minStartDate: Date = startPredecessors.select(dependency => volatileTaskRepository.get(dependency.predecessorId).end).max();
            // tslint:disable-next-line:max-line-length
            var maxEndDate: Date = finishPredecessors.select(dependency => volatileTaskRepository.get(dependency.predecessorId).start).min();

            if(task.start < minStartDate) {

                // tslint:disable-next-line:max-line-length
                let taskMoveResult: TaskMoveResult = this._move(task, minStartDate, StartOrEnd.Start, TaskActionSource.Predecessor);

                if(!taskMoveResult.valid) {
                    reject(taskMoveResult);
                }

                taskMoveResults.unshift(taskMoveResult);
            }

            let successorDependencies: Ix.Enumerable<Dependency> = this.taskRepository.getSuccessorDependencies(task.id);
            let promiseArray: Promise<TaskMoveResult[]>[] = successorDependencies.select(dependency => {
                let successorTask: Task = volatileTaskRepository.get(dependency.successorId);
                return this.move(TaskActionSource.Predecessor, successorTask, taskMoveResults);
            }).toArray();

            Promise.all(promiseArray).then(promiseArrayResults => {
                taskMoveResults.unshift.apply(null, promiseArrayResults);
                resolve(taskMoveResults);
            });
        });
    }

    private _move(task: Task, date: Date, startOrEnd: StartOrEnd = StartOrEnd.Start, sender: TaskActionSource): TaskMoveResult {

        const volatileTask: Task = new Task(task.name, task.start, task.end);
        let taskMoveResult: TaskMoveResult | null = null;

        // cannot move tasks with MustStart / MustEnd constraints
        if (task.constraint) {
            const constraint: Constraint = task.constraint;
            if (constraint.constraintType === ConstraintType.MustStartOn || constraint.constraintType === ConstraintType.MustEndOn) {
                taskMoveResult = new TaskMoveResult(false, volatileTask, `Task cannot be moved`);
            }
        }

        // reschedule task based on provided date and schedule point
        if (startOrEnd === StartOrEnd.Start) {
            // set new start date
            volatileTask.start = date;

            // calculate end from duration
            volatileTask.end.setDate(volatileTask.start.getDate() + volatileTask.duration);
        } else if (startOrEnd === StartOrEnd.End) {
            // set new end date
            volatileTask.end = date;

            // calculate start from duration
            volatileTask.start.setDate(volatileTask.end.getDate() - volatileTask.duration);
        }

        if (task.constraint) {
            let constraint: Constraint = task.constraint;
            switch (constraint.constraintType) {
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
                diff = schedule.start.getDate() - change.getDate();
                schedule.start = change;
                schedule.duration += diff;
            } else {
                if(change.getTime() === schedule.start.getTime()) {
                    throw new Error("Task cannot end on the same day that it starts");
                }

                // capture change in date
                diff = schedule.end.getDate() - change.getDate();
                schedule.end = change;
                schedule.duration -= diff;
            }
        } else {
            diff = schedule.duration - change;
            schedule.duration = change;
            schedule.end.setDate(schedule.end.getDate() - diff);
        }
    }
}
export class TaskMoveResult {
    constructor(public valid: boolean, public task: Task, public message?: string) {
    }
}

