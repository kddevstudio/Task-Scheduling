import {Schedule} from './Schedule';

export class Task extends Schedule{
    constructor(public name: string, public start: Date | null, public end: Date | null, public duration: Number | null){
        super(start, end, duration);
    }

    id: number = 0;
    parentId: number = 0;
    childTasks: Array<Task> = new Array<Task>();
}