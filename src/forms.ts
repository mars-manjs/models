import * as _ from "lodash"
import {classToClass} from 'class-transformer'
import {validate, ValidationError} from 'class-validator'
import { nestedKeys, initConfig } from "./helpers"
import { computed, observable } from "mobx"
import { Base } from "./base"
import { BaseRepo } from "./repo"
import { validator_t } from "."


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
            if (typeof _.get(out, property) === "object") {continue}
            if(constraints.length > 0){
                // only shows the first constraint right now
                _.set(out, property, constraints[0])
            }else{
                _.set(out, property, "error")
            }
        }
    }
    recurse("", errors)
    return out
}




interface key_i{
    key: string
    cast?: any //Number|String|Boolean|castFunc_t
}

type key_t = string|key_i
type keys_t = [key_t, key_t][]
interface FormModelConfig_i<DataT = any>{
    validator?: validator_t
    data?: DataT
    repo?: BaseRepo
    // first column represents the frontend datastructure, second column represents the backend data structure
    keys?: keys_t,
    submit?: BaseRepo
}

export const FormModelConfigDefaults = {
    validator: undefined,
    data: {},
    keys: []
} as FormModelConfig_i

export class FormModel<DataT extends Record<string, any> = any> extends Base{
    config: FormModelConfig_i<DataT>


    @observable
    _data: any
    @observable
    state: 'valid'|'invalid'
    @observable
    errors: Record<keyof DataT, string>|{} = {}

    private validator?: validator_t
    keys: keys_t
    repo?: BaseRepo
    constructor(config?: FormModelConfig_i<DataT>){
        super()
        this.config = initConfig(FormModelConfigDefaults, config)
        this.keys = this.config.keys
        this.validator = this.config.validator
        // data initialized last as it calls convert
        this.data = this.config.data
        this.initRepo(this.config.repo)
    }

    private initRepo(repo?: BaseRepo){
        if(!repo) return
        this.repo = repo
        repo.onLoad.subscribe(()=>{
            this.data = repo.data
        })
    }

    private get keyMap(){
        /**
         * map of form data keys to backend data keys
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
         * backend keys -> form keys
         */
        return _.invert(this.keyMap)
    }

    private get outMap(){
        /**
         * to map out going data
         * 
         * form keys -> backend keys
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

            // TODO: there has to be a better way of doing this
            if(e && e.target !== undefined) value = e.target.value
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
    getError(key){
        return _.get(this.errors, key)
    }


    
    set data(data: any){
        this._data = this.convert(data, this.inMap, this.inCast)
    }

    @computed
    get data(){
        return this._data
    }

    get payload(){
        /**
         * This should return in the data formatted in the 'backend' data structure
         * 
         */

         return this.convert(this.data, this.outMap, this.outCast)
    }


    convert = <T extends {} = any>(obj, map, castMap): T => {
        /**
         * @param obj: object to be converted
         * @param map maps keys of obj to keys of 'desired object' shape
         * @param castMap maps keys of 'desired object' to a cast function (to type cast)
         */
        // convert(obj, map) to call _.
        const out = {}
        const keys = nestedKeys(obj)
        for(const key of keys){
            const kout = map[key] || key
            const cast = castMap[kout]
            const rawVal = _.get(obj, key)
            const val = cast ? cast(rawVal) : rawVal
            _.set(out, kout, val)

        }
        return out as T
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
        this.errors = this.convert<Record<keyof DataT, string>>(errors, this.inMap, {})
        this.state = Object.keys(this.errors).length == 0 ? 'valid' : 'invalid'
        return this.state
    }
    
    validateDebounce = _.debounce(this.validate, 200, {leading: true})


    async submit(){
        if(!this.config.submit) return
        await this.config.submit.call(this.payload)
    }
}