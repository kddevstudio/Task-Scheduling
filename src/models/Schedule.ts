export class Schedule{
    constructor(start: Date | null, end: Date | null, duration: Number | null){
        // check that there are at least two properties available
        let nullArgCount = 0;

        if(start == null) {
            nullArgCount++;
        }        

        if(end == null) {
            nullArgCount++;
        }

        if(duration == null) {
            nullArgCount++;
        }

        if(nullArgCount>1){
            throw Error("Null Argument");
        }
    
        if(start && end && duration){
            // check values are congruent
            if(duration !== (end.getTime() - start.getTime()) / (864000 * 1000)){
                throw Error("Invalid Argument")
            }
        }
    }
}