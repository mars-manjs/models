import * as _ from "lodash"
import {classToClass} from 'class-transformer'
import {validate, ValidationError} from 'class-validator'
import { nestedKeys, initConfig } from "./helpers"


export const getErrors = async (v: any): Promise<{[key: string]: string}> => {
    /**
     * v is a Validator Class (idk how to type it w/ out the inheritance)
     * This helper function transforms the class using class-transformer
     *     in order to utilize the @Type decorator and then calls class-validator
     * 
     * it recurses in order to find all the errors within the nested validator classes
     * 
     * 
     * ex. output
     * {
     *      displayName: "error",
     *      contact.email: "error"
     * }
     */
    const c = classToClass(v)
    const errors = await validate(c)
    let out: any = {}
    const recurse = (root: string, errors: ValidationError[]) => {
        for(const error of errors){
            const property = [root, error.property].filter(val=>val!="").join('.')
            recurse(property, error.children)
            
            const constraints = Object.values(error.constraints||{})
            if(constraints.length > 0){
                // only shows the first constraint right now
                out[property] = constraints[0]
            }else{
                out[property] = "error"
            }
        }
    }
    recurse("", errors)
    return out
}




type castFunc_t = (val: any)=>any

interface key_i{
    key: string
    cast?: any //Number|String|Boolean|castFunc_t
}

type key_t = string|key_i
type keys_t = [key_t, key_t][]
interface BaseFormModelConfig_i{
    validator?: new () => any
    data?: any

    // first column represents the frontend datastructure, second column represents the payload data structure
    keys?: keys_t
}

const BaseFormModelConfigDefaults = {
    validator: undefined,
    data: {},
    keys: []
} as BaseFormModelConfig_i

export class BaseFormModel {

    data: any
    state: 'valid'|'invalid'


    config: BaseFormModelConfig_i
    errors: {[key: string] : string}
    private validator?: new () => any
    keys: keys_t
    
    constructor(config: BaseFormModelConfig_i){
        this.config = initConfig(BaseFormModelConfigDefaults, config)
        this.data = this.config.data
        this.validator = this.config.validator
        this.keys = this.config.keys
    }


    private get keyMap(){
        /**
         * map of form data keys to payload data keys
         */

        // this insures that keys not specified in config.keys is included
        // const out = _.zipObject(Object.keys(this.data), Object.keys(this.data))
        let out = {}
        this.keys.forEach((key)=>{
            let k1 = key[0]
            let k2 = key[1]
            let k1out
            let k2out

            if(typeof k1 === 'object') k1out = k1.key 
            else k1out = k1
            if(typeof k2 === 'object') k2out = k2.key 
            else k2out = k2

            // if(k1out in out) delete out[k1out] // remove 

            // if(typeof v1 === 'object') {
                // const cast = v1.cast
                // if(cast === undefined) v1 = v1.key
                // else v1 = cast(v1.key) 
            // }
            // else v2 = v1
            out[k1out] = k2out
        })

        return out
    }

    private get inMap(){
        /**
         * to map in coming data
         * 
         * form data structure -> payload data structure
         */
        return _.invert(this.keyMap)
    }

    private get outMap(){
        /**
         * to map out going data
         * 
         * payload data structure -> form data structure
         */
        return this.keyMap
    }

    private get inCast(){
        let out = {}
        this.keys.forEach((key)=>{
            const k = key[0]
            // const k2 = key[1]
            if(typeof k === 'object' && k.cast !== undefined) out[k.key] = k.cast
        })
        return out
    }

    private get outCast(){
        let out = {}
        this.keys.forEach((key)=>{
            const k = key[1]
            if(typeof k === 'object' && k.cast !== undefined) out[k.key] = k.cast
        })
        return out 
    }



    onChange = (key: string) => {
        /**
         * returns a function to be called upon change
         * 
         * should be used like so
         * 
         * <input onChange={form.onChange("data.id")}/>
         */
        // takes name of the input and sets the value of this.data[name] = input
        return (e: any) => {
            // e can be Event, string, number...
            let value = undefined
            if(e.constructor.name === "Event") value = e.target.value
            else value = e
            _.set(this.data, key, value)
            this.validateDebounce()
        }
    }

    get(key){
        /**
         * get value from data by the key
         * 
         * this allows for nested values to be referenced with period deliminated stirngs
         * i.e. "user.name", "resources.cpu.percent"
         */
        return _.get(this.data, key)
    }

    get payload(){
        /**
         * This should return in the data formatted in the 'backend' data structure
         * 
         */

         return this.convert(this.data, this.outMap, this.outCast)
    }


    convert = (obj, map, castMap) => {
        /**
         * @param obj: object to be converted
         * @param map maps keys of obj to keys of 'desired object' shape
         * @param castMap maps keys of 'desired object' to a cast function (to type cast)
         */
        // convert(obj, map) to call _.
        // console.log(obj, map, castMap)
        const out = {}
        const keys = nestedKeys(obj)
        // console.log("KEYS", keys)
        for(const key of keys){
            const kout = map[key] || key
            const cast = castMap[kout]
            // console.log()
            const rawVal = _.get(obj, key)
            const val = cast ? cast(rawVal) : rawVal
            _.set(out, kout, val)
            // console.log(key, kout, val)

        }
        return out
    }


    get isValid(){
        return this.state === 'valid'
    }

    validate = async (): Promise<string> => {
        // use toDB because the validator is based on the toDB Value
        if(this.validator == undefined){
            // if you can't validate form
            // i.e. public user info form
            this.state = 'valid'
            return
        }

        const data = _.cloneDeep(this.payload)
        const v = new this.validator()
        Object.assign(v, data)
        const errors = await getErrors(v)
        this.errors = this.convert(errors, this.inMap, {})
        this.state = Object.keys(this.errors).length == 0 ? 'valid' : 'invalid'
        // console.log("validate", data, errors, this.isValid)
        return this.state
    }
    
    validateDebounce = _.debounce(this.validate, 200, {leading: true})


}