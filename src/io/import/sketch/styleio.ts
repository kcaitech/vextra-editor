import { 
    Blur, 
    Border, 
    BorderOptions, 
    BorderStyle,
    Color, 
    ContextSettings, 
    Fill, 
    Gradient, 
    Shadow, 
    Stop, 
    Style} from "@kcdesign/data/data/style";
import { BlendMode, GradientType, MarkerType, WindingRule, BlurType, LineCapStyle, LineJoinStyle, FillType, BorderPosition, Point2D } from "@kcdesign/data/data/classes"
import { Basic, BasicArray } from "@kcdesign/data/data/basic";

interface IJSON {
    [key: string]: any
}

export function importColor(data: IJSON): Color {
    // if (!data)
    const alpha: number = data['alpha'] as number;
    let blue: number = data['blue'];
    let green: number = data['green'];
    let red: number = data['red'];
    blue = Math.min(Math.max(Math.round(blue * 255), 0), 255);
    green = Math.min(Math.max(Math.round(green * 255), 0), 255);
    red = Math.min(Math.max(Math.round(red * 255), 0), 255);
    return new Color(alpha, red, green, blue);
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
    return new Point2D(x, y);
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
        const stop = new Stop(position);
        stop.color = color;
        return stop;
    });
    stops.sort((a, b) => a.position == b.position ? -1 : a.position - b.position);
    return new Gradient(elipseLength, from, to, gradientType, new BasicArray<Stop>(...stops));
}

export function importStyle(data: IJSON): Style {

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
            return new Blur (
                false,
                new Point2D(0, 0), // {x: 0, y: 0},
                0,
                BlurType.Gaussian
            );
        })(data['blur']);

    const borderOptions: BorderOptions = ((d: IJSON) => {
            return new BorderOptions(
                false,
                // new BasicArray<number>(),
                LineCapStyle.Butt,
                LineJoinStyle.Miter
            )
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

        const borderStyle: BorderStyle = ((dashPattern: number[]) => {
            const bs = new BorderStyle(0, 0);
            if (dashPattern.length === 1) {
                bs.length = dashPattern[0];
                bs.gap = 0;
            } else if (dashPattern.length === 2) {
                bs.length = dashPattern[0];
                bs.gap = dashPattern[1];
            }
            return bs
        })(data['borderOptions'].dashPattern);

        const border = new Border(isEnabled, fillType, color, contextSettings, position, thickness, borderStyle);
        border.gradient = gradient;

        return border;
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

        const fill = new Fill(isEnabled, fillType, color, contextSettings);
        fill.gradient = gradient;
        return fill;
    });

    // const innerShadows: object[] = (data['innerShadows'] || []).map((d: object) => {
    //     return d;// todo
    // });
    // const shadows: object[] = (data['shadows'] || []).map((d: object) => {
    //     return d; // todo
    // });

    const style: Style = new Style(//shape, 
        endMarkerType, 
        startMarkerType, 
        miterLimit, 
        windingRule, 
        blur, 
        borderOptions, 
        new BasicArray<Border>(...borders), 
        contextSettings, 
        new BasicArray<Fill>(...fills), 
        new BasicArray<Shadow>(), 
        new BasicArray<Shadow>());

    // return makePair(style, gradients);
    return style;
}