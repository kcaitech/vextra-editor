const toStyle = (obj: any) => {
    const keys = Object.keys(obj);
    return keys.reduce((pre, cur) => {
        return pre += `${cur}:${obj[cur]};` 
    }, '')
}
type MessageType = "success" | "info" | "danger";
const C = {
    success: {
        backgroundColor: '#F0F9EB',
        color: '#67953A',
        border: '#E7F5DF',
    },
    info: {
        backgroundColor: '#F4F4F5',
        color: '#909399',
        border: '#EAEAEC',
    },
    danger: {
        backgroundColor: '#FEF0F0',
        color: '#F56C6C',
        border: '#FDE3E3',
    }
}
export const message = (type: MessageType, context: string) => {
    const top = 100;
    const duration: number = 2.5;
    const fadeDur: number = 0.5;
    const style = toStyle({
        position: 'absolute',
        top: '0px',
        left: '50%',
        transform: 'translateX(-50%)',
        'min-width': '72px',
        height: '32px',
        'border-radius': '4px',
        'background-color': C[type].backgroundColor,
        'line-height': '32px',
        'z-index': '2008',
        color: C[type].color,
        'font-size': '10px',
        padding: '0 8px',
        border: `1px solid ${C[type].border}`,
        opacity: '0'
    });

    const el = document.createElement('div');
    el.setAttribute('id', 'message');
    el.setAttribute('style', style);
    el.innerText = context;

    const body = document.body;
    const exist = document.querySelector('body > #message');
    if (exist) {
        body.removeChild(exist);
    }
    body.appendChild(el);
    dropIn(el, fadeDur);

    const preToOut = setTimeout(() => {        
        fadeOut(el);
        clearTimeout(preToOut);
    }, duration * 1000);

    // 掉入
    function dropIn(el: HTMLDivElement, dur: number) {
        const drop = setTimeout(() => {
            el.style.transition = dur + 's';
            el.style.top = top + 'px';
            el.style.opacity = '1';
            clearTimeout(drop);
        }, 1);
    }
    // 淡出
    function fadeOut(el: HTMLDivElement) {
        el.style.opacity = '0';
        const remove = setTimeout(() => {
            body.removeChild(el);
            clearTimeout(remove);
        }, fadeDur * 1000 + 10);
    }
}