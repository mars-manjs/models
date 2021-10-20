import { FormModel } from "../src"

test('empty list', () => {
    const data = {
        permissions: [],
        roles: [123],
    }
    const form = new FormModel({
        data
    })
    console.log(form.data)
    expect(form.data).toStrictEqual(data)
    // expect(form.payload).toBe(data)
})