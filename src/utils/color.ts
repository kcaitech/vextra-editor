export const Reg_HEX = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/;

export function toRGBA(options: {
    red: number,
    green: number,
    blue: number,
    alpha: number
}): string {
    return "rgba(" + options.red + "," + options.green + "," + options.blue + "," + options.alpha + ")";
}

export function toRGB(options: {
    red: number,
    green: number,
    blue: number,
    alpha: number
}): string {
    return "rgb(" + options.red + "," + options.green + "," + options.blue + ")";
}

export function toHex(options: {
    red: number,
    green: number,
    blue: number,
    alpha: number
}): string {
    const toHex = (n: number) => {
        return n.toString(16).toUpperCase().length === 1 ? `0${n.toString(16).toUpperCase()}` : n.toString(16).toUpperCase();
    }
    return "#" + toHex(options.red) + toHex(options.green) + toHex(options.blue);
}

export function getRandomColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16);
  }