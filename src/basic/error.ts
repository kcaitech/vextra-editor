/**
 * @description 抛出一个，可预测错误
 */
export class MossError extends Error {
    constructor(message?: string, options?: ErrorOptions) {
        super(message, options);
    }
}