import "ts-jest";
import { Schedule } from "../src/models/Schedule";
import { Task } from "../src/models/Task";

describe("Task copy:", () => {

    test("change start", () => {
        
        let schedule = new Schedule(new Date("2019 Nov 01 00:00:00"), 4);
        let task = new Task("New Task", schedule);

        expect(task.end.getFullYear()).toBe(2019);
        
        let volatileTask = Object.create(schedule);
        volatileTask = Object.assign(volatileTask, task);
        
        volatileTask.start = schedule.start;
        volatileTask.duration = schedule.duration;

        expect(volatileTask.name).toEqual(task.name);
        expect(volatileTask.end).toEqual(task.end);

        //volatileTask.duration = 7;
        expect(volatileTask.end).toEqual(task.end);

        expect(volatileTask.start.getFullYear()).toBe(2019);
        expect(volatileTask.end.getFullYear()).toBe(2019);
    });
});