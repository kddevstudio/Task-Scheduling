import "ts-jest";
import { Scheduler } from "../src/Scheduler";
import { Schedule } from "../src/models/Schedule";
import { StartOrEnd } from "../src/StartOrEnd";

const sut: Scheduler = new Scheduler();

describe("Scheduler operations:", () => {
  test("move start", () => {
    var start: Date = new Date();
    var duration: number = 1;

    var newStart: Date = new Date(start);
    newStart.setDate(newStart.getDate() + duration);

    var expectedEnd: Date =  new Date(newStart);
    expectedEnd.setDate(expectedEnd.getDate() + duration);

    var schedule: Schedule = new Schedule(start, duration);

    sut.move(schedule, newStart);

    expect(schedule.start).toEqual(newStart);
    expect(schedule.duration).toEqual(duration);
    expect(schedule.end).toEqual(expectedEnd);
   });

   test("move end", () => {
    var end: Date = new Date();
    var duration: number = 1;

    var newEnd: Date = new Date(end);
    newEnd.setDate(newEnd.getDate() + duration);

    var expectedStart: Date = new Date(end);

    var schedule: Schedule = new Schedule(end, duration, StartOrEnd.End);

    sut.move(schedule, newEnd, StartOrEnd.End);

    expect(schedule.start).toEqual(expectedStart);
    expect(schedule.duration).toEqual(duration);
    expect(schedule.end).toEqual(newEnd);
   });

   test("change start", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var schedule: Schedule = new Schedule(start, end);

    var newStart: Date = new Date(2018, 8, 26);

    sut.change(schedule, newStart, StartOrEnd.Start);

    expect(schedule.start).toEqual(newStart);
    expect(schedule.duration).toEqual(2);
    expect(schedule.end).toEqual(end);
   });

   test("change end", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var schedule: Schedule = new Schedule(start, end);

    var newEnd: Date = new Date(2018, 8, 26);

    sut.change(schedule, newEnd, StartOrEnd.End);

    expect(schedule.start).toEqual(start);
    expect(schedule.duration).toEqual(10);
    expect(schedule.end).toEqual(newEnd);
   });

   test("change duration", () => {
    var start: Date = new Date(2018, 8, 16);
    var end: Date = new Date(2018, 8, 28);

    var schedule: Schedule = new Schedule(start, end);

    sut.change(schedule, 7);

    expect(schedule.start).toEqual(start);
    expect(schedule.duration).toEqual(7);
    expect(schedule.end).toEqual(new Date(2018, 8, 23));
   });
});
