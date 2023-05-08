
export function process(content: { x: number, y: number, bottom: number, right: number }, event: MouseEvent) {
    let dx = 0, dy = 0;
    const { clientX, clientY } = event;
    const step = 3;
    if (clientX < content.x) {
        dx = step;
    }
    if (clientX > content.right) {
        dx = -step;
    }
    if (clientY < content.y) {
        dy = step;
    }
    if (clientY > content.bottom) {
        dy = -step;
    }
    return { dx, dy }
}