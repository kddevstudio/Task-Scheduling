import "ts-jest";
import { Schedule } from "../src/models/Schedule";

const start: Date = new Date(2018, 7, 7);
const duration: number = 4;
const end: Date = new Date(2018, 7, 11);
const schedule: Schedule = new Schedule(start, duration);

describe("Schedule properties:", () => {

    beforeEach(() => {
      // reset schedule
      schedule.start = start;
      schedule.duration = duration;
    });

  test("change start", () => {
    var newStart: Date = new Date(2018, 7, 11);

    schedule.start = newStart;

    expect(schedule.duration).toEqual(4);
    expect(schedule.end).toEqual(new Date(2018, 7, 15));
  });

  test("change end", () => {
    var newEnd: Date = new Date(2018, 7, 15);

    schedule.end = newEnd;

    expect(schedule.duration).toEqual(8);
    expect(schedule.start).toEqual(start);
  });

  test("change end before start", () => {
    var newEnd: Date = new Date(2018, 7, 6);

    schedule.end = newEnd;

    expect(schedule.duration).toEqual(4);
    expect(schedule.start).toEqual(new Date(2018, 7, 2));
  });

  test("change duration", () => {
    let newDuration: number = 8;

    schedule.duration = newDuration;

    expect(schedule.start).toEqual(start);
    expect(schedule.end).toEqual(new Date(2018, 7, 15));
  });

});