import "ts-jest";
import { Task } from "../src/models/Task";
import {TaskRepository} from "../src/TaskRepository";

const tasks: Task[] = [];
const duration: number = 1;
const startDate: Date = new Date();

const project: Task = new Task("Project", startDate, duration);
project.id = 1;
tasks.push(project);

const alpha: Task = new Task("Alpha", startDate, duration);
alpha.id = 2;
alpha.parentId = 1;
tasks.push(alpha);

const a1: Task = new Task("A1", startDate, duration);
a1.id = 3;
a1.parentId = 2;
tasks.push(a1);

const a2: Task = new Task("A2", startDate, duration);
a2.id = 4;
a2.parentId = 2;
tasks.push(a2);

const beta: Task = new Task("Beta", startDate, duration);
beta.parentId = 1;
beta.id = 5;
tasks.push(beta);

const b1: Task = new Task("B1", startDate, duration);
b1.id = 6;
b1.parentId = 5;
tasks.push(b1);

const b2: Task = new Task("B2", startDate, duration);
b2.id = 7;
b2.parentId = 5;
tasks.push(b2);

const sut: TaskRepository = new TaskRepository(tasks);

describe("Task Repository get methods", () => {

  test("get task by id", () => {
    expect(sut.get(2).name).toBe("Alpha");
  });

  test("get task by parent", () => {
    expect(sut.getParent(3).name).toBe("Alpha");
    expect(sut.getParent(6).name).toBe("Beta");
  });

  test("get task children", () => {
    expect(sut.children(2).firstOrDefault().id).toBe(3);
  });

  test("get all task children", () => {
    expect(sut.allChildren(1).count()).toBe(6);
  });
});





