
import "ts-jest";
import { Dependency } from "./../src/models/Dependency";
import { DependencyType } from "./../src/DependencyType";
import { Scheduler, TaskMoveResult } from "../src/Scheduler";
import { Schedule } from "../src/models/Schedule";
import { StartOrEnd } from "../src/StartOrEnd";
import { Task } from "../src/models/Task";
import { ConstraintType } from "../src/ConstraintType";
import { Constraint } from "../src/models/Constraint";
import { ITaskRepository } from "../src/ITaskRepository";
import { TaskRepository } from "../src/TaskRepository";
import { TaskActionSource } from "../src/TaskActionSource";

let start: Date = new Date(2018, 7, 15);
let duration: number = 4;
const task: Task = new Task("", start, duration);

let taskRepository: ITaskRepository | null;
let sut: Scheduler | null;

describe("Constraint operations:", () => {

  beforeEach(() => {
    task.start = start;
    task.duration = duration;
    taskRepository = new TaskRepository([task], null);
    sut = new Scheduler(taskRepository);
  });

  // mustStartBefore
  describe("MustStartBefore:", () => {

    // early
    test("Early", () => {
      task.name = "MustStartBefore";
      task.constraint = new Constraint(ConstraintType.MustStartBefore, task.start);

      let newStart: Date = new Date(task.start);
      newStart.setDate(14);
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
      newStart.setDate(16);
      let schedule: Schedule = new Schedule(newStart, task.duration);

      const taskMoveResult: TaskMoveResult = sut.checkConstraint(task, schedule);

      expect(taskMoveResult.valid).toBe(false);
    });
  });

  // mustStartOn
  describe("MustStartOn:", () => {

    // early
    test("Early", () => {
      task.name = "MustStartOn";
      task.constraint = new Constraint(ConstraintType.MustStartOn, task.start);

      let newStart: Date = new Date(task.start);
      newStart.setDate(14);
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
      newStart.setDate(16);
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
      newStart.setDate(14);
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
      newStart.setDate(16);
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
      newStart.setDate(14);
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
      newStart.setDate(16);
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
      newStart.setDate(14);
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
      newStart.setDate(16);
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
      newStart.setDate(14);
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

      let newStart: Date = new Date(task.start);
      newStart.setDate(16);
      let schedule: Schedule = new Schedule(newStart, task.duration);

      const taskMoveResult: TaskMoveResult = sut.checkConstraint(task, schedule);

      expect(taskMoveResult.valid).toBe(true);
    });
  });
});

describe("Dependency traversal:", () => {

  task.start = start;
  task.duration = duration;

  let predecessor1: Task = new Task("", new Date(2018, 7, 15), duration);
  let predecessor2: Task = new Task("", start, duration);

  predecessor1.id = 1;
  predecessor2.id = 2;
  task.id = 3;

  beforeEach(() => {

    let dependency1: Dependency = new Dependency(1, 3, DependencyType.FinishStart);
    let dependency2: Dependency = new Dependency(2, 3, DependencyType.FinishStart);

    taskRepository = new TaskRepository([predecessor1, predecessor2, task], [dependency1, dependency2]);
    sut = new Scheduler(taskRepository);

  });

  describe("Finish Start:", () => {

    // task move according to predecessor, FS, no constraint
    test("Successor-NoConstraint", async () => {
      task.name = "Successor-NoConstraint";

      const taskMoveResults: TaskMoveResult[] = await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);

      expect(taskMoveResults.length).toBe(2);
      expect(taskMoveResults[0].valid).toBe(true);
      expect(taskMoveResults[1].valid).toBe(true);
    });

    // mustStartBefore
    describe("MustStartBefore:", () => {

      // early
      test("Early", async () => {
        task.name = "MustStartBefore";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(20);

        task.constraint = new Constraint(ConstraintType.MustStartBefore, constraintDate);

        const taskMoveResults: TaskMoveResult[] = await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);

        expect(taskMoveResults.length).toBe(2);
        expect(taskMoveResults[0].valid).toBe(true);
        expect(taskMoveResults[1].valid).toBe(true);
      });

      // exact
      test("Exact", async () => {
        task.name = "MustStartBefore";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(19);

        task.constraint = new Constraint(ConstraintType.MustStartBefore, constraintDate);

        // use try/catch to capture rejected promises
        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch (taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });

      // late
      test("Late", async () => {
        task.name = "MustStartBefore";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(18);

        task.constraint = new Constraint(ConstraintType.MustStartBefore, constraintDate);

        // use try/catch to capture rejected promises
        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch (taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });
    });

    // mustStartOn
    describe("MustStartOn:", () => {

      // early
      test("Early", async () => {
        task.name = "MustStartOn";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(18);

        task.constraint = new Constraint(ConstraintType.MustStartOn, task.start);

        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch (taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });

      // exact
      test("Exact", async () => {
        task.name = "MustStartOn";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(19);

        task.constraint = new Constraint(ConstraintType.MustStartOn, constraintDate);

        const taskMoveResults: TaskMoveResult[] = await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);

        expect(taskMoveResults.length).toBe(2);
        expect(taskMoveResults[0].valid).toBe(true);
        expect(taskMoveResults[1].valid).toBe(true);
      });

      // late
      test("Late", async () => {
        task.name = "MustStartOn";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(20);

        task.constraint = new Constraint(ConstraintType.MustStartOn, task.start);

        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch (taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });
    });

    // mustStartAfter
    describe("MustStartAfter:", () => {

      // early
      test("Early", async () => {
        task.name = "MustStartAfter";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(18);

        task.constraint = new Constraint(ConstraintType.MustStartAfter, task.start);

        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch (taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });

      // exact
      test("Exact", async () => {
        task.name = "MustStartAfter";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(19);

        task.constraint = new Constraint(ConstraintType.MustStartAfter, task.start);

        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch (taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });

      // late
      test("Late", async () => {
        task.name = "MustStartAfter";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(20);

        task.constraint = new Constraint(ConstraintType.MustStartAfter, task.start);

        const taskMoveResults: TaskMoveResult[] = await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);

        expect(taskMoveResults.length).toBe(2);
        expect(taskMoveResults[0].valid).toBe(true);
        expect(taskMoveResults[1].valid).toBe(true);
      });
    });

    // mustEndBefore
    describe("MustEndBefore:", () => {

      // earlier than constraint
      test("Early", async () => {
        task.name = "MustEndBefore";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(24);

        task.constraint = new Constraint(ConstraintType.MustEndBefore, constraintDate);

        const taskMoveResults: TaskMoveResult[] = await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);

        expect(taskMoveResults.length).toBe(2);
        expect(taskMoveResults[0].valid).toBe(true);
        expect(taskMoveResults[1].valid).toBe(true);
      });

      // exactly constraint
      test("Exact", async () => {
        task.name = "MustEndBefore";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(23);

        task.constraint = new Constraint(ConstraintType.MustEndBefore, constraintDate);

        // use try/catch to capture rejected promises
        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch (taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });

      // later than constraint
      test("Late", async () => {
        task.name = "MustEndBefore";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(22);

        task.constraint = new Constraint(ConstraintType.MustEndBefore, constraintDate);

        // use try/catch to capture rejected promises
        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch (taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });
    });

    // mustEndOn
    describe("MustEndOn:", () => {

      // earlier than constraint
      test("Early", async () => {
        task.name = "MustEndOn";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(24);

        task.constraint = new Constraint(ConstraintType.MustEndOn, constraintDate);

        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch (taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });

      // exactly constraint
      test("Exact", async () => {
        task.name = "MustEndOn";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(23);

        task.constraint = new Constraint(ConstraintType.MustEndOn, constraintDate);

        const taskMoveResults: TaskMoveResult[] = await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);

        expect(taskMoveResults.length).toBe(2);
        expect(taskMoveResults[0].valid).toBe(true);
        expect(taskMoveResults[1].valid).toBe(true);
      });

      // later than constraint
      test("Late", async () => {
        task.name = "MustEndOn";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(22);

        task.constraint = new Constraint(ConstraintType.MustEndOn, constraintDate);

        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch (taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });
    });

    // mustEndAfter
    describe("MustEndAfter:", () => {

      // earlier than constraint
      test("Early", async () => {
        task.name = "MustEndAfter";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(24);

        task.constraint = new Constraint(ConstraintType.MustEndAfter, constraintDate);

        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch (taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });

      // exactly constraint
      test("Exact", async () => {
        task.name = "MustEndAfter";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(23);

        task.constraint = new Constraint(ConstraintType.MustEndAfter, constraintDate);

        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch (taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });

      // later than constraint
      test("Late", async () => {
        task.name = "MustEndAfter";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(22);

        task.constraint = new Constraint(ConstraintType.MustEndAfter, constraintDate);

        const taskMoveResults: TaskMoveResult[] = await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);

        expect(taskMoveResults.length).toBe(2);
        expect(taskMoveResults[0].valid).toBe(true);
        expect(taskMoveResults[1].valid).toBe(true);
      });
    });
  });

  describe("Finish Finish:", () => {

    beforeEach(() => {
      // reset task using the specified start date which will calculate the end date, then set start to the end date.
      task.start = start;
      task.start = task.end;
      
      task.constraint = null;

      let dependency1: Dependency = new Dependency(1, 3, DependencyType.FinishFinish);
      let dependency2: Dependency = new Dependency(2, 3, DependencyType.FinishFinish);

      taskRepository = new TaskRepository([predecessor1, predecessor2, task], [dependency1, dependency2]);
      sut = new Scheduler(taskRepository);
    });

    // task move according to predecessor, FF, no constraint
    test("Successor-NoConstraint", async () => {
      task.name = "Successor-NoConstraint";
      
      const taskMoveResults: TaskMoveResult[] = await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);

      expect(taskMoveResults.length).toBe(2);
      expect(taskMoveResults[0].valid).toBe(true);
      expect(taskMoveResults[1].valid).toBe(true);
    });

    // mustStartBefore
    describe("MustStartBefore:", () => {

      // earlier than constraint date
      test("Early", async () => {
        task.name = "MustStartBefore";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(16);

        task.constraint = new Constraint(ConstraintType.MustStartBefore, constraintDate);

        const taskMoveResults: TaskMoveResult[] = await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);

        expect(taskMoveResults.length).toBe(2);
        expect(taskMoveResults[0].valid).toBe(true);
        expect(taskMoveResults[1].valid).toBe(true);
      });

      // exactly constraint
      test("Exact", async () => {
        task.name = "MustStartBefore";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(15);

        task.constraint = new Constraint(ConstraintType.MustStartBefore, constraintDate);

        // use try/catch to capture rejected promises
        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });

      // later than constraint
      test("Late", async () => {
        task.name = "MustStartBefore";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(14);

        task.constraint = new Constraint(ConstraintType.MustStartBefore, constraintDate);

        // use try/catch to capture rejected promises
        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });
    });

    // mustStartOn
    describe("MustStartOn:", () => {

      // earlier than constraint
      test("Early", async () => {
        task.name = "MustStartOn";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(16);

        task.constraint = new Constraint(ConstraintType.MustStartOn, constraintDate);

        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });

      // exact
      test("Exact", async () => {
        task.name = "MustStartOn";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(15);

        task.constraint = new Constraint(ConstraintType.MustStartOn, constraintDate);

        const taskMoveResults: TaskMoveResult[] = await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);

        expect(taskMoveResults.length).toBe(2);
        expect(taskMoveResults[0].valid).toBe(true);
        expect(taskMoveResults[1].valid).toBe(true);
      });

      // later than constraint
      test("Late", async () => {
        task.name = "MustStartOn";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(14);

        task.constraint = new Constraint(ConstraintType.MustStartOn, constraintDate);

        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });
    });

    // mustStartAfter
    describe("MustStartAfter:", () => {

      // earlier than constraint
      test("Early", async () => {
        task.name = "MustStartAfter";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(16);

        task.constraint = new Constraint(ConstraintType.MustStartAfter, constraintDate);

        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });

      // exactly constraint
      test("Exact", async () => {
        task.name = "MustStartAfter";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(15);

        task.constraint = new Constraint(ConstraintType.MustStartAfter, constraintDate);

        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });

      // later than constraint
      test("Late", async () => {
        task.name = "MustStartAfter";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(14);

        task.constraint = new Constraint(ConstraintType.MustStartAfter, constraintDate);

        const taskMoveResults: TaskMoveResult[] = await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);

        expect(taskMoveResults.length).toBe(2);
        expect(taskMoveResults[0].valid).toBe(true);
        expect(taskMoveResults[1].valid).toBe(true);
      });
    });

    // mustEndBefore
    describe("MustEndBefore:", () => {

      // earlier than constraint
      test("Early", async () => {
        task.name = "MustEndBefore";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(20);

        task.constraint = new Constraint(ConstraintType.MustEndBefore, constraintDate);

        const taskMoveResults: TaskMoveResult[] = await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);

        expect(taskMoveResults.length).toBe(2);
        expect(taskMoveResults[0].valid).toBe(true);
        expect(taskMoveResults[1].valid).toBe(true);
      });

      // exactly constraint
      test("Exact", async () => {
        task.name = "MustEndBefore";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(19);

        task.constraint = new Constraint(ConstraintType.MustEndBefore, constraintDate);

        // use try/catch to capture rejected promises
        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });

      // later than constraint
      test("Late", async () => {
        task.name = "MustEndBefore";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(18);

        task.constraint = new Constraint(ConstraintType.MustEndBefore, constraintDate);

        // use try/catch to capture rejected promises
        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });
    });

    // mustEndOn
    describe("MustEndOn:", () => {

      // earlier than constraint
      test("Early", async () => {
        task.name = "MustEndOn";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(20);

        task.constraint = new Constraint(ConstraintType.MustEndOn, constraintDate);

        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });

      // exactly constraint
      test("Exact", async () => {
        task.name = "MustEndOn";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(19);

        task.constraint = new Constraint(ConstraintType.MustEndOn, constraintDate);

        const taskMoveResults: TaskMoveResult[] = await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);

        expect(taskMoveResults.length).toBe(2);
        expect(taskMoveResults[0].valid).toBe(true);
        expect(taskMoveResults[1].valid).toBe(true);
      });

      // later than constraint
      test("Late", async () => {
        task.name = "MustEndOn";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(18);

        task.constraint = new Constraint(ConstraintType.MustEndOn, constraintDate);

        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });
    });

    // mustEndAfter
    describe("MustEndAfter:", () => {

      // earlier than constraint
      test("Early", async () => {
        task.name = "MustEndAfter";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(20);

        task.constraint = new Constraint(ConstraintType.MustEndAfter, constraintDate);

        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });

      // exactly constraint
      test("Exact", async () => {
        task.name = "MustEndAfter";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(19);

        task.constraint = new Constraint(ConstraintType.MustEndAfter, constraintDate);

        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });

      // later than constraint
      test("Late", async () => {
        task.name = "MustEndAfter";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(18);

        task.constraint = new Constraint(ConstraintType.MustEndAfter, constraintDate);

        const taskMoveResults: TaskMoveResult[] = await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);

        expect(taskMoveResults.length).toBe(2);
        expect(taskMoveResults[0].valid).toBe(true);
        expect(taskMoveResults[1].valid).toBe(true);
      });
    });
  });

  describe("Start Start:", () => {

    beforeEach(() => {
      // reset task using the specified start date which will calculate the end date, then set start to the end date.
      task.end = start;
      
      task.constraint = null;

      let dependency1: Dependency = new Dependency(1, 3, DependencyType.StartStart);
      let dependency2: Dependency = new Dependency(2, 3, DependencyType.StartStart);

      taskRepository = new TaskRepository([predecessor1, predecessor2, task], [dependency1, dependency2]);
      sut = new Scheduler(taskRepository);
    });

    // task move according to predecessor, FF, no constraint
    test("Successor-NoConstraint", async () => {
      task.name = "Successor-NoConstraint";
      
      const taskMoveResults: TaskMoveResult[] = await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);

      expect(taskMoveResults.length).toBe(2);
      expect(taskMoveResults[0].valid).toBe(true);
      expect(taskMoveResults[1].valid).toBe(true);
    });

    // mustStartBefore
    describe("MustStartBefore:", () => {

      // earlier than constraint date
      test("Early", async () => {
        task.name = "MustStartBefore";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(16);

        task.constraint = new Constraint(ConstraintType.MustStartBefore, constraintDate);

        const taskMoveResults: TaskMoveResult[] = await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);

        expect(taskMoveResults.length).toBe(2);
        expect(taskMoveResults[0].valid).toBe(true);
        expect(taskMoveResults[1].valid).toBe(true);
      });

      // exactly constraint
      test("Exact", async () => {
        task.name = "MustStartBefore";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(15);

        task.constraint = new Constraint(ConstraintType.MustStartBefore, constraintDate);

        // use try/catch to capture rejected promises
        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });

      // later than constraint
      test("Late", async () => {
        task.name = "MustStartBefore";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(14);

        task.constraint = new Constraint(ConstraintType.MustStartBefore, constraintDate);

        // use try/catch to capture rejected promises
        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });
    });

    // mustStartOn
    describe("MustStartOn:", () => {

      // earlier than constraint
      test("Early", async () => {
        task.name = "MustStartOn";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(16);

        task.constraint = new Constraint(ConstraintType.MustStartOn, constraintDate);

        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });

      // exact
      test("Exact", async () => {
        task.name = "MustStartOn";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(15);

        task.constraint = new Constraint(ConstraintType.MustStartOn, constraintDate);

        const taskMoveResults: TaskMoveResult[] = await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);

        expect(taskMoveResults.length).toBe(2);
        expect(taskMoveResults[0].valid).toBe(true);
        expect(taskMoveResults[1].valid).toBe(true);
      });

      // later than constraint
      test("Late", async () => {
        task.name = "MustStartOn";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(14);

        task.constraint = new Constraint(ConstraintType.MustStartOn, constraintDate);

        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });
    });

    // mustStartAfter
    describe("MustStartAfter:", () => {

      // earlier than constraint
      test("Early", async () => {
        task.name = "MustStartAfter";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(16);

        task.constraint = new Constraint(ConstraintType.MustStartAfter, constraintDate);

        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });

      // exactly constraint
      test("Exact", async () => {
        task.name = "MustStartAfter";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(15);

        task.constraint = new Constraint(ConstraintType.MustStartAfter, constraintDate);

        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });

      // later than constraint
      test("Late", async () => {
        task.name = "MustStartAfter";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(14);

        task.constraint = new Constraint(ConstraintType.MustStartAfter, constraintDate);

        const taskMoveResults: TaskMoveResult[] = await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);

        expect(taskMoveResults.length).toBe(2);
        expect(taskMoveResults[0].valid).toBe(true);
        expect(taskMoveResults[1].valid).toBe(true);
      });
    });

    // mustEndBefore
    describe("MustEndBefore:", () => {

      // earlier than constraint
      test("Early", async () => {
        task.name = "MustEndBefore";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(20);

        task.constraint = new Constraint(ConstraintType.MustEndBefore, constraintDate);

        const taskMoveResults: TaskMoveResult[] = await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);

        expect(taskMoveResults.length).toBe(2);
        expect(taskMoveResults[0].valid).toBe(true);
        expect(taskMoveResults[1].valid).toBe(true);
      });

      // exactly constraint
      test("Exact", async () => {
        task.name = "MustEndBefore";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(19);

        task.constraint = new Constraint(ConstraintType.MustEndBefore, constraintDate);

        // use try/catch to capture rejected promises
        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });

      // later than constraint
      test("Late", async () => {
        task.name = "MustEndBefore";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(18);

        task.constraint = new Constraint(ConstraintType.MustEndBefore, constraintDate);

        // use try/catch to capture rejected promises
        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });
    });

    // mustEndOn
    describe("MustEndOn:", () => {

      // earlier than constraint
      test("Early", async () => {
        task.name = "MustEndOn";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(20);

        task.constraint = new Constraint(ConstraintType.MustEndOn, constraintDate);

        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });

      // exactly constraint
      test("Exact", async () => {
        task.name = "MustEndOn";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(19);

        task.constraint = new Constraint(ConstraintType.MustEndOn, constraintDate);

        const taskMoveResults: TaskMoveResult[] = await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);

        expect(taskMoveResults.length).toBe(2);
        expect(taskMoveResults[0].valid).toBe(true);
        expect(taskMoveResults[1].valid).toBe(true);
      });

      // later than constraint
      test("Late", async () => {
        task.name = "MustEndOn";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(18);

        task.constraint = new Constraint(ConstraintType.MustEndOn, constraintDate);

        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });
    });

    // mustEndAfter
    describe("MustEndAfter:", () => {

      // earlier than constraint
      test("Early", async () => {
        task.name = "MustEndAfter";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(20);

        task.constraint = new Constraint(ConstraintType.MustEndAfter, constraintDate);

        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });

      // exactly constraint
      test("Exact", async () => {
        task.name = "MustEndAfter";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(19);

        task.constraint = new Constraint(ConstraintType.MustEndAfter, constraintDate);

        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });

      // later than constraint
      test("Late", async () => {
        task.name = "MustEndAfter";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(18);

        task.constraint = new Constraint(ConstraintType.MustEndAfter, constraintDate);

        const taskMoveResults: TaskMoveResult[] = await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);

        expect(taskMoveResults.length).toBe(2);
        expect(taskMoveResults[0].valid).toBe(true);
        expect(taskMoveResults[1].valid).toBe(true);
      });
    });
  });

  describe("Start Finish:", () => {

    beforeEach(() => {
      // reset task using the specified start date which will calculate the end date, then set start to the end date.
      task.start = start;
      task.constraint = null;

      let dependency1: Dependency = new Dependency(1, 3, DependencyType.StartFinish);
      let dependency2: Dependency = new Dependency(2, 3, DependencyType.StartFinish);

      taskRepository = new TaskRepository([predecessor1, predecessor2, task], [dependency1, dependency2]);
      sut = new Scheduler(taskRepository);
    });

    // task move according to predecessor, FF, no constraint
    test("Successor-NoConstraint", async () => {
      task.name = "Successor-NoConstraint";
      
      const taskMoveResults: TaskMoveResult[] = await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);

      expect(taskMoveResults.length).toBe(2);
      expect(taskMoveResults[0].valid).toBe(true);
      expect(taskMoveResults[1].valid).toBe(true);
    });

    // mustStartBefore
    describe("MustStartBefore:", () => {

      // earlier than constraint date
      test("Early", async () => {
        task.name = "MustStartBefore";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(12);

        task.constraint = new Constraint(ConstraintType.MustStartBefore, constraintDate);

        const taskMoveResults: TaskMoveResult[] = await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);

        expect(taskMoveResults.length).toBe(2);
        expect(taskMoveResults[0].valid).toBe(true);
        expect(taskMoveResults[1].valid).toBe(true);
      });

      // exactly constraint
      test("Exact", async () => {
        task.name = "MustStartBefore";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(11);

        task.constraint = new Constraint(ConstraintType.MustStartBefore, constraintDate);

        // use try/catch to capture rejected promises
        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });

      // later than constraint
      test("Late", async () => {
        task.name = "MustStartBefore";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(10);

        task.constraint = new Constraint(ConstraintType.MustStartBefore, constraintDate);

        // use try/catch to capture rejected promises
        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });
    });

    // mustStartOn
    describe("MustStartOn:", () => {

      // earlier than constraint
      test("Early", async () => {
        task.name = "MustStartOn";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(12);

        task.constraint = new Constraint(ConstraintType.MustStartOn, constraintDate);

        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });

      // exact
      test("Exact", async () => {
        task.name = "MustStartOn";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(11);

        task.constraint = new Constraint(ConstraintType.MustStartOn, constraintDate);

        const taskMoveResults: TaskMoveResult[] = await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);

        expect(taskMoveResults.length).toBe(2);
        expect(taskMoveResults[0].valid).toBe(true);
        expect(taskMoveResults[1].valid).toBe(true);
      });

      // later than constraint
      test("Late", async () => {
        task.name = "MustStartOn";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(10);

        task.constraint = new Constraint(ConstraintType.MustStartOn, constraintDate);

        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });
    });

    // mustStartAfter
    describe("MustStartAfter:", () => {

      // earlier than constraint
      test("Early", async () => {
        task.name = "MustStartAfter";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(12);

        task.constraint = new Constraint(ConstraintType.MustStartAfter, constraintDate);

        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });

      // exactly constraint
      test("Exact", async () => {
        task.name = "MustStartAfter";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(11);

        task.constraint = new Constraint(ConstraintType.MustStartAfter, constraintDate);

        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });

      // later than constraint
      test("Late", async () => {
        task.name = "MustStartAfter";
        let constraintDate: Date = new Date(task.start);
        constraintDate.setDate(10);

        task.constraint = new Constraint(ConstraintType.MustStartAfter, constraintDate);

        const taskMoveResults: TaskMoveResult[] = await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);

        expect(taskMoveResults.length).toBe(2);
        expect(taskMoveResults[0].valid).toBe(true);
        expect(taskMoveResults[1].valid).toBe(true);
      });
    });

    // mustEndBefore
    describe("MustEndBefore:", () => {

      // earlier than constraint
      test("Early", async () => {
        task.name = "MustEndBefore";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(16);

        task.constraint = new Constraint(ConstraintType.MustEndBefore, constraintDate);

        const taskMoveResults: TaskMoveResult[] = await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);

        expect(taskMoveResults.length).toBe(2);
        expect(taskMoveResults[0].valid).toBe(true);
        expect(taskMoveResults[1].valid).toBe(true);
      });

      // exactly constraint
      test("Exact", async () => {
        task.name = "MustEndBefore";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(15);

        task.constraint = new Constraint(ConstraintType.MustEndBefore, constraintDate);

        // use try/catch to capture rejected promises
        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });

      // later than constraint
      test("Late", async () => {
        task.name = "MustEndBefore";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(14);

        task.constraint = new Constraint(ConstraintType.MustEndBefore, constraintDate);

        // use try/catch to capture rejected promises
        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });
    });

    // mustEndOn
    describe("MustEndOn:", () => {

      // earlier than constraint
      test("Early", async () => {
        task.name = "MustEndOn";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(16);

        task.constraint = new Constraint(ConstraintType.MustEndOn, constraintDate);

        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });

      // exactly constraint
      test("Exact", async () => {
        task.name = "MustEndOn";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(15);

        task.constraint = new Constraint(ConstraintType.MustEndOn, constraintDate);

        const taskMoveResults: TaskMoveResult[] = await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);

        expect(taskMoveResults.length).toBe(2);
        expect(taskMoveResults[0].valid).toBe(true);
        expect(taskMoveResults[1].valid).toBe(true);
      });

      // later than constraint
      test("Late", async () => {
        task.name = "MustEndOn";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(18);

        task.constraint = new Constraint(ConstraintType.MustEndOn, constraintDate);

        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });
    });

    // mustEndAfter
    describe("MustEndAfter:", () => {

      // earlier than constraint
      test("Early", async () => {
        task.name = "MustEndAfter";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(16);

        task.constraint = new Constraint(ConstraintType.MustEndAfter, constraintDate);

        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });

      // exactly constraint
      test("Exact", async () => {
        task.name = "MustEndAfter";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(15);

        task.constraint = new Constraint(ConstraintType.MustEndAfter, constraintDate);

        try {
          await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);
        }
        // tslint:disable-next-line:one-line
        catch(taskMoveResults) {
          expect(taskMoveResults.length).toBe(2);
          expect(taskMoveResults[0].valid).toBe(false);
          expect(taskMoveResults[1].valid).toBe(true);
        }
      });

      // later than constraint
      test("Late", async () => {
        task.name = "MustEndAfter";
        let constraintDate: Date = new Date(task.end);
        constraintDate.setDate(14);

        task.constraint = new Constraint(ConstraintType.MustEndAfter, constraintDate);

        const taskMoveResults: TaskMoveResult[] = await sut.move(TaskActionSource.User, task, [new TaskMoveResult(true, predecessor1, "")]);

        expect(taskMoveResults.length).toBe(2);
        expect(taskMoveResults[0].valid).toBe(true);
        expect(taskMoveResults[1].valid).toBe(true);
      });
    });
  });
});
