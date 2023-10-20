import { Shape, SymbolRefShape, SymbolShape, Variable } from "@kcdesign/data";
import { onMounted, onUnmounted, ref, watch } from "vue";

export function makeReflush(props: { data: Shape }) {
    const reflush = ref(0);

    const watcher = () => {
        reflush.value++;
    }
    const stopWatch = watch(() => props.data, (value, old) => {
        old.unwatch(watcher);
        value.watch(watcher);
    })
    onMounted(() => {
        props.data.watch(watcher);
    })
    onUnmounted(() => {
        props.data.unwatch(watcher);
        stopWatch();
    })

    return reflush;
}


export interface VarWatcher {
    __var_onwatch: Map<string, Variable[]>,
    __has_var_notify: any,
    _var_watcher(...args: any[]): void,
    _watch_vars(slot: string, vars: Variable[]): void
    _var_on_removed(): void;
}

export function makeVarWatcher(obj: any): VarWatcher {
    obj.__var_onwatch = new Map<string, Variable[]>(); // 设置了watcher的变量
    obj.__has_var_notify = undefined;
    obj._var_watcher = (...args: any[]) => {
        if (!obj.__has_var_notify) {
            obj.__has_var_notify = setTimeout(() => {
                if (obj.__has_var_notify) obj.notify()
                obj.__has_var_notify = undefined;
            }, 0);
        }
    }

    obj._watch_vars = (slot: string, vars: Variable[]) => {
        const old = obj.__var_onwatch.get(slot);
        if (!old) {
            vars.forEach((v) => v.watch(obj._var_watcher));
            obj.__var_onwatch.set(slot, vars);
            return;
        }
        if (old.length > vars.length) {
            for (let i = vars.length, len = old.length; i < len; ++i) {
                const v = old[i];
                v.unwatch(obj._var_watcher);
            }
        }
        old.length = vars.length;
        for (let i = 0, len = old.length; i < len; ++i) {
            const o = old[i];
            const v = vars[i];
            if (o && o.id === v.id) continue;
            if (o) o.unwatch(obj._var_watcher);
            v.watch(obj._var_watcher);
            old[i] = v;
        }
    }
    obj._var_on_removed = () => {
        obj.__var_onwatch.forEach((v: Variable[]) => {
            v.forEach((v) => v.unwatch(obj._var_watcher));
        })
        obj.__var_onwatch.clear();
        obj.__has_var_notify = undefined;
    }
    return obj;
}

export function initCommonShape(props: { data: Shape, varsContainer?: (SymbolRefShape | SymbolShape)[] }, updater?: () => void) {
    const _reflush = ref(0);
    const __var_onwatch = new Map<string, Variable[]>();

    const watcher = () => {
        _reflush.value++;
        if (updater) updater();
    }

    const _watch_vars = (slot: string, vars: Variable[]) => {
        const old = __var_onwatch.get(slot);
        if (!old) {
            vars.forEach((v) => v.watch(watcher));
            __var_onwatch.set(slot, vars);
            return;
        }
        if (old.length > vars.length) {
            for (let i = vars.length, len = old.length; i < len; ++i) {
                const v = old[i];
                v.unwatch(watcher);
            }
        }
        old.length = vars.length;
        for (let i = 0, len = old.length; i < len; ++i) {
            const o = old[i];
            const v = vars[i];
            if (o && o.id === v.id) continue;
            if (o) o.unwatch(watcher);
            v.watch(watcher);
            old[i] = v;
        }
    }
    const _var_on_removed = () => {
        __var_onwatch.forEach((v: Variable[]) => {
            v.forEach((v) => v.unwatch(watcher));
        })
        __var_onwatch.clear();
    }

    const ret = {
        get reflush() {
            return _reflush.value !== 0 ? _reflush.value : undefined;
        },
        set reflush(val: number | undefined) {
            _reflush.value = val ?? 0;
        },
        incReflush() {
            _reflush.value++;
        },
        watchVars(consumedVars: { slot: string, vars: Variable[] }[]) {
            for (let i = 0, len = consumedVars.length; i < len; ++i) {
                const _vi = consumedVars[i];
                _watch_vars(_vi.slot, _vi.vars);
            }
        }
    };

    // watch varsContainer
    watch(() => props.varsContainer, (value, old) => {
        old?.forEach((v) => v.unwatch(watcher));
        value?.forEach((v) => v.watch(watcher));
        if (updater) updater();
    })

    watch(() => props.data, (value, old) => {
        old.unwatch(watcher);
        value.watch(watcher);
        if (updater) updater();
    })
    onMounted(() => {
        props.data.watch(watcher);
        if (props.varsContainer) props.varsContainer.forEach((v) => v.watch(watcher));
    })
    onUnmounted(() => {
        props.data.unwatch(watcher);
        _var_on_removed();
        if (props.varsContainer) props.varsContainer.forEach((v) => v.unwatch(watcher));
    })

    return ret;
}

export const IMAGE_DEFAULT = 'data:image/svg+xml;base64,PHN2ZyBjbGFzcz0ic3ZnIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCiAgICA8cGF0aA0KICAgICAgICBkPSJNMTIuNSAxMGMxLjM4IDAgMi41LTEuMTIgMi41LTIuNUMxNSA2LjEyIDEzLjg4IDUgMTIuNSA1IDExLjEyIDUgMTAgNi4xMiAxMCA3LjVjMCAxLjM4IDEuMTIgMi41IDIuNSAyLjV6TTE0IDcuNWMwIC44MjgtLjY3MiAxLjUtMS41IDEuNS0uODI4IDAtMS41LS42NzItMS41LTEuNSAwLS44MjguNjcyLTEuNSAxLjUtMS41LjgyOCAwIDEuNS42NzIgMS41IDEuNXpNMTcgMUgxdjE2aDE2VjF6bS0xIDF2MTRoLTEuMjkzTDYgNy4yOTNsLTQgNFYyaDE0ek0yIDE2di0zLjI5M2w0LTRMMTMuMjkzIDE2SDJ6Ig0KICAgICAgICBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbD0iZ3JleSIgc3Ryb2tlPSJub25lIj4NCiAgICA8L3BhdGg+DQo8L3N2Zz4=';
