import { StartOrEnd } from "../StartOrEnd";
export class Schedule {
    start: Date;
    end: Date;
    duration: number;

    constructor(start: Date, end: Date | number);
    constructor(param1: Date, param2: Date | number, param2Type?: StartOrEnd )
    constructor(param1: Date, param2: Date | number, param2Type?: StartOrEnd ) {
        if(param2 instanceof Date) {
            this.start = param1;
            this.end = param2;
            this.duration = param2.getDate() - param1.getDate();
        } else {
            this.duration = param2;

            if (param2Type === StartOrEnd.End) {
                this.end = param1;
                this.start = new Date(this.end);
                this.start.setDate(this.end.getDate() - this.duration);
            } else {
                this.start = param1;
                this.end = new Date(this.start);
                this.end.setDate(this.start.getDate() + this.duration);
            }
        }
    }
}