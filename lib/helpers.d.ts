export declare const nestedKeys: (obj: any) => any[];
export declare const initConfig: (defaultConfig: any, config: any) => any;
declare class _DynamicClass<T> {
    _data: T;
    constructor(data: T);
}
export declare const DynamicClass: new <T>(data: T) => _DynamicClass<T> & T;
export {};
