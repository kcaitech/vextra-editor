import { v4 as uuid } from "uuid";

export enum CursorType {
    Auto = 'auto',
    Rotate = 'rotate',
    Scale = 'scale',
    Create = 'create',
    Extend = 'extend',
    Text = 'text',
    Grab = 'grab',
    Grabbing = 'grabbing',
    Pen = 'pen'
}

export class CursorPicker {
    // 默认
    static DEFAULT = "data:image/svg+xml,<svg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'><g filter='url(%23filter0_d_228_9)'><path d='M4 4L22 13.7915L13.8602 17.0198L6.9689 23.8229L4 4Z' fill='black'/><path d='M7.49207 22.2525L4.96484 5.37863L20.2345 13.6849L13.5837 16.3227L13.4419 16.3789L13.3333 16.4861L7.49207 22.2525Z' stroke='white' stroke-width='1.5'/></g><defs><filter id='filter0_d_228_9' x='2' y='2' width='22' height='23.8229' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'><feFlood flood-opacity='0' result='BackgroundImageFix'/><feColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/><feOffset/><feGaussianBlur stdDeviation='1'/><feComposite in2='hardAlpha' operator='out'/><feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0'/><feBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_228_9'/><feBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_228_9' result='shape'/></filter></defs></svg>";
    // 旋转
    static ROTATE_SLICE = [
        "data:image/svg+xml,<svg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'><path transform='rotate(",
        " 16 16)' d='M16.5637 8.0354L17.6298 6.86873L12.6552 6.85108L13.1195 11.8048L14.1115 10.7192L14.4785 10.3175L14.8478 10.717C15.4106 11.3259 15.8724 12.0233 16.2142 12.7833C16.6525 13.7578 16.8843 14.8141 16.8953 15.8863C16.9063 16.9584 16.6965 18.0233 16.2791 19.0147C15.8961 19.9247 15.3457 20.755 14.6577 21.4624L14.2863 21.8442L13.9287 21.4494L13.097 20.5313L12.558 25.4933L17.5375 25.4336L16.3393 24.1107L16.0178 23.7558L16.3586 23.4193C17.3488 22.4415 18.1369 21.2778 18.6764 19.9961C19.2341 18.6713 19.5142 17.2491 19.4994 15.8184C19.4847 14.3877 19.1755 12.9792 18.5915 11.6808C18.0969 10.5811 17.4141 9.5803 16.5753 8.72219L16.245 8.38426L16.5637 8.0354Z' fill='black' stroke='white'/></svg>"
    ];
    // 缩放
    static SCALE_SLICE = [
        "data:image/svg+xml,<svg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'><g transform='rotate(",
        " 16 16)' filter='url(%23filter0_d_228_4)'><path d='M6 15.9457L11.0993 11L11.0993 14.9102C14.6991 14.8571 17.6198 14.9633 21.2196 14.9102V11L26 15.9457L21.2196 20.6683V17.3293H11.1544L11.0993 20.6683L6 15.9457Z' fill='black'/><path d='M10.7141 19.7664L6.58144 15.939L10.6993 11.9452L10.6993 14.9102L10.6993 15.3161L11.1052 15.3102C12.8999 15.2837 14.5257 15.2969 16.1562 15.3102L16.1579 15.3102C17.7871 15.3235 19.421 15.3368 21.2255 15.3102L21.6196 15.3043V14.9102V11.9894L25.4374 15.9392L21.6196 19.7109V17.3293V16.9293H21.2196H11.1544H10.761L10.7545 17.3227L10.7141 19.7664Z' stroke='white' stroke-width='0.8'/></g><defs><filter id='filter0_d_228_4' x='4' y='9' width='24' height='13.6683' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'><feFlood flood-opacity='0' result='BackgroundImageFix'/><feColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/><feOffset/><feGaussianBlur stdDeviation='1'/><feComposite in2='hardAlpha' operator='out'/><feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0'/><feBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_228_4'/><feBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_228_4' result='shape'/></filter></defs></svg>"
    ]
    // 创建
    static CREATE = "data:image/svg+xml,<svg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'><g filter='url(%23filter0_d_228_8)'><path d='M14.0909 17.3636V25H17.9091V17.3636H25V13.5455H17.9091V7H14.0909V13.5455H7V17.3636H14.0909Z' fill='black'/><path d='M17.4091 17.3636V24.5H14.5909V17.3636V16.8636H14.0909H7.5V14.0455H14.0909H14.5909V13.5455V7.5H17.4091V13.5455V14.0455H17.9091H24.5V16.8636H17.9091H17.4091V17.3636Z' stroke='white'/></g><defs><filter id='filter0_d_228_8' x='3' y='3' width='26' height='26' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'><feFlood flood-opacity='0' result='BackgroundImageFix'/><feColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/><feOffset/><feGaussianBlur stdDeviation='2'/><feComposite in2='hardAlpha' operator='out'/><feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0'/><feBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_228_8'/><feBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_228_8' result='shape'/></filter></defs></svg>"
    // 扩展
    static EXTEND = "data:image/svg+xml,<svg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'><g filter='url(%23filter0_d_228_7)'><path d='M20.9098 11.0302L15.8939 6L11.2424 11.1643L14.5819 11.1731L14.6343 14.9508C13.4995 14.9443 12.3397 14.9437 11.0993 14.962L11.0993 11.0518L6 15.9975L11.0993 20.7201L11.1544 17.3811H14.668L14.7215 21.2374L11.3827 21.2837L16.1712 25.9981L21.0501 21.1496L17.1403 21.2038C17.1018 19.8585 17.0869 18.6079 17.0779 17.3811H21.2196V20.7201L26 15.9975L21.2196 11.0518V14.962C19.7518 14.9836 18.3969 14.9788 17.0628 14.9691C17.0539 13.7224 17.0391 12.4523 17 11.0844L20.9098 11.0302Z' fill='black'/><path d='M15.9087 6.58129L19.9592 10.6433L16.9944 10.6845L16.5885 10.6901L16.6001 11.0959C16.6392 12.4596 16.6539 13.7264 16.6629 14.9719L16.6657 15.3662L17.0599 15.3691C18.3949 15.3788 19.7533 15.3836 21.2255 15.3619L21.6196 15.3561V14.962V12.0412L25.4374 15.991L21.6196 19.7627V17.3811V16.9811H21.2196H17.0779H16.6749L16.6779 17.384C16.6869 18.612 16.7018 19.8659 16.7405 21.2153L16.7517 21.6092L17.1459 21.6038L20.0664 21.5633L16.1699 25.4355L12.3456 21.6703L14.727 21.6373L15.127 21.6318L15.1214 21.2318L15.0679 17.3755L15.0625 16.9811H14.668H11.1544H10.761L10.7545 17.3745L10.7141 19.8182L6.58144 15.9908L10.6993 11.997L10.6993 14.962V15.3679L11.1052 15.3619C12.3418 15.3437 13.4986 15.3443 14.632 15.3508L15.0399 15.3531L15.0342 14.9452L14.9818 11.1676L14.9764 10.7742L14.5829 10.7731L12.1389 10.7666L15.9087 6.58129Z' stroke='white' stroke-width='0.8'/></g><defs><filter id='filter0_d_228_7' x='2' y='2' width='28' height='27.9981' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'><feFlood flood-opacity='0' result='BackgroundImageFix'/><feColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/><feOffset/><feGaussianBlur stdDeviation='2'/><feComposite in2='hardAlpha' operator='out'/><feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0'/><feBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_228_7'/><feBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_228_7' result='shape'/></filter></defs></svg>"

    // 动态光标类型
    static DYNAMIC = [CursorType.Rotate, CursorType.Scale];

    private m_style: HTMLStyleElement;
    private m_class_map: Map<string, string> = new Map();
    private m_salt = '';

    constructor() {
        this.m_style = document.createElement('style');
        this.m_style.id = 'cursor-sheet';

        this.m_salt = uuid().split('-').pop() || 'cursor';

        this.createClass(CursorType.Auto, 0);

        document.querySelector('head')!.appendChild(this.m_style);
    }

    getHot(type: CursorType): [number, number] {
        if (type === CursorType.Auto) {
            return [0, 0];
        } else {
            return [16, 16];
        }
    }

    getSource(type: CursorType): string | string[] {
        switch (type) {
            case CursorType.Auto:
                return CursorPicker.DEFAULT;
            case CursorType.Create:
                return CursorPicker.CREATE;
            case CursorType.Scale:
                return CursorPicker.SCALE_SLICE;
            case CursorType.Rotate:
                return CursorPicker.ROTATE_SLICE;
            case CursorType.Extend:
                return CursorPicker.EXTEND;
            default:
                return CursorPicker.DEFAULT;
        }
    }

    createClass(type: CursorType, degree: number) {
        const _source = this.getSource(type);

        const className = `${type}-${degree}-${this.m_salt}`
        let classStr = `.${className} {`

        let url;
        const dynamic = CursorPicker.DYNAMIC.includes(type);
        if (dynamic) {
            const source = _source as string[];
            url = source[0] + degree + source[1];
        } else {
            url = _source;
        }

        if (type === CursorType.Auto) {
            classStr += `cursor: url("${url}") 4 4, auto !important;`
        } else if (type === CursorType.Grab) {
            classStr += `cursor: grab !important;`
        } else if (type === CursorType.Grabbing) {
            classStr += `cursor: grabbing !important;`
        } else if (type === CursorType.Text) {
            classStr += 'cursor: text !important;'
        } else {
            classStr += `cursor: url("${url}") 16 16, auto !important;`
        }

        classStr += '}';

        this.m_class_map.set(`${type}-${degree}`, className);

        this.m_style.innerText += classStr;
    }

    getClass(type: CursorType, degree: number) {
        // 抽帧
        degree = this.findNearestMultipleOf(degree);

        const name = `${type}-${degree}`;

        // 已有的
        const fromMap = this.m_class_map.get(name);
        if (fromMap) {
            return fromMap;
        }

        // 创建新的
        this.createClass(type, degree);

        return `${type}-${degree}-${this.m_salt}`;
    }

    remove() {
        this.m_style.remove()
    }

    findNearestMultipleOf(num: number, step = 3): number {
        if (num < 0) {
            num = num + 360;
        }

        let closest = Math.round(num / step) * step;
        if (closest < num) {
            closest += step;
        }

        return closest;
    }
}