import { StartOrEnd } from "./StartOrEnd";
import { Schedule } from "./models/Schedule";

export class Scheduler {

    move(schedule: Schedule, date: Date, startOrEnd: StartOrEnd = StartOrEnd.Start): void {
        // reschedule task based on provided date and schedule point
        if(startOrEnd === StartOrEnd.Start) {
            // set new date
            schedule.start = date;

            // calculate end from duration
            schedule.end.setDate(schedule.start.getDate() + schedule.duration);
        } else if(startOrEnd === StartOrEnd.End) {
            // set new date
            schedule.end = date;

            // calculate end from duration
            schedule.end.setDate(schedule.start.getDate() - schedule.duration);
        }
    }
}