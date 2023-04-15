/*
 * @Author: Zrx georgezrx@163.com
 * @Date: 2023-02-28 10:54:18
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-03-02 11:21:02
 * @FilePath: \kcdesign\src\utils\index.ts
 */
function getAngle(line1: [number, number, number, number], line2: [number, number, number, number]): number {
    // 计算两条线的斜率
    const slope1 = (line1[3] - line1[1]) / (line1[2] - line1[0]);
    const slope2 = (line2[3] - line2[1]) / (line2[2] - line2[0]);

    // 计算两条线的夹角（弧度）
    const angleRad = Math.atan((slope2 - slope1) / (1 + slope1 * slope2));

    // 将弧度转换为角度并返回
    return angleRad * (180 / Math.PI);
}