import "ts-jest"
import { Schedule } from "../src/models/Schedule";



describe('Schedule', () => {

    test('All null values in constructor', () => {
        expect(() => {new Schedule(null, null, null)}).toThrowError("Null Argument");
    });

    test('Non-consistent values in constructor', () => {
        var today = new Date();
        var tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
                
        expect(() => {new Schedule(today, tomorrow, 2)}).toThrowError("Invalid Argument");
    });
});