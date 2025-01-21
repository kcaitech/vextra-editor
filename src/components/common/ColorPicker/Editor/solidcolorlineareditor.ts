export type RGBACatch = {
    R: number;
    G: number;
    B: number;
    A: number;
    position: number;
}
export class SolidColorLinearEditor {
    constructor(private RGBA: RGBACatch) {}

    start() {}
    modify() {}
    end() {}
}