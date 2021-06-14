import * as _ from "lodash";
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
    keys?: keys_t;
}
export declare class BaseFormModel {
    data: any;
    state: 'valid' | 'invalid';
    config: BaseFormModelConfig_i;
    errors: {
        [key: string]: string;
    };
    private validator?;
    keys: keys_t;
    constructor(config: BaseFormModelConfig_i);
    private get keyMap();
    private get inMap();
    private get outMap();
    private get inCast();
    private get outCast();
    onChange: (key: string) => (e: any) => void;
    get(key: any): any;
    get payload(): {};
    convert: (obj: any, map: any, castMap: any) => {};
    get isValid(): boolean;
    validate: () => Promise<string>;
    validateDebounce: _.DebouncedFunc<() => Promise<string>>;
}
export {};
