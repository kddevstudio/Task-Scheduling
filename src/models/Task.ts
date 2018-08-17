import { StartOrEnd } from "../StartOrEnd";
import { Schedule } from "./Schedule";
import { Constraint } from "./Constraint";

export class Task extends Schedule {

    id: number = 0;
    parentId: number = 0;
    childTasks: Array<Task> = new Array<Task>();
    constraint: Constraint | null = null;

    constructor(public name: string, scheduleDate: Date, scheduleParam2: Date | number, param2Type?: StartOrEnd ) {
        super(scheduleDate, scheduleParam2, param2Type);
    }
}
