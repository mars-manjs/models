import { FormModel, FormModelConfigDefaults, MockRepo } from '../src'
import { transform } from 'lodash'
import { IsString, IsNotEmpty, IsDefined, ValidateNested, MaxLength, Max, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import "reflect-metadata";


class GreetingsValidator {
    @IsNumber()
    //@ts-ignore
    hello: number
}

class Validator {
    @Max(500)
    //@ts-ignore
    world: number;

    @IsDefined()
    @ValidateNested()
    @Type(() => GreetingsValidator)
    //@ts-ignore
    greetings: GreetingsValidator;
}


const form = new FormModel({
    validator: Validator,
    data: {
        name: "John Smith",
        greetings: {
            hello: 123,
        },
        world: "456"
    },
    keys: [
        ["hello", "greetings.hello"],
        ["world", { key: "world", cast: Number }]
    ]
})


describe('empty config', () => {
    test('should be empty object', () => {
        const form = new FormModel()

        expect(form.config).toBe(FormModelConfigDefaults)
    })
})

test('form configurations', () => {
    expect(form.data).toStrictEqual({
        name: "John Smith",
        hello: 123,
        world: "456"
    })

    expect(form.keys).toStrictEqual([
        ["hello", "greetings.hello"],
        ["world", { key: "world", cast: Number }]
    ])

})

test('form keyMaps', () => {
    expect(form['inMap']).toStrictEqual({ 'greetings.hello': 'hello', world: 'world' })
    expect(form['outMap']).toStrictEqual({ hello: 'greetings.hello', world: 'world' })
})

test('form cast map', () => {
    expect(form['inCast']).toStrictEqual({})
    expect(form['outCast']).toStrictEqual({ "world": Number })
})

test('form convert', () => {
    // console.log(form.convert(form.data, form['outMap'], form['outCast']))
    // expect(form.convert(form.data, form['outMap'], form['outCast'])).toBe({})
    // console.log(form.inMap, form.data)
    // console.log(form.convert({name: "John Smith", greetings: {hello: "123"}, world: 456}, form.inMap, form['inCast']))
    expect(form.convert(form.data, form['outMap'], form['outCast'])).toStrictEqual({ name: "John Smith", greetings: { hello: 123 }, world: 456 })
    expect(form.convert({ name: "John Smith", greetings: { hello: "123" }, world: 456 }, form['inMap'], form['inCast'])).toStrictEqual({ name: "John Smith", hello: "123", world: 456 })
})


test('form validator', async () => {
    await form.validate()
    // console.log(await form.validate())
    // console.log(form.state)
    // console.log(form.errors)

    // test state
    expect(form.state).toBe('valid')
    // test isValid
    expect(form.isValid).toBeTruthy()



    // invalid form
    form.onChange('world')('600')
    await form.validate()
    // test state
    expect(form.state).toBe('invalid')
    // test isValid
    expect(form.isValid).toBeFalsy()
})

test('test errors data structure', () => {

})



describe('form repo loading', () => {
    test('form repo load', async () => {
        const data = { numbers: [1, 2, 3] }
        const repo = new MockRepo({ data })
        const form = new FormModel({ repo })
        // console.log("preload data", data, form.data)
        expect(form.data).toStrictEqual({})
        await repo.call()
        // console.log("postload data", form.data)
        expect(form.data).toStrictEqual(data)
    })

    test('form repo load with convesions', async () => {
        const data = {
            info: {
                name: "Hello"
            },
            number: 123
        }

        const repo = new MockRepo({ data })
        const form = new FormModel({
            repo,
            keys: [
                ["name", "info.name"],
                [{ key: "number", cast: String }, { key: "number", cast: Number }]
            ]
        })
        // console.log("preload data", data, form.data)
        expect(form.data).toStrictEqual({})
        await repo.call()
        // console.log("data", form.data, form.payload, form.data.name, typeof form.data.number)
        expect(form.data).toStrictEqual({
            name: "Hello",
            number: "123"
        })
        expect(form.payload).toStrictEqual(data)
        expect(repo.data).toStrictEqual(data)
    })
})



describe('submit repo', () => {
    test('should work', async () => {
        const data = { abc: 123 }
        const repo = new MockRepo({ data })
        const form = new FormModel({
            submit: repo
        })
        expect(repo.state).toBe('unloaded')
        await form.call()
        expect(repo.state).toBe('loaded')
    })
})