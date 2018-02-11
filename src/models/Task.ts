export class Task{
    constructor(public name: string){
    }

    id: number = 0;;
    parentId: number = 0;
    childTasks: Array<Task> = new Array<Task>();
}