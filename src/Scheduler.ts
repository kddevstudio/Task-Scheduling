import { StartOrEnd } from "./StartOrEnd";
import { Schedule } from "./models/Schedule";

export class Scheduler {

    move(schedule: Schedule, date: Date, startOrEnd: StartOrEnd = StartOrEnd.Start): void {
        // reschedule task based on provided date and schedule point
        if(startOrEnd === StartOrEnd.Start) {
            // set new start date
            schedule.start = date;

            // calculate end from duration
            schedule.end.setDate(schedule.start.getDate() + schedule.duration);
        } else if(startOrEnd === StartOrEnd.End) {
            // set new end date
            schedule.end = date;

            // calculate start from duration
            schedule.start.setDate(schedule.end.getDate() - schedule.duration);
        }
    }

    change(schedule: Schedule, change: Date | number, startOrEnd?: StartOrEnd): void {
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