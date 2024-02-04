import { Color } from "@kcdesign/data";
export type TypicaStop = {
    color: Color
    position: number
}
export interface TypicalGradient{
    gradient: string
    stops: TypicaStop[]
}

const t1 = new Color(1, 255, 255, 255);
const t2 = new Color(1, 245, 245, 245);
const t3 = new Color(1, 217, 217, 217);
const t4 = new Color(1, 191, 191, 191);
const t5 = new Color(1, 140, 140, 140);
const t6 = new Color(1, 89, 89, 89);
const t7 = new Color(1, 38, 38, 38);
const t8 = new Color(1, 0, 0, 0);
const t9 = new Color(1, 255, 235, 59);
const t10 = new Color(1, 255, 195, 0);
const t11 = new Color(1, 255, 141, 26);
const t12 = new Color(1, 255, 87, 51);
const t13 = new Color(1, 212, 48, 48);
const t14 = new Color(1, 227, 60, 100);
const t15 = new Color(1, 172, 51, 193);
const t16 = new Color(1, 121, 72, 234);
const t17 = new Color(1, 42, 130, 228);
const t18 = new Color(1, 0, 186, 173);
const t19 = new Color(1, 67, 207, 124);
const t20 = new Color(1, 165, 214, 63);

export const typical = [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14, t15, t16, t17, t18, t19, t20];

export const LABEL_RGB = ['R', 'G', 'B', 'A'];
export const LABEL_HSL = ['H', 'S', 'L', 'A'];
export const LABEL_HSB = ['H', 'S', 'B', 'A'];

export const model2label = new Map([
    ['RGB', LABEL_RGB],
    ['HSL', LABEL_HSL],
    ['HSB', LABEL_HSB]
]);

const t_g_c1 = 'linear-gradient(180deg, rgb(255, 255, 255) 0%, rgb(0, 0, 0) 100%)';
const t_g_c2 = 'linear-gradient(180deg, rgb(255, 255, 255) 0%, rgb(250, 100, 0) 17%, rgb(247, 181, 0) 33%, rgb(109, 212, 0) 50%, rgb(0, 145, 255) 66%, rgb(98, 54, 255) 83%, rgb(182, 32, 224) 100%)';
const t_g_c3 = 'linear-gradient(180deg, rgb(88, 204, 255) 0%, rgb(7, 112, 250) 100%)';
const t_g_c4 = 'linear-gradient(180deg, rgb(40, 242, 156) 0%, rgb(12, 187, 224) 100%)';
const t_g_c5 = 'linear-gradient(180deg, rgb(115, 223, 0) 0%, rgb(255, 187, 0) 100%)';
const t_g_c6 = 'linear-gradient(180deg, rgb(223, 255, 97) 0%, rgb(95, 167, 147) 100%)';
const t_g_c7 = 'linear-gradient(180deg, rgb(255, 229, 0) 0%, rgba(255, 0, 0)';
const t_g_c8 = 'linear-gradient(180deg, rgb(253, 107, 170) 0%, rgb(180, 26, 223) 100%)';
const t_g_c9 = 'linear-gradient(180deg, rgb(34, 111, 228) 0%, rgb(255, 255, 255) 100%)';
const t_g_c10 = 'linear-gradient(180deg, rgb(255, 0, 0) 0%, rgb(255, 255, 255) 100%)';

const t_g1: TypicalGradient = {
    gradient: t_g_c1,
    stops: [
        { color: new Color(1, 255, 255, 255), position: 0 },
        { color: new Color(1, 0, 0, 0), position: 1 }
    ]
}
const t_g2: TypicalGradient = {
    gradient: t_g_c2,
    stops: [
        { color: new Color(1, 224, 32, 32), position: 0 },
        { color: new Color(1, 250, 100, 0), position: 0.17 },
        { color: new Color(1, 247, 181, 0), position: 0.33},
        { color: new Color(1, 109, 212, 0), position: 0.5 },
        { color: new Color(1, 0, 145, 255), position: 0.66 },
        { color: new Color(1, 98, 54, 255), position: 0.83 },
        { color: new Color(1, 182, 32, 224), position: 1 }
    ]
}
const t_g3: TypicalGradient = {
    gradient: t_g_c3,
    stops: [
        { color: new Color(1, 88, 204, 255), position: 0 },
        { color: new Color(1, 7, 112, 250), position: 1 }
    ]
}
const t_g4: TypicalGradient = {
    gradient: t_g_c4,
    stops: [
        { color: new Color(1, 40, 242, 156), position: 0 },
        { color: new Color(1, 12, 187, 224), position: 1 }
    ]
}
const t_g5: TypicalGradient = {
    gradient: t_g_c5,
    stops: [
        { color: new Color(1, 115, 223, 0), position: 0 },
        { color: new Color(1, 255, 187, 0), position: 1 }
    ]
}
const t_g6: TypicalGradient = {
    gradient: t_g_c6,
    stops: [
        { color: new Color(1, 223, 255, 97), position: 0 },
        { color: new Color(1, 95, 167, 147), position: 1 }
    ]
}
const t_g7: TypicalGradient = {
    gradient: t_g_c7,
    stops: [
        { color: new Color(1, 255, 229, 0), position: 0 },
        { color: new Color(1, 255, 0, 0), position: 1 }
    ]
}
const t_g8: TypicalGradient = {
    gradient: t_g_c8,
    stops: [
        { color: new Color(1, 253, 107, 170), position: 0 },
        { color: new Color(1, 180, 26, 223), position: 1 }
    ]
}
const t_g9: TypicalGradient = {
    gradient: t_g_c9,
    stops: [
        { color: new Color(1, 34, 111, 228), position: 0 },
        { color: new Color(1, 255, 255, 255), position: 1 }
    ]
}
const t_g10: TypicalGradient = {
    gradient: t_g_c10,
    stops: [
        { color: new Color(1, 255, 0, 0), position: 0 },
        { color: new Color(1, 255, 255, 255), position: 1 }
    ]
}

export const typical_gradient = [t_g1, t_g2, t_g3, t_g4, t_g5, t_g6, t_g7, t_g8, t_g9, t_g10];