import { FormModel, FormModelConfigDefaults, MockRepo } from '../src'
import { IsDefined, ValidateNested, Max, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import "reflect-metadata";


class GreetingsValidator {
    @IsNumber()
    @Max(50)
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


class TestForm extends FormModel {
    constructor() {
        super({
            validator: Validator,
            data: {
                name: "John Smith",
                greetings: {
                    hello: 40,
                },
                world: 456
            },
            keys: [
                ["hello", "greetings.hello"],
                ["world", { key: "world", cast: Number }]
            ]
        })
    }
}

const form = new TestForm()

describe('empty config', () => {
    test('should be empty object', () => {
        const form = new FormModel()

        expect(form.config).toBe(FormModelConfigDefaults)
    })
})

test('form configurations', () => {
    expect(form.data).toStrictEqual({
        name: "John Smith",
        hello: 40,
        world: 456
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



describe('convert', () => {
    test('basic', () => {
        expect(form.convert(form.data, form['outMap'], form['outCast'])).toStrictEqual({ name: "John Smith", greetings: { hello: 40 }, world: 456 })
        expect(form.convert({ name: "John Smith", greetings: { hello: "123" }, world: 456 }, form['inMap'], form['inCast'])).toStrictEqual({ name: "John Smith", hello: "123", world: 456 })
    })
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
})

describe('form validator', () => {
    test('is valid', async () => {
        const form = new TestForm()
        await form.validate()
        console.log(JSON.stringify(form.errors))

        // test state
        expect(form.state).toBe('valid')
        // test isValid
        expect(form.isValid).toBeTruthy()
    })

    test('is invalid', async () => {
        const form = new TestForm()
        // invalid form
        form.onChange('world')('600')
        await form.validate()
        // test state
        expect(form.state).toBe('invalid')
        // test isValid
        expect(form.isValid).toBeFalsy()
    })

    test('is invalid nested', async ()=>{
        const form = new TestForm()
        
        form.onChange('hello')(500)
        // console.log("after onchange")
        await form.validate()
    
        expect(form.state).toBe('invalid')
        expect(form.isValid).toBeFalsy()
        // console.log(form.errors)
    })
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
        setTimeout(()=>{
            expect(form.data).toStrictEqual(data)
        }, 1000)
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


