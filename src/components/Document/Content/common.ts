import { Shape } from "@kcdesign/data";
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