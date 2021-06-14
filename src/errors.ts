export class NotImplementedError extends Error {
    constructor() {
        super("Not Implemented!");
        this.name = "NotImplementedError";
    }
}