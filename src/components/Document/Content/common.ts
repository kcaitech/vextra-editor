import { Shape, SymbolRefShape, SymbolShape } from "@kcdesign/data";
import { onMounted, onUnmounted, ref, watch } from "vue";

export function initCommonShape(props: { data: Shape, varsContainer?: (SymbolRefShape | SymbolShape)[] }, updater?: (...args: any[]) => void) {
    const _reflush = ref(0);

    const watcher = (...args: any[]) => {
        _reflush.value++;
        if (updater) updater(...args);
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
        if (props.varsContainer) props.varsContainer.forEach((v) => v.unwatch(watcher));
    })

    return ret;
}

export const IMAGE_DEFAULT = 'data:image/svg+xml;base64,PHN2ZyBjbGFzcz0ic3ZnIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCiAgICA8cGF0aA0KICAgICAgICBkPSJNMTIuNSAxMGMxLjM4IDAgMi41LTEuMTIgMi41LTIuNUMxNSA2LjEyIDEzLjg4IDUgMTIuNSA1IDExLjEyIDUgMTAgNi4xMiAxMCA3LjVjMCAxLjM4IDEuMTIgMi41IDIuNSAyLjV6TTE0IDcuNWMwIC44MjgtLjY3MiAxLjUtMS41IDEuNS0uODI4IDAtMS41LS42NzItMS41LTEuNSAwLS44MjguNjcyLTEuNSAxLjUtMS41LjgyOCAwIDEuNS42NzIgMS41IDEuNXpNMTcgMUgxdjE2aDE2VjF6bS0xIDF2MTRoLTEuMjkzTDYgNy4yOTNsLTQgNFYyaDE0ek0yIDE2di0zLjI5M2w0LTRMMTMuMjkzIDE2SDJ6Ig0KICAgICAgICBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbD0iZ3JleSIgc3Ryb2tlPSJub25lIj4NCiAgICA8L3BhdGg+DQo8L3N2Zz4=';
