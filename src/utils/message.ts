export const toStyle = (obj: any) => {
    const keys = Object.keys(obj);
    return keys.reduce((pre, cur) => {
        return pre + `${cur}:${obj[cur]};`
    }, '')
}
type MessageType = "success" | "info" | "danger" | "feature";
const C = {
    success: {
        backgroundColor: '#F0F9EB',
        color: '#67953A',
        border: '#E7F5DF',
    },
    info: {
        backgroundColor: '#F4F4F5',
        color: '#909399',
        border: '#AAAAAA',
    },
    danger: {
        backgroundColor: '#FEF0F0',
        color: '#F56C6C',
        border: '#FDE3E3',
    },
    feature: {
        backgroundColor: '#000',
        color: '#fff',
        border: 'none',
    }
}
export const message = (type: MessageType, context: string, d = 2.5) => {
    const offset = 120;
    const duration: number = d ?? 2.5;
    const fadeDur: number = 0.8;
    const speed: number = 0;
    const position: 'top' | 'bottom' = "top";
    const style = toStyle({
        position: 'absolute',
        bottom: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        'min-width': '72px',
        height: '32px',
        'border-radius': '4px',
        'background-color': C[type].backgroundColor,
        'line-height': '32px',
        'z-index': '2008',
        color: C[type].color,
        'font-size': '14px',
        padding: '0 8px',
        border: `1px solid ${C[type].border}`,
        opacity: '0',
        'text-align': 'center'
    });

    const el = document.createElement('div');
    el.setAttribute('id', 'message');
    el.setAttribute('style', style);
    el.innerText = context;

    const body = document.body;
    const exist = document.querySelector('body > #message');
    if (exist) body.removeChild(exist);
    body.appendChild(el);
    dropIn(el, speed);

    const preToOut = setTimeout(() => {
        fadeOut(el);
        clearTimeout(preToOut);
    }, duration * 1000);

    // 掉入
    function dropIn(el: HTMLDivElement, dur: number) {
        const drop = setTimeout(() => {
            el.style.transition = dur + 's';
            el.style[position] = offset + 'px';
            el.style.opacity = '1';
            clearTimeout(drop);
        }, 1);
    }

    // 淡出
    function fadeOut(el: HTMLDivElement) {
        el.style.opacity = '0';
        const remove = setTimeout(() => {
            el?.parentNode?.removeChild(el);
            clearTimeout(remove);
        }, fadeDur * 1000 + 10);
    }
}

type NetworkMessage = 'networkError' | 'netError' | 'networkSuccess' | 'saveSuccess'

export function insertNetworkInfo(msg: NetworkMessage, state: boolean, text: string) {
    const container = document.createElement('div');
    if (msg === 'networkError') {
        container.innerHTML = `<div class="network_error_message" >
            <span style="margin-right: 10px;">${text}</span>
            <div class="loading-spinner"> <div></div></div>
        </div>`
        if (state) {
            document.body.appendChild(container)
            container.setAttribute('id', 'message1');
        } else {
            const message1 = document.getElementById('message1');
            message1?.parentNode?.removeChild(message1)
        }
    } else if (msg === 'netError') {
        container.innerHTML = `<div class="network_error_message" v-if="netError">
            <span>${text}</span>
        </div>`
        if (state) {
            document.body.appendChild(container)
            container.setAttribute('id', 'message2');
        } else {
            const message2 = document.getElementById('message2');
            message2?.parentNode?.removeChild(message2)
        }
    } else if (msg === 'networkSuccess') {
        container.innerHTML = `<div class="network_error_message" v-if="networkSuccess">
            <span>${text}</span>
        </div>`
        if (state) {
            document.body.appendChild(container)
            container.setAttribute('id', 'message3');
        } else {
            const message3 = document.getElementById('message3');
            message3?.parentNode?.removeChild(message3)
        }
    } else if (msg === 'saveSuccess') {
        container.innerHTML = `<div class="network_error_message" v-else-if="saveSuccess">
            <span>${text}</span>
        </div>`
        if (state) {
            document.body.appendChild(container)
            container.setAttribute('id', 'message4');
        } else {
            const message4 = document.getElementById('message4');
            message4?.parentNode?.removeChild(message4)
        }
    }
}