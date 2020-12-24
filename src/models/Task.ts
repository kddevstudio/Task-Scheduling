import { StartOrEnd } from "../StartOrEnd";
import { Schedule } from "./Schedule";
import { Constraint } from "./Constraint";

export class Task {

    id: number = 0;
    parentId: number | null = null;
    childTasks: Array<Task> = new Array<Task>();
    constraint: Constraint | null = null;

    private schedule: Schedule;

    constructor(public name: string, schedule: Schedule ) {
        this.schedule = Object.create(Object.getPrototypeOf(schedule), Object.getOwnPropertyDescriptors(schedule));
    }

    get start(): Date {
        return this.schedule.start;
    }

    set start(value: Date) {
        this.schedule.start = value;
    }

    get end(): Date {
        return this.schedule.end;
    }

    set end(value: Date) {
        this.schedule.end = value;
    }

    get duration(): number {
        return this.schedule.duration;
    }

    set duration(value: number) {
        this.schedule.duration = Math.floor(value);
    }
}
