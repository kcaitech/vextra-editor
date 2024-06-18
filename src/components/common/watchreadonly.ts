import { Context } from "@/context";
import { onMounted, onUnmounted, ref } from "vue";
import { events } from "@/context/events"

export function watchReadyonly(context: Context, cb?: (readonly: boolean) => void) {
    const _ro = ref<boolean>(context.readonly);
    let rm: (() => void) | undefined;

    onMounted(() => {
        if (_ro.value !== context.readonly) {
            _ro.value = context.readonly;
            if (cb) cb(_ro.value);
        }
        rm = context.watch((event: string, readonly: boolean) => {
            if (event !== events.context_readonly_change) return;
            _ro.value = readonly;
            if (cb) cb(readonly);
        })
    })
    onUnmounted(() => {
        if (rm) rm();
        rm = undefined;
    })
    return _ro;
}