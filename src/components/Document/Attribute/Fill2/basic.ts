import { Reg_HEX } from "@/utils/RegExp";

export function selectAllOnFocus(event: FocusEvent) {
    event.target instanceof HTMLInputElement && event.target.value && event.target.select();
}

export function getRGBFromInputEvent(event: Event) {
    const target = event.target as HTMLInputElement;
    let value = target.value.replace('#', '');
    const hexColorRegex = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
    if (!hexColorRegex.test(value)) return null;
    if (value.length === 3) value = value.split('').map(i => '' + i + i).join('');
    const res = value.match(Reg_HEX);
    if (!res) return res;

    return [
        Number.parseInt(res[1], 16),
        Number.parseInt(res[2], 16),
        Number.parseInt(res[3], 16)
    ]
}

export function getNumberFromInputEvent(event: Event) {
    const target = event.target as HTMLInputElement;
    const regex = /\d+(\.\d+)?/g;
    return Number((target.value.match(regex) || [])[0]);
}