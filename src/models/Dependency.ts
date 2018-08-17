import { Task } from "./Task";
import { DependencyType } from "../DependencyType";

export class Dependency {
    // tslint:disable-next-line:no-empty
    constructor(public predecessorId: number, public successorId: number, public type: DependencyType) {
    }
}