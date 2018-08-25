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

let start: Date = new Date(2018, 7, 8);
let duration: number = 7;
const task: Task = new Task("", start, duration);
const taskRepository: ITaskRepository = new TaskRepository([task], null);
const sut: Scheduler = new Scheduler(taskRepository);

describe("Constraint operations:", () => {

  beforeEach(() => {
    task.start = start;
    task.duration = duration;
  });

  // mustStartBefore
  describe("MustStartBefore:", () => {

    // early
    test("Early", () => {
      task.name = "MustStartBefore";
      task.constraint = new Constraint(ConstraintType.MustStartBefore, task.start);

      let newStart: Date = new Date(task.start);
      newStart.setDate(1);
      let schedule: Schedule = new Schedule(newStart, task.duration);

      const taskMoveResult: TaskMoveResult = sut.checkConstraint(task, schedule);

      expect(taskMoveResult.valid).toBe(true);
    });

    // exact
    test("Exact", () => {
      task.name = "MustStartBefore";
      task.constraint = new Constraint(ConstraintType.MustStartBefore, task.start);

      let schedule: Schedule = new Schedule(task.start, task.duration);

      const taskMoveResult: TaskMoveResult = sut.checkConstraint(task, schedule);

      expect(taskMoveResult.valid).toBe(false);
    });

    // late
    test("Late", () => {
      task.name = "MustStartBefore";
      task.constraint = new Constraint(ConstraintType.MustStartBefore, task.start);

      let newStart: Date = new Date(task.start);
      newStart.setDate(15);
      let schedule: Schedule = new Schedule(newStart, task.duration);

      const taskMoveResult: TaskMoveResult = sut.checkConstraint(task, schedule);

      expect(taskMoveResult.valid).toBe(false);
    });
  });

  describe("MustStartOn:", () => {

    // early
    test("Early", () => {
      task.name = "MustStartOn";
      task.constraint = new Constraint(ConstraintType.MustStartOn, task.start);

      let newStart: Date = new Date(task.start);
      newStart.setDate(1);
      let schedule: Schedule = new Schedule(newStart, task.duration);

      const taskMoveResult: TaskMoveResult = sut.checkConstraint(task, schedule);

      expect(taskMoveResult.valid).toBe(false);
    });

    // exact
    test("Exact", () => {
      task.name = "MustStartOn";
      task.constraint = new Constraint(ConstraintType.MustStartOn, task.start);

      let schedule: Schedule = new Schedule(task.start, task.duration);

      const taskMoveResult: TaskMoveResult = sut.checkConstraint(task, schedule);

      expect(taskMoveResult.valid).toBe(true);
    });

    // late
    test("Late", () => {
      task.name = "MustStartOn";
      task.constraint = new Constraint(ConstraintType.MustStartOn, task.start);

      let newStart: Date = new Date(task.start);
      newStart.setDate(15);
      let schedule: Schedule = new Schedule(newStart, task.duration);

      const taskMoveResult: TaskMoveResult = sut.checkConstraint(task, schedule);

      expect(taskMoveResult.valid).toBe(false);
    });
  });

  // mustStartAfter
  describe("MustStartAfter:", () => {

    // early
    test("Early", () => {
      task.name = "MustStartAfter";
      task.constraint = new Constraint(ConstraintType.MustStartAfter, task.start);

      let newStart: Date = new Date(task.start);
      newStart.setDate(1);
      let schedule: Schedule = new Schedule(newStart, task.duration);

      const taskMoveResult: TaskMoveResult = sut.checkConstraint(task, schedule);

      expect(taskMoveResult.valid).toBe(false);
    });

    // exact
    test("Exact", () => {
      task.name = "MustStartAfter";
      task.constraint = new Constraint(ConstraintType.MustStartAfter, task.start);

      let schedule: Schedule = new Schedule(task.start, task.duration);

      const taskMoveResult: TaskMoveResult = sut.checkConstraint(task, schedule);

      expect(taskMoveResult.valid).toBe(false);
    });

    // late
    test("Late", () => {
      task.name = "MustStartAfter";
      task.constraint = new Constraint(ConstraintType.MustStartAfter, task.start);

      let newStart: Date = new Date(task.start);
      newStart.setDate(15);
      let schedule: Schedule = new Schedule(newStart, task.duration);

      const taskMoveResult: TaskMoveResult = sut.checkConstraint(task, schedule);

      expect(taskMoveResult.valid).toBe(true);
    });
  });

  // mustEndBefore
  describe("MustEndBefore:", () => {

    // early
    test("Early", () => {
      task.name = "MustEndBefore";
      task.constraint = new Constraint(ConstraintType.MustEndBefore, task.end);

      let newStart: Date = new Date(task.start);
      newStart.setDate(1);
      let schedule: Schedule = new Schedule(newStart, task.duration);

      const taskMoveResult: TaskMoveResult = sut.checkConstraint(task, schedule);

      expect(taskMoveResult.valid).toBe(true);
    });

    // exact
    test("Exact", () => {
      task.name = "MustEndBefore";
      task.constraint = new Constraint(ConstraintType.MustEndBefore, task.end);

      let schedule: Schedule = new Schedule(task.start, task.duration);

      const taskMoveResult: TaskMoveResult = sut.checkConstraint(task, schedule);

      expect(taskMoveResult.valid).toBe(false);
    });

    // late
    test("Late", () => {
      task.name = "MustEndBefore";
      task.constraint = new Constraint(ConstraintType.MustEndBefore, task.end);

      let newStart: Date = new Date(task.start);
      newStart.setDate(15);
      let schedule: Schedule = new Schedule(newStart, task.duration);

      const taskMoveResult: TaskMoveResult = sut.checkConstraint(task, schedule);

      expect(taskMoveResult.valid).toBe(false);
    });
  });

  // mustEndOn
  describe("MustEndOn:", () => {

    // early
    test("Early", () => {
      task.name = "MustEndOn";
      task.constraint = new Constraint(ConstraintType.MustEndOn, task.end);

      let newStart: Date = new Date(task.start);
      newStart.setDate(1);
      let schedule: Schedule = new Schedule(newStart, task.duration);

      const taskMoveResult: TaskMoveResult = sut.checkConstraint(task, schedule);

      expect(taskMoveResult.valid).toBe(false);
    });

    // exact
    test("Exact", () => {
      task.name = "MustEndOn";
      task.constraint = new Constraint(ConstraintType.MustEndOn, task.end);

      let schedule: Schedule = new Schedule(task.start, task.duration);

      const taskMoveResult: TaskMoveResult = sut.checkConstraint(task, schedule);

      expect(taskMoveResult.valid).toBe(true);
    });

    // late
    test("Late", () => {
      task.name = "MustEndOn";
      task.constraint = new Constraint(ConstraintType.MustEndOn, task.end);

      let newStart: Date = new Date(task.start);
      newStart.setDate(15);
      let schedule: Schedule = new Schedule(newStart, task.duration);

      const taskMoveResult: TaskMoveResult = sut.checkConstraint(task, schedule);

      expect(taskMoveResult.valid).toBe(false);
    });
  });

  // mustEndAfter
  describe("MustEndAfter:", () => {

    // early
    test("Early", () => {
      task.name = "MustEndAfter";
      task.constraint = new Constraint(ConstraintType.MustEndAfter, task.end);

      let newStart: Date = new Date(task.start);
      newStart.setDate(1);
      let schedule: Schedule = new Schedule(newStart, task.duration);

      const taskMoveResult: TaskMoveResult = sut.checkConstraint(task, schedule);

      expect(taskMoveResult.valid).toBe(false);
    });

    // exact
    test("Exact", () => {
      task.name = "MustEndAfter";
      task.constraint = new Constraint(ConstraintType.MustEndAfter, task.end);

      let schedule: Schedule = new Schedule(task.start, task.duration);

      const taskMoveResult: TaskMoveResult = sut.checkConstraint(task, schedule);

      expect(taskMoveResult.valid).toBe(false);
    });

    // late
    test("Late", () => {
      task.name = "MustEndAfter";
      task.constraint = new Constraint(ConstraintType.MustEndAfter, task.end);

      let newEnd: Date = new Date(task.end);
      newEnd.setDate(22);
      let schedule: Schedule = new Schedule(newEnd, task.duration, StartOrEnd.End);

      const taskMoveResult: TaskMoveResult = sut.checkConstraint(task, schedule);

      expect(taskMoveResult.valid).toBe(true);
    });
  });
});
