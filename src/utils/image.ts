export function get_frame(file: any) {
  const frame: { width: number, height: number } = { width: 100, height: 100 };
  const img = new Image();
  img.onload = function () {
    frame.width = img.width;
    frame.height = img.height;
  }
  img.src = URL.createObjectURL(file);
  return frame;
}