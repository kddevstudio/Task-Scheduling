import { StartOrEnd } from "./StartOrEnd";
import { Task } from "./models/Task";
import { Constraint } from "./models/Constraint";
import { ConstraintType } from "./ConstraintType";
import { TaskRepository } from "./TaskRepository";
import { DependencyType } from "./DependencyType";

export class Scheduler {
    private taskRepository: TaskRepository;

    constructor(taskRepository: TaskRepository) {
        this.taskRepository = taskRepository;
    }

    move(task: Task, date: Date, startOrEnd: StartOrEnd = StartOrEnd.Start): Task {
        var volatileTask: Task = this._move(task, date, startOrEnd);
        return volatileTask;
    }

    private _move(task: Task, date: Date, startOrEnd: StartOrEnd = StartOrEnd.Start): Task {

        const volatileTask: Task = JSON.parse(JSON.stringify(task));

        // cannot move tasks with MustStart / MustEnd constraints
        if(volatileTask.constraint) {
            const constraint: Constraint = volatileTask.constraint;
            if(constraint.constraintType === ConstraintType.MustStartOn || constraint.constraintType === ConstraintType.MustEndOn) {
                throw Error("ConstraintViolation");
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
            volatileTask.start.setDate(task.end.getDate() - volatileTask.duration);
        }

        if(volatileTask.constraint) {
            let constraint: Constraint = volatileTask.constraint;
            switch(constraint.constraintType) {
                case ConstraintType.MustStartBefore:
                if(volatileTask.start >= constraint.date) {
                    throw Error("ConstraintViolation");
                }
                break;
                case ConstraintType.MustStartAfter:
                if(volatileTask.start <= constraint.date) {
                    throw Error("ConstraintViolation");
                }
                break;
                case ConstraintType.MustEndBefore:
                if(volatileTask.end >= constraint.date) {
                    throw Error("ConstraintViolation");
                }
                break;
                case ConstraintType.MustEndAfter:
                if(volatileTask.end <= constraint.date) {
                    throw Error("ConstraintViolation");
                }
                break;
            }
        }

        return volatileTask;
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
