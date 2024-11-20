import { PathShapeView, CurvePoint } from "@kcdesign/data";
import { Context } from "@/context";

interface ClipResult {
    originSegmentIndex: number;
    segments: CurvePoint[][];
}

/**
 * @description 切割路径
 */
export class PathClipper {
    private readonly context: Context;
    private view: PathShapeView;

    constructor(context: Context, view: PathShapeView) {
        this.context = context;
        this.view = view;
    }

    private disconnect(slices: CurvePoint[][], sides: number[], points: CurvePoint[], closed: boolean) {
        points = points.slice(0);
        sides = sides.sort((a, b) => b - a);
        for (let i = 0; i < sides.length; i++) {
            const index = sides[i];
            if (closed) {
                closed = false;
                continue;
            }
            const last = sides[i - 1];
            if (last) {
                if (index === last - 1) {
                    points.pop();
                    continue;
                }
            } else {
                if (index === points.length - 1) {
                    points.pop();
                    continue;
                }
            }
            const next = index + 1;
            slices.unshift(points.splice(next, points.length - next));
        }
        slices.unshift(points);
    }

    private del(slices: CurvePoint[][], indexes: number[], points: CurvePoint[]) {
        const idSet = new Set<string>();
        for (const index of indexes) idSet.add(points[index].id);
        for (let j = slices.length - 1; j > -1; j--) {
            const slice = slices[j];
            for (let i = slice.length - 1; i > -1; i--) {
                if (idSet.has(slice[i].id)) slice.splice(i, 1);
            }
            if (!slices.length) slices.splice(j, 1);
        }
    }

    clip() {
        const path = this.context.path;
        const segments = this.view.segments;
        const sides = path.selectedSides;
        const points = path.selectedPoints;
        const result: ClipResult[] = [];
        if (!(sides.size || points.size)) return result;
        const affected = Array.from(new Set([...Array.from(sides.keys()), ...Array.from(points.keys())])).sort((a, b) => b - a);
        for (const index of affected) {
            const segment = segments[index];
            const slices: CurvePoint[][] = [];
            const _sides = sides.get(index);
            if (_sides) this.disconnect(slices, _sides, segment.points as CurvePoint[], segment.isClosed);
            const _points = points.get(index);
            if (_points) this.del(slices, _points, segment.points as CurvePoint[]);
            result.push({originSegmentIndex: index, segments: slices});
        }
        return result;
    }
}