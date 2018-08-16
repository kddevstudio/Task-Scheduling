import { StartOrEnd } from "../StartOrEnd";
import {Schedule} from "./Schedule";

export class Task extends Schedule {
    constructor(public name: string, scheduleDate: Date, scheduleParam2: Date | number, param2Type?: StartOrEnd ) {
        super(scheduleDate, scheduleParam2, param2Type);
    }

    id: number = 0;
    parentId: number = 0;
    childTasks: Array<Task> = new Array<Task>();
}
