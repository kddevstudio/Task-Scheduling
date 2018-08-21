import "ts-jest";
import { Scheduler, TaskMoveResult } from "../src/Scheduler";
import { Schedule } from "../src/models/Schedule";
import { StartOrEnd } from "../src/StartOrEnd";
import { Task } from "../src/models/Task";
import { ConstraintType } from "../src/ConstraintType";
import { Constraint } from "../src/models/Constraint";
import { ITaskRepository } from "../src/ITaskRepository";
import { TaskRepository } from "../src/TaskRepository";
import { TaskActionSource } from "../src/TaskActionSource";

let start: Date = new Date(2018, 7, 7);
let duration: number = 7;
const task: Task = new Task("", start, duration);
const taskRepository: ITaskRepository = new TaskRepository([task], null);
const sut: Scheduler = new Scheduler(taskRepository);

describe("Scheduler operations:", () => {

  beforeEach(() => {
    task.start = new Date(2018, 7, 7);
    task.duration = 7;
    task.end = new Date(2018, 7, 14);
  });

  test("move start", () => {

    let newStart: Date = new Date(start);
    newStart.setDate(newStart.getDate() + duration);

    let expectedEnd: Date = new Date(newStart);
    expectedEnd.setDate(expectedEnd.getDate() + duration);

    let taskMoveResults: TaskMoveResult[] = sut.move(TaskActionSource.User, task, newStart);

    expect(taskMoveResults[0].valid).toBe(true);
    expect(taskMoveResults[0].task.start).toEqual(newStart);
    expect(taskMoveResults[0].task.duration).toEqual(duration);
    expect(taskMoveResults[0].task.end).toEqual(expectedEnd);
  });

  test("move end", () => {
    var newEnd: Date = new Date(2018, 7, 21);
    var expectedStart: Date = new Date(2018, 7, 14);

    var taskMoveResults: TaskMoveResult[] = sut.move(task, newEnd, StartOrEnd.End);

    expect(taskMoveResults[0].valid).toBe(true);

    expect(taskMoveResults[0].task.start).toEqual(expectedStart);
    expect(taskMoveResults[0].task.duration).toEqual(duration);
    expect(taskMoveResults[0].task.end).toEqual(newEnd);
  });

  test("change start", () => {
    var newStart: Date = new Date(2018, 7, 10);

    sut.change(task, newStart, StartOrEnd.Start);

    expect(task.start).toEqual(newStart);
    expect(task.duration).toEqual(4);
    expect(task.end).toEqual(new Date(2018, 7, 14));
  });

  test("change start to end", () => {
    var newStart: Date = new Date(2018, 7, 14);

    expect(() => { sut.change(task, newStart, StartOrEnd.Start); }).toThrowError("Task cannot start on the same day that it ends");
  });

  test("change end", () => {
    var newEnd: Date = new Date(2018, 7, 21);

    sut.change(task, newEnd, StartOrEnd.End);

    expect(task.start).toEqual(start);
    expect(task.duration).toEqual(14);
    expect(task.end).toEqual(newEnd);
  });

  test("change end to start", () => {
    var newStart: Date = new Date(2018, 7, 7);

    expect(() => {
      sut.change(task, newStart, StartOrEnd.End);
    }).toThrowError("Task cannot end on the same day that it starts");
  });

  test("change duration", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var task: Task = new Task("", start, end);

    sut.change(task, 7);

    expect(task.start).toEqual(start);
    expect(task.duration).toEqual(7);
    expect(task.end).toEqual(new Date(2018, 8, 23));
  });

  test("move start violating MustStartOn constraint", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var task: Task = new Task("MustStartOnViolation", start, end);
    task.constraint = new Constraint(ConstraintType.MustStartOn, task.start);

    const taskMoveResults: TaskMoveResult[] = sut.move(task, new Date(2018, 8, 21));

    expect(taskMoveResults[0].valid).toBe(false);
  });

  test("move start violating MustEndOn constraint", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var task: Task = new Task("MustEndOnViolation", start, end);
    task.constraint = new Constraint(ConstraintType.MustEndOn, task.start);

    const taskMoveResults: TaskMoveResult[] = sut.move(task, new Date(2018, 8, 21));

    expect(taskMoveResults[0].valid).toBe(false);
  });

  test("move end violating MustStartOn constraint", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var task: Task = new Task("MustStartOnViolation", start, end);
    task.constraint = new Constraint(ConstraintType.MustStartOn, task.start);

    const taskMoveResults: TaskMoveResult[] = sut.move(task, new Date(2018, 8, 21), StartOrEnd.End);

    expect(taskMoveResults[0].valid).toBe(false);
  });

  test("move end violating MustEndOn constraint", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var task: Task = new Task("MustEndOnViolation", start, end);
    task.constraint = new Constraint(ConstraintType.MustEndOn, task.start);

    const taskMoveResults: TaskMoveResult[] = sut.move(task, new Date(2018, 8, 21), StartOrEnd.End);

    expect(taskMoveResults[0].valid).toBe(false);
  });

  test("move start before MustStartBefore constraint date", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var task: Task = new Task("MustStartBefore", start, end);
    task.constraint = new Constraint(ConstraintType.MustStartBefore, new Date(2018, 8, 25));

    const taskMoveResults: TaskMoveResult[] = sut.move(task, new Date(2018, 8, 21));

    expect(taskMoveResults[0].valid).toBe(true);
  });

  test("move start to MustStartBefore constraint date", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var task: Task = new Task("MustStartBefore", start, end);
    task.constraint = new Constraint(ConstraintType.MustStartBefore, new Date(2018, 8, 25));

    const taskMoveResults: TaskMoveResult[] = sut.move(task, new Date(2018, 8, 25));

    expect(taskMoveResults[0].valid).toBe(false);
  });

  test("move start after MustStartBefore constraint date", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var task: Task = new Task("MustStartBefore", start, end);
    task.constraint = new Constraint(ConstraintType.MustStartBefore, new Date(2018, 8, 25));

    const taskMoveResults: TaskMoveResult[] = sut.move(task, new Date(2018, 8, 26));

    expect(taskMoveResults[0].valid).toBe(false);
  });

  test("move start after MustStartAfter constraint date", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var task: Task = new Task("MustStartAfter", start, end);
    task.constraint = new Constraint(ConstraintType.MustStartAfter, new Date(2018, 8, 14));

    const taskMoveResults: TaskMoveResult[] = sut.move(task, new Date(2018, 8, 15));

    expect(taskMoveResults[0].valid).toBe(true);
  });

  test("move start to MustStartAfter constraint date", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var task: Task = new Task("MustStartAfter", start, end);
    task.constraint = new Constraint(ConstraintType.MustStartAfter, new Date(2018, 8, 14));

    const taskMoveResults: TaskMoveResult[] = sut.move(task, new Date(2018, 8, 14));

    expect(taskMoveResults[0].valid).toBe(false);
  });

  test("move start before MustStartAfter constraint date", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var task: Task = new Task("MustStartAfter", start, end);
    task.constraint = new Constraint(ConstraintType.MustStartAfter, new Date(2018, 8, 14));

    const taskMoveResults: TaskMoveResult[] = sut.move(task, new Date(2018, 8, 13));

    expect(taskMoveResults[0].valid).toBe(false);
  });

  test("move end before MustEndBefore constraint date", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var task: Task = new Task("MustEndBefore", start, end);
    task.constraint = new Constraint(ConstraintType.MustEndBefore, new Date(2018, 8, 30));

    const taskMoveResults: TaskMoveResult[] = sut.move(task, new Date(2018, 8, 29), StartOrEnd.End);

    expect(taskMoveResults[0].valid).toBe(true);
  });

  test("move end to MustEndBefore constraint date", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var task: Task = new Task("MustEndBefore", start, end);
    task.constraint = new Constraint(ConstraintType.MustEndBefore, new Date(2018, 8, 30));

    const taskMoveResults: TaskMoveResult[] = sut.move(task, new Date(2018, 8, 30), StartOrEnd.End);

    expect(taskMoveResults[0].valid).toBe(false);
  });

  test("move end after MustEndBefore constraint date", () => {
    var start: Date = new Date(2018, 7, 16);
    var end: Date = new Date(2018, 7, 28);

    var task: Task = new Task("MustEndBefore", start, end);
    task.constraint = new Constraint(ConstraintType.MustEndBefore, new Date(2018, 7, 30));

    const taskMoveResults: TaskMoveResult[] = sut.move(task, new Date(2018, 7, 31), StartOrEnd.End);

    expect(taskMoveResults[0].valid).toBe(false);
  });

  test("move end after MustEndAfter constraint date", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var task: Task = new Task("MustEndAfter", start, end);
    task.constraint = new Constraint(ConstraintType.MustEndAfter, new Date(2018, 8, 26));

    const taskMoveResults: TaskMoveResult[] = sut.move(task, new Date(2018, 8, 27), StartOrEnd.End);

    expect(taskMoveResults[0].valid).toBe(true);
  });

  test("move end to MustEndAfter constraint date", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var task: Task = new Task("MustEndAfter", start, end);
    task.constraint = new Constraint(ConstraintType.MustEndAfter, new Date(2018, 8, 26));

    const taskMoveResults: TaskMoveResult[] = sut.move(task, new Date(2018, 8, 26), StartOrEnd.End);

    expect(taskMoveResults[0].valid).toBe(false);
  });

  test("move end before MustEndAfter constraint date", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var task: Task = new Task("MustEndAfter", start, end);
    task.constraint = new Constraint(ConstraintType.MustEndAfter, new Date(2018, 8, 26));

    const taskMoveResults: TaskMoveResult[] = sut.move(task, new Date(2018, 8, 25), StartOrEnd.End);

    expect(taskMoveResults[0].valid).toBe(false);
  });
});
