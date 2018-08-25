import { StartOrEnd } from "../StartOrEnd";
export class Schedule {
    _start: Date;
    _end: Date;
    _duration: number;

    constructor(start: Date, end: Date | number);
    constructor(param1: Date, param2: Date | number, param1Type: StartOrEnd = StartOrEnd.Start) {
        if(param2 instanceof Date) {
            // set private field, setters requires two known values
            this._start = param1;
            this.end = param2;
            // this.duration = param2.getDate() - param1.getDate();
        } else {
            this._duration = param2;

            if (param1Type === StartOrEnd.End) {
                // this.end = param1;
                this.start = new Date(param1.getTime() - (this.duration * 86400 * 1000));
            } else {
                this.start = param1;
            }
        }
    }

    get start(): Date {
        return this._start;
    }

    set start(value: Date) {
        this._start = value;
        this._end = new Date(this.start.getFullYear(), this.start.getMonth(), this.start.getDate() + this.duration);
    }

    get end(): Date {
        return this._end;
    }

    set end(value: Date) {
        this._end = value;
        this._duration = (this.end.getTime() - this.start.getTime()) / (86400 * 1000);
    }

    get duration(): number {
        return this._duration;
    }

    set duration(value: number) {
        this._duration = Math.floor(value);
        this._end = new Date(this.start.getFullYear(), this.start.getMonth(), this.start.getDate() + this.duration);
    }
}