let dbl_timer: any = null;
/**
 * @description 判断一定间隔内(interval)是否二次操作。可用于双击判定
 * @param interval 时间，单位为ms
 * @returns boolean
 */
export function is_dbl_action(interval?: number): boolean {
    if (dbl_timer) {
        clearTimeout(dbl_timer);
        dbl_timer = setTimeout(call, interval || 250);
        return true;
    } else {
        dbl_timer = setTimeout(call, interval || 250);
        return false;
    }

    function call() {
        clearTimeout(dbl_timer);
        dbl_timer = null;
    }
}