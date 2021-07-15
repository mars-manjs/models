import * as _ from "lodash";
import { BaseModel } from "./base";
import { BaseRepository } from "./repo";
export declare const getErrors: (v: any) => Promise<{
    [key: string]: string;
}>;
interface key_i {
    key: string;
    cast?: any;
}
declare type key_t = string | key_i;
declare type keys_t = [key_t, key_t][];
interface BaseFormModelConfig_i {
    validator?: new () => any;
    data?: any;
    repo?: BaseRepository;
    keys?: keys_t;
}
export declare class BaseFormModel extends BaseModel {
    _data: any;
    state: 'valid' | 'invalid';
    config: BaseFormModelConfig_i;
    errors: {
        [key: string]: string;
    };
    private validator?;
    keys: keys_t;
    repo?: BaseRepository;
    constructor(config: BaseFormModelConfig_i);
    private initRepo;
    private get keyMap();
    private get inMap();
    private get outMap();
    private get inCast();
    private get outCast();
    set data(data: any);
    get data(): any;
    onChange: (key: string) => (e: any) => void;
    get(key: any): any;
    get payload(): {};
    convert: (obj: any, map: any, castMap: any) => {};
    get isValid(): boolean;
    validate: () => Promise<string>;
    validateDebounce: _.DebouncedFunc<() => Promise<string>>;
}
export {};
