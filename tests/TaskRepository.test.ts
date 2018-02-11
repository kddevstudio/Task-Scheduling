import "ts-jest"
import { Task } from "../src/models/Task";
import {TaskRepository} from "../src/TaskRepository";

const tasks = [];

const project = new Task("Project");
project.id = 0;
tasks.push(project);

const alpha = new Task("Alpha");
alpha.id = 1;
alpha.parentId = 0;
tasks.push(alpha);

const a1 = new Task("A1");
a1.id = 2;
a1.parentId = 1;
tasks.push(a1);

const a2 = new Task("A2");
a2.id = 3;
a2.parentId = 1;
tasks.push(a2);

const beta = new Task("Beta");
beta.parentId = 0;
beta.id = 4;
tasks.push(beta);

const b1 = new Task("B1");
b1.id = 5;
b1.parentId = 4;
tasks.push(b1);

const b2 = new Task("B2");
b2.id = 6;
b2.parentId = 4;
tasks.push(b2);

const sut = new TaskRepository(tasks);

describe('Task Repository get methods', () => {

  test('get task by id', () => {
    expect(sut.get(1).name).toBe("Alpha");
  });

  test('get task by parent', () => {
    expect(sut.getParent(2).name).toBe("Alpha");
    expect(sut.getParent(5).name).toBe("Beta");
  });

  test('get task children', () => {
    expect(sut.children(1).firstOrDefault().id).toBe(2);
  });

  test('get all task children', () => {
    expect(sut.allChildren(0).count()).toBe(6);
  });
})





