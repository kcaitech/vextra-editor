import { 
    Blur, 
    Border, 
    BorderOptions, 
    Color, 
    ContextSettings, 
    Fill, 
    Gradient, 
    Stop, 
    Style} from "@/data/data/style";
import { Env } from "./envio";
import { IJSON } from "@/data/data/lzdata";
import { BlendMode, GradientType, MarkerType, WindingRule, BlurType, LineCapStyle, LineJoinStyle, FillType, BorderPosition, Point2D } from "@/data/types"

export function importColor(data: IJSON): Color {
    // if (!data)
    const alpha: number = data['alpha'] as number;
    let blue: number = data['blue'];
    let green: number = data['green'];
    let red: number = data['red'];
    blue = Math.min(Math.max(Math.round(blue * 255), 0), 255);
    green = Math.min(Math.max(Math.round(green * 255), 0), 255);
    red = Math.min(Math.max(Math.round(red * 255), 0), 255);
    return new Color(red, green, blue, alpha);
}

function importContextSettings(data: IJSON): ContextSettings {
    const blendMode: BlendMode = ((m) => {
        switch(m) {
            case 0: return BlendMode.Normal;
            default: return BlendMode.Normal;
        }
    })(data['blendMode']);
    const opacity: number = data['opacity'];
    return new ContextSettings(blendMode, opacity);
}

export function importXY(str: string): Point2D {
    const idx1 = str.indexOf('{');
    const idx2 = str.indexOf(',');
    const idx3 = str.lastIndexOf('}');
    const x: number = parseFloat(str.substring(idx1 + 1, idx2));
    const y: number = parseFloat(str.substring(idx2 + 1, idx3));
    return {x, y};
}

// function genGradientId(gradient: Gradient): string {
//     return "gradient" + objectId(gradient);
// }

function importGradient(data: IJSON): Gradient {
    const elipseLength: number = data['elipseLength'];
    const from: Point2D = importXY(data['from']);
    const gradientType: GradientType = ((t) => {
        switch(t) {
            case 0: return GradientType.Linear;
            case 1: return GradientType.Radial;
            case 2: return GradientType.Angular;
            default: return GradientType.Linear;
        }
    })(data['gradientType']);
    const to: Point2D = importXY(data['to']);
    const stops: Stop[] = (data['stops'] || []).map((d: IJSON)=> {
        let position: number = d['position'];
        if (gradientType == GradientType.Angular) {
            position = (position + 90.0 / 360.0) % 1;/* rotate 90deg */
        }
        position = Math.min(Math.max(0, position), 1);
        const color: Color = importColor(d['color']);
        return new Stop(position, color);
    });
    stops.sort((a, b) => a.position == b.position ? -1 : a.position - b.position);
    return new Gradient(elipseLength, from, gradientType, to, stops);
}

export function importStyle(env:Env, data: IJSON): Style {

    // const gradients = env.gradients;

    const endMarkerType: MarkerType = ((t: number) => {
            switch(t) {
                case 0: return MarkerType.OpenArrow;
                default: return MarkerType.OpenArrow;
            }
        })(data['endMarkerType']);
    const miterLimit: number = data['miterLimit'];
    const startMarkerType: MarkerType = ((t: number) => {
            switch(t) {
                case 0: return MarkerType.OpenArrow;
                default: return MarkerType.OpenArrow;
            }
        })(data['startMarkerType']);
    const windingRule: WindingRule = ((t: number) => {
        switch(t) {
            case 0: return WindingRule.NonZero;
            case 1: return WindingRule.EvenOdd;
            default: return WindingRule.NonZero;
        }
    })(data['windingRule']);

    const blur: Blur = ((d) => {
            return {
                isEnabled: false,
                center: {x: 0, y: 0},
                saturation: 0,
                type: BlurType.Gaussian
            };
        })(data['blur']);

    const borderOptions: BorderOptions = ((d: IJSON) => {
            return {
                isEnabled: false,
                dashPattern: [],
                lineCapStyle: LineCapStyle.Butt,
                lineJoinStyle: LineJoinStyle.Miter
            }
        })(data['borderOptions']);

    const borders: Border[] = (data['borders'] || []).map((d: IJSON) => {
        const isEnabled: boolean = d['isEnabled'];
        const fillType: FillType = ((t) => {
                switch(t) {
                    case 0: return FillType.SolidColor;
                    case 1: return FillType.Gradient;
                    case 2: return FillType.Pattern;
                    default: return FillType.SolidColor;
                }
            })(d['fillType']);
        const color: Color = importColor(d['color']);

        const contextSettings: ContextSettings = importContextSettings(d['contextSettings']);
        let gradient;
        // let gradientType;
        if (fillType == FillType.Gradient && d['gradient']) {
            gradient = importGradient(d['gradient']);
            // gradientType = gradient.gradientType;
            // gradientId = genGradientId(gradient);
            // gradients.set(gradientId, gradient);
        }

        const position: BorderPosition = ((p: number) => {
            switch(p) {
                case 0: return BorderPosition.Center;
                case 1: return BorderPosition.Inner;
                case 2: return BorderPosition.Outer;
                default: return BorderPosition.Center;
            }
        })(d['position']);

        const thickness: number = d['thickness'];

        return new Border(isEnabled, fillType, color, contextSettings, position, thickness, gradient);
    });

    const contextSettings: ContextSettings = importContextSettings(data['contextSettings']);
    const fills: Fill[] = (data['fills'] || []).map((d: IJSON) => {
        const isEnabled: boolean = d['isEnabled'];
        const fillType = ((t) => {
            switch(t) {
                case 0: return FillType.SolidColor;
                case 1: return FillType.Gradient;
                case 2: return FillType.Pattern;
                default: return FillType.SolidColor;
            }
        })(d['fillType']);
        const color: Color = importColor(d['color']);
        const contextSettings: ContextSettings = importContextSettings(d['contextSettings']);

        let gradient;
        // let gradientType;
        if (fillType == FillType.Gradient && d['gradient']) {
            gradient = importGradient(d['gradient']);
            // gradientType = gradient.gradientType;
            // gradientId = genGradientId(gradient);
            // gradients.set(gradientId, gradient);
        }

        return new Fill(isEnabled, fillType, color, contextSettings, gradient);
    });

    // const innerShadows: object[] = (data['innerShadows'] || []).map((d: object) => {
    //     return d;// todo
    // });
    // const shadows: object[] = (data['shadows'] || []).map((d: object) => {
    //     return d; // todo
    // });

    const style: Style = new Style(//shape, 
        endMarkerType, 
        miterLimit, 
        startMarkerType, 
        windingRule, 
        blur, 
        borderOptions, 
        borders, 
        contextSettings, 
        fills, 
        [], 
        []);

    // return makePair(style, gradients);
    return style;
}