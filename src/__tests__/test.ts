import * as user_api from "@/request/users"

describe("test", () => {
    beforeAll(() => {
        localStorage.setItem("token", "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2OTc1MDcyMjQsIm5iZiI6MTY5NjkwMjM2NCwiaWF0IjoxNjk2OTAyNDI0LCJkYXRhIjp7ImRhdGEiOnsiaWQiOiIxMTA2NzgzODE3MDc2NzM2MDAiLCJuaWNrbmFtZSI6IkpmZW5nIn19fQ.fkXL40fimXAO8cnIIiwhUWEw2y8GxlIl3rPZq2H0Fs0")
    })

    it("test", async () => {
        const response = await user_api.GetInfo()
        console.log(response)
    });
});
