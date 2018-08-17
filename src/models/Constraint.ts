import { ConstraintType } from "../ConstraintType";

export class Constraint {
    constructor(public constraintType: ConstraintType, public date: Date) {
    }
}