export declare type AccessChain = ReadonlyArray<PropertyKey>;
export interface _CallbackDefinition {
    get(root: any, accessChain: AccessChain, property: PropertyKey): void;
    set(root: any, accessChain: AccessChain, property: PropertyKey, value: any): void;
    has(root: any, accessChain: AccessChain, property: PropertyKey): void;
    apply(root: any, accessChain: AccessChain, thisArg: any, argumentsList: any): void;
    ownKeys(root: any, accessChain: AccessChain): void;
    construct(root: any, accessChain: AccessChain, argumentsList: any): void;
    isExtensible(root: any, accessChain: AccessChain): void;
    defineProperty(root: any, accessChain: AccessChain, property: PropertyKey, descriptor: PropertyDescriptor): void;
    deleteProperty(root: any, accessChain: AccessChain, property: PropertyKey): void;
    getPrototypeOf(root: any, accessChain: AccessChain): void;
    setPrototypeOf(root: any, accessChain: AccessChain, prototype: any): void;
    preventExtensions(root: any, accessChain: AccessChain): void;
    getOwnPropertyDescriptor(root: any, accessChain: AccessChain, property: PropertyKey): void;
}
export declare type CallbackDefinition = Partial<_CallbackDefinition>;
export interface ProxyObjectInfo {
    root: any;
    accessChain: AccessChain;
}
export declare const Call: symbol;
export declare const Construct: symbol;
export declare const Prototype: symbol;
export declare function Kuro<T extends object>(callbacks?: CallbackDefinition): T;
export declare function getInfo(obj: any): ProxyObjectInfo | undefined;
