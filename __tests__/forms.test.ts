import { BaseFormModel, MockRepository } from '../src'
import { transform } from 'lodash'
import { IsString, IsNotEmpty, IsDefined, ValidateNested, MaxLength, Max, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import "reflect-metadata";


class GreetingsValidator{
    @IsNumber()
    hello: string
}

class Validator{
    @Max(500)
    world: number;
  
    @IsDefined()
    @ValidateNested()
    @Type(() => GreetingsValidator)
    greetings: GreetingsValidator;
}


const form = new BaseFormModel({
    validator: Validator,
    data: {
        name: "John Smith",
        hello: 123,
        world: "456"
    },
    keys: [
        ["hello", "greetings.hello"],
        ["world", { key: "world", cast: Number }]
    ]
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
    expect(form['outMap']).toStrictEqual({  hello: 'greetings.hello', world: 'world' })
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
    expect(form.convert({name: "John Smith", greetings: {hello: "123"}, world: 456}, form['inMap'], form['inCast'])).toStrictEqual({name: "John Smith", hello: "123", world: 456})
})


test('form validator', async () => {
    await form.validate()
    // console.log(await form.validate())
    console.log(form.state)
    console.log(form.errors)

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

test('test errors data structure', ()=>{
    
})


test('form repo load', async ()=>{
    const data = {numbers: [1,2,3]}
    const repo = new MockRepository({data})
    const form = new BaseFormModel({repo: repo})
    // console.log("preload data", data, form.data)
    expect(form.data).toStrictEqual({})
    await repo.call()
    // console.log("postload data", form.data)
    expect(form.data).toStrictEqual(data)
})