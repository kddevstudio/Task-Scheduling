import { Task } from "src/models/Task";
import * as Ix from "ix";

export class TaskRepository{
    private taskEnumerable: Ix.Enumerable<Task>;

    constructor(tasks: Array<Task>){
        this.taskEnumerable = Ix.Enumerable.fromArray(tasks);
    }

    get(taskId: number){
        return this.taskEnumerable.where(task => task.id === taskId).firstOrDefault();
    }
    
    getParent(taskId: number){
        return this.get(this.get(taskId).parentId);
    }
    
    children(taskId: number){
        return this.taskEnumerable.where(task => task.parentId === taskId);
    }
    
    allChildren(taskId: number): Ix.Enumerable<Task>{
        let childTasks = this.children(taskId);
        if(childTasks.any()){
            childTasks = childTasks.concat(childTasks.selectMany(childTask => this.allChildren(childTask.id)));
        }
        return childTasks;
    }
}