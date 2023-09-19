import { Matrix, OverrideShape, OverridesGetter, Shape, SymbolRefShape } from "@kcdesign/data";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { onBeforeRouteUpdate } from "vue-router";

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

export function initCommonShape(props: { data: Shape, overrides?: SymbolRefShape[], matrix?: Matrix }) {
    const _reflush = ref(0);
    const watcher = () => {
        _reflush.value++;
    }

    const _consumeOverride: OverrideShape[] = [];
    let _matrix: Matrix | undefined;
    const ret = {
        get reflush() {
            return _reflush.value !== 0 ? _reflush.value : undefined;
        },
        set reflush(val: number | undefined) {
            _reflush.value = val ?? 0;
        },
        get matrix() {
            return _matrix;
        },

        incReflush() {
            _reflush.value++;
        },
        updateComsumeOverride(consumeOverride: OverrideShape[]) {
            if (consumeOverride.length === 0 && _consumeOverride.length === 0) return;
            // 去重
            const added = new Set<string>();
            consumeOverride = consumeOverride.reduce((result: OverrideShape[], o) => {
                if (added.has(o.id)) return result;
                added.add(o.id);
                result.push(o);
                return result;
            }, []);

            // compare and watch
            if (consumeOverride.length < _consumeOverride.length) {
                for (let i = consumeOverride.length, len = _consumeOverride.length; i < len; i++) {
                    _consumeOverride[i].unwatch(watcher);
                }
            }

            _consumeOverride.length = consumeOverride.length; // 阶段或者扩张长度，元素可能为undefined
            for (let i = 0, len = _consumeOverride.length; i < len; i++) {
                const s0 = consumeOverride[i];
                const s = _consumeOverride[i]; // 可能undefined
                if (s && s.id == s0.id) {
                    continue;
                }
                if (s) s.unwatch(watcher);
                s0.watch(watcher);
                _consumeOverride[i] = s0;
            }
        }
    };

    const unwatchConsumeOverride = () => {
        for (let i = 0, len = _consumeOverride.length; i < len; ++i) {
            _consumeOverride[i].unwatch(watcher);
        }
        _consumeOverride.length = 0;
    }

    // 需要watch的数据
    // 1. props的data,可能切换对象
    // 2. props的overrides,同上
    // 3. props.data,需要监听对象数据变更
    // 4. props.overrides, 同上
    // 5. override, 如果存在也要监听

    // 第一个symbolref需要监听,是否有新的override
    let _symRef: SymbolRefShape | undefined;
    watch(() => props.overrides, (val, old) => {
        // unwatchConsumeOverride();
        const symRef: SymbolRefShape | undefined = val && val[0];
        if (symRef === _symRef) { // undefined
            // bouth undefined
        }
        else if (symRef === undefined || _symRef === undefined) {
            if (_symRef) _symRef.unwatch(watcher);
            _symRef = symRef;
            if (_symRef) _symRef.watch(watcher);
        }
        else if (symRef.id !== _symRef.id) {
            _symRef.unwatch(watcher);
            _symRef = symRef;
            _symRef.watch(watcher);
        }
    }, { immediate: true })

    watch(() => props.data, (value, old) => {
        old.unwatch(watcher);
        value.watch(watcher);
    })
    onMounted(() => {
        props.data.watch(watcher);
    })
    onUnmounted(() => {
        props.data.unwatch(watcher);
        unwatchConsumeOverride();
        if (_symRef) _symRef.unwatch(watcher);
    })

    const updateMatrix = () => {
        if (props.matrix) {
            const m = props.data.matrix2Parent();
            const inverse = m.inverse;
            m.multiAtLeft(props.matrix);
            m.multiAtLeft(inverse);
            _matrix = m;
        }
    }
    updateMatrix();

    onBeforeRouteUpdate(updateMatrix)

    return ret;
}

export const IMAGE_DEFAULT = 'data:image/svg+xml;base64,PHN2ZyBjbGFzcz0ic3ZnIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCiAgICA8cGF0aA0KICAgICAgICBkPSJNMTIuNSAxMGMxLjM4IDAgMi41LTEuMTIgMi41LTIuNUMxNSA2LjEyIDEzLjg4IDUgMTIuNSA1IDExLjEyIDUgMTAgNi4xMiAxMCA3LjVjMCAxLjM4IDEuMTIgMi41IDIuNSAyLjV6TTE0IDcuNWMwIC44MjgtLjY3MiAxLjUtMS41IDEuNS0uODI4IDAtMS41LS42NzItMS41LTEuNSAwLS44MjguNjcyLTEuNSAxLjUtMS41LjgyOCAwIDEuNS42NzIgMS41IDEuNXpNMTcgMUgxdjE2aDE2VjF6bS0xIDF2MTRoLTEuMjkzTDYgNy4yOTNsLTQgNFYyaDE0ek0yIDE2di0zLjI5M2w0LTRMMTMuMjkzIDE2SDJ6Ig0KICAgICAgICBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbD0iZ3JleSIgc3Ryb2tlPSJub25lIj4NCiAgICA8L3BhdGg+DQo8L3N2Zz4=';
