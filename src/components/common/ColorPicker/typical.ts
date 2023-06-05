import { Color } from "@kcdesign/data";

const t1 = new Color(1, 255, 255, 255);
const t2 = new Color(1, 0, 0, 0);
const t3 = new Color(1, 231, 230, 230);
const t4 = new Color(1, 68, 84, 106);
const t5 = new Color(1, 91, 155, 213);
const t6 = new Color(1, 237, 125, 49);
const t7 = new Color(1, 165, 165, 165);
const t8 = new Color(1, 255, 192, 0);
const t9 = new Color(1, 68, 114, 196);
const t10 = new Color(1, 112, 173, 71);

export const typical = [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10];

export const LABEL_RGB = ['R', 'G', 'B', 'A'];
export const LABEL_HSL = ['H', 'S', 'L', 'A'];
export const LABEL_HSB = ['H', 'S', 'B', 'A'];

export const model2label = new Map([
    ['RGB', LABEL_RGB],
    ['HSL', LABEL_HSL],
    ['HSB', LABEL_HSB]
]);
