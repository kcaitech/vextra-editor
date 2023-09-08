import { OverridesGetter, Shape } from "@kcdesign/data";
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

export function initCommonShape(props: { data: Shape, overrides?: OverridesGetter }) {
    const reflush = ref(0);
    const ret: any = {
        get reflush() {
            return reflush.value !== 0 ? reflush.value : undefined;
        },
        incReflush() {
            reflush.value++;
        }
    };
    ret.override = props.overrides?.getOverrid(props.data.id);
    // 需要watch的数据
    // 1. props的data,可能切换对象
    // 2. props的overrides,同上
    // 3. props.data,需要监听对象数据变更
    // 4. props.overrides, 同上
    // 5. override, 如果存在也要监听

    const overridesWatcher = () => {
        if (!ret.override) {
            ret.override = props.overrides?.getOverrid(props.data.id);
            if (ret.override) {
                ret.override.watch(watcher);
            }
        }
    }

    watch(() => props.overrides, (val, old) => {
        if (ret.override) {
            ret.override.unwatch(watcher);
        }
        ret.override = undefined;
        if (old) old.unwatch(overridesWatcher);
        if (val) {
            val.watch(overridesWatcher);
            ret.override = val.getOverrid(props.data.id);
            if (ret.override) {
                ret.override.watch(watcher);
            }
        }
    })

    const watcher = () => {
        reflush.value++;
    }
    watch(() => props.data, (value, old) => {
        old.unwatch(watcher);
        value.watch(watcher);
    })
    onMounted(() => {
        if (ret.override) ret.override.watch(watcher);
        if (props.overrides) props.overrides.watch(overridesWatcher);
        props.data.watch(watcher);
    })
    onUnmounted(() => {
        props.data.unwatch(watcher);
        if (ret.override) ret.override.unwatch(watcher);
        if (props.overrides) props.overrides.unwatch(overridesWatcher);
    })

    return ret;
}