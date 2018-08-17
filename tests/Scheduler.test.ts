import "ts-jest";
import { Scheduler } from "../src/Scheduler";
import { Schedule } from "../src/models/Schedule";
import { StartOrEnd } from "../src/StartOrEnd";
import { Task } from "../src/models/Task";
import { ConstraintType } from "../src/ConstraintType";
import { Constraint } from "../src/models/Constraint";

const sut: Scheduler = new Scheduler();

describe("Scheduler operations:", () => {
  test("move start", () => {
    var start: Date = new Date();
    var duration: number = 1;

    var newStart: Date = new Date(start);
    newStart.setDate(newStart.getDate() + duration);

    var expectedEnd: Date =  new Date(newStart);
    expectedEnd.setDate(expectedEnd.getDate() + duration);

    var task: Task = new Task("", start, duration);

    sut.move(task, newStart);

    expect(task.start).toEqual(newStart);
    expect(task.duration).toEqual(duration);
    expect(task.end).toEqual(expectedEnd);
   });

   test("move end", () => {
    var end: Date = new Date();
    var duration: number = 1;

    var newEnd: Date = new Date(end);
    newEnd.setDate(newEnd.getDate() + duration);

    var expectedStart: Date = new Date(end);

    var task: Task = new Task("", end, duration, StartOrEnd.End);

    sut.move(task, newEnd, StartOrEnd.End);

    expect(task.start).toEqual(expectedStart);
    expect(task.duration).toEqual(duration);
    expect(task.end).toEqual(newEnd);
   });

   test("change start", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var task: Task = new Task("", start, end);

    var newStart: Date = new Date(2018, 8, 26);

    sut.change(task, newStart, StartOrEnd.Start);

    expect(task.start).toEqual(newStart);
    expect(task.duration).toEqual(2);
    expect(task.end).toEqual(end);
   });

   test("change end", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var task: Task = new Task("", start, end);

    var newEnd: Date = new Date(2018, 8, 26);

    sut.change(task, newEnd, StartOrEnd.End);

    expect(task.start).toEqual(start);
    expect(task.duration).toEqual(10);
    expect(task.end).toEqual(newEnd);
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

    expect(() => { sut.move(task, new Date(2018, 8, 21));}).toThrowError("ConstraintViolation");
   });

   test("move start violating MustEndOn constraint", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var task: Task = new Task("MustEndOnViolation", start, end);
    task.constraint = new Constraint(ConstraintType.MustEndOn, task.start);

    expect(() => { sut.move(task, new Date(2018, 8, 21));}).toThrowError("ConstraintViolation");
   });

   test("move end violating MustStartOn constraint", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var task: Task = new Task("MustStartOnViolation", start, end);
    task.constraint = new Constraint(ConstraintType.MustStartOn, task.start);

    expect(() => { sut.move(task, new Date(2018, 8, 21), StartOrEnd.End);}).toThrowError("ConstraintViolation");
   });

   test("move end violating MustEndOn constraint", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var task: Task = new Task("MustEndOnViolation", start, end);
    task.constraint = new Constraint(ConstraintType.MustEndOn, task.start);

    expect(() => { sut.move(task, new Date(2018, 8, 21), StartOrEnd.End);}).toThrowError("ConstraintViolation");
   });

   test("move start before MustStartBefore constraint date", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var task: Task = new Task("MustStartBefore", start, end);
    task.constraint = new Constraint(ConstraintType.MustStartBefore, new Date(2018, 8, 25));

    expect(() => { sut.move(task, new Date(2018, 8, 21));}).not.toThrowError("ConstraintViolation");
   });

   test("move start to MustStartBefore constraint date", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var task: Task = new Task("MustStartBefore", start, end);
    task.constraint = new Constraint(ConstraintType.MustStartBefore, new Date(2018, 8, 25));

    expect(() => { sut.move(task, new Date(2018, 8, 25));}).toThrowError("ConstraintViolation");
   });

   test("move start after MustStartBefore constraint date", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var task: Task = new Task("MustStartBefore", start, end);
    task.constraint = new Constraint(ConstraintType.MustStartBefore, new Date(2018, 8, 25));

    expect(() => { sut.move(task, new Date(2018, 8, 26));}).toThrowError("ConstraintViolation");
   });

   test("move start after MustStartAfter constraint date", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var task: Task = new Task("MustStartAfter", start, end);
    task.constraint = new Constraint(ConstraintType.MustStartAfter, new Date(2018, 8, 14));

    expect(() => { sut.move(task, new Date(2018, 8, 15));}).not.toThrowError("ConstraintViolation");
   });

   test("move start to MustStartAfter constraint date", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var task: Task = new Task("MustStartAfter", start, end);
    task.constraint = new Constraint(ConstraintType.MustStartAfter, new Date(2018, 8, 14));

    expect(() => { sut.move(task, new Date(2018, 8, 14));}).toThrowError("ConstraintViolation");
   });

   test("move start before MustStartAfter constraint date", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var task: Task = new Task("MustStartAfter", start, end);
    task.constraint = new Constraint(ConstraintType.MustStartAfter, new Date(2018, 8, 14));

    expect(() => { sut.move(task, new Date(2018, 8, 13));}).toThrowError("ConstraintViolation");
   });

   test("move end before MustEndBefore constraint date", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var task: Task = new Task("MustEndBefore", start, end);
    task.constraint = new Constraint(ConstraintType.MustEndBefore, new Date(2018, 8, 30));

    expect(() => { sut.move(task, new Date(2018, 8, 29), StartOrEnd.End);}).not.toThrowError("ConstraintViolation");
   });

   test("move end to MustEndBefore constraint date", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var task: Task = new Task("MustEndBefore", start, end);
    task.constraint = new Constraint(ConstraintType.MustEndBefore, new Date(2018, 8, 30));

    expect(() => { sut.move(task, new Date(2018, 8, 30), StartOrEnd.End);}).toThrowError("ConstraintViolation");
   });

   test("move end after MustEndBefore constraint date", () => {
    var start: Date = new Date(2018, 7, 16);
    var end: Date = new Date(2018, 7, 28);

    var task: Task = new Task("MustEndBefore", start, end);
    task.constraint = new Constraint(ConstraintType.MustEndBefore, new Date(2018, 7, 30));

    expect(() => { sut.move(task, new Date(2018, 7, 31), StartOrEnd.End);}).toThrowError("ConstraintViolation");
   });

   test("move end after MustEndAfter constraint date", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var task: Task = new Task("MustEndAfter", start, end);
    task.constraint = new Constraint(ConstraintType.MustEndAfter, new Date(2018, 8, 26));

    expect(() => { sut.move(task, new Date(2018, 8, 27), StartOrEnd.End);}).not.toThrowError("ConstraintViolation");
   });

   test("move end to MustEndAfter constraint date", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var task: Task = new Task("MustEndAfter", start, end);
    task.constraint = new Constraint(ConstraintType.MustEndAfter, new Date(2018, 8, 26));

    expect(() => { sut.move(task, new Date(2018, 8, 26), StartOrEnd.End);}).toThrowError("ConstraintViolation");
   });

   test("move end before MustEndAfter constraint date", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var task: Task = new Task("MustEndAfter", start, end);
    task.constraint = new Constraint(ConstraintType.MustEndAfter, new Date(2018, 8, 26));

    expect(() => { sut.move(task, new Date(2018, 8, 25), StartOrEnd.End);}).toThrowError("ConstraintViolation");
   });
});
