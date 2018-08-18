import { StartOrEnd } from "./StartOrEnd";
import { Task } from "./models/Task";
import { Constraint } from "./models/Constraint";
import { ConstraintType } from "./ConstraintType";
import { TaskRepository } from "./TaskRepository";
import { DependencyType } from "./DependencyType";

export class Scheduler {

    move(task: Task, date: Date, startOrEnd: StartOrEnd = StartOrEnd.Start): TaskMoveResult  {
        let taskMoveResult: TaskMoveResult = this._move(task, date, startOrEnd);
        return taskMoveResult;
    }

    private _move(task: Task, date: Date, startOrEnd: StartOrEnd = StartOrEnd.Start): TaskMoveResult {

        const volatileTask: Task = new Task(task.name, task.start, task.end);
        let taskMoveResult: TaskMoveResult | null = null;

        // cannot move tasks with MustStart / MustEnd constraints
        if(task.constraint) {
            const constraint: Constraint = task.constraint;
            if(constraint.constraintType === ConstraintType.MustStartOn || constraint.constraintType === ConstraintType.MustEndOn) {
                taskMoveResult = new TaskMoveResult(false, volatileTask, `Task cannot be moved`);
            }
        }

        // reschedule task based on provided date and schedule point
        if(startOrEnd === StartOrEnd.Start) {
            // set new start date
            volatileTask.start = date;

            // calculate end from duration
            volatileTask.end.setDate(volatileTask.start.getDate() + volatileTask.duration);
        } else if(startOrEnd === StartOrEnd.End) {
            // set new end date
            volatileTask.end = date;

            // calculate start from duration
            volatileTask.start.setDate(volatileTask.end.getDate() - volatileTask.duration);
        }

        if(task.constraint) {
            let constraint: Constraint = task.constraint;
            switch(constraint.constraintType) {
                case ConstraintType.MustStartBefore:
                if(!(volatileTask.start < constraint.date)) {
                    taskMoveResult = new TaskMoveResult(false, volatileTask, `Start date {volatileTask.start} succeeds MustStartBefore constraint {constraint.date}`);
                }
                break;
                case ConstraintType.MustStartAfter:
                if(!(volatileTask.start > constraint.date)) {
                    taskMoveResult = new TaskMoveResult(false, volatileTask, `Start date {volatileTask.start} preceeds MustStartAfter constraint {constraint.date}`);
                }
                break;
                case ConstraintType.MustEndBefore:
                if(!(volatileTask.end < constraint.date)) {
                    taskMoveResult = new TaskMoveResult(false, volatileTask, `End date {volatileTask.end} succeeds MustEndBefore constraint {constraint.date}`);
                }
                break;
                case ConstraintType.MustEndAfter:
                if(!(volatileTask.end > constraint.date)) {
                    taskMoveResult = new TaskMoveResult(false, volatileTask, `End date {volatileTask.end} preceeds MustEndAfter constraint {constraint.date}`);
                }
                break;
            }
        }

        if(!taskMoveResult) {
            taskMoveResult = new TaskMoveResult(true, volatileTask);
        }

        return taskMoveResult;
    }

    change(schedule: Task, change: Date | number, startOrEnd?: StartOrEnd): void {
        let diff: number;
        if(change instanceof Date) {
            if(startOrEnd === StartOrEnd.Start) {
                // capture change in date
                diff = schedule.start.getDate() - change.getDate();
                schedule.start = change;
                schedule.duration += diff;
            } else {
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

