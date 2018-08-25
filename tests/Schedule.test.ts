import "ts-jest";
import { Schedule } from "../src/models/Schedule";

const start: Date = new Date(2018, 7, 7);
const duration: number = 7;
const end: Date = new Date(2018, 7, 14);
const schedule: Schedule = new Schedule(start, duration);

describe("Schedule properties:", () => {

    beforeEach(() => {
      // reset schedule
      schedule.start = start;
      schedule.duration = duration;
    });

  test("change start", () => {
    var newStart: Date = new Date(2018, 7, 14);

    schedule.start = newStart;

    expect(schedule.duration).toEqual(7);
    expect(schedule.end).toEqual(new Date(2018, 7, 21));
  });

  test("change end", () => {
    var newEnd: Date = new Date(2018, 7, 21);

    schedule.end = newEnd;

    expect(schedule.duration).toEqual(14);
    expect(schedule.start).toEqual(start);
  });

  test("change duration", () => {
    let newDuration: number = 14;

    schedule.duration = newDuration;

    expect(schedule.start).toEqual(start);
    expect(schedule.end).toEqual(new Date(2018, 7, 21));
  });

});