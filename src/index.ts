export type AccessChain = ReadonlyArray<PropertyKey>;

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

export type CallbackDefinition = Partial<_CallbackDefinition>;

export interface ProxyObjectInfo {
    root: any,
    accessChain: AccessChain,
}

// Target is a function and not just an ordinary object because the target must 
// be callable in order for apply/construct to work
const ProxyTarget = new Function();
const RegisteredProxies = new WeakMap<any, ProxyObjectInfo>();

export const Call = Symbol("Call");
export const Construct = Symbol("Construct");
export const Prototype = Symbol("Prototype");

export function Kuro<T extends object>(callbacks?: CallbackDefinition) {
    return create([], callbacks) as T;
}

export function getInfo(obj: any) {
    return RegisteredProxies.get(obj);
}

function create(accessChain: AccessChain, callbacks?: CallbackDefinition, root?: any): object {
    const proxyObj = new Proxy(ProxyTarget, {
        get: (_target, property) => {
            // Run callback
            callbacks && callbacks.get && callbacks.get(root, accessChain, property);

            // Return a placeholder primitive value if requested by the host 
            // environment via built-ins
            switch (property) {
                case Symbol.toStringTag: return "";
                case Symbol.toPrimitive: return (hint: string) => {
                    switch (hint) {
                        case "number": return 0;
                        case "string": return "";
                    }
                    return false;
                };
            }

            // Return new inner proxy going further down the access chain
            return create([...accessChain, property], callbacks, root);
        },

        set: (_target, property, value) => {
            // Run callback
            callbacks && callbacks.set && callbacks.set(root, accessChain, property, value);

            // Pretend property assignment was successful
            return true;
        },

        has: (_target, property) => {
            // Run callback
            callbacks && callbacks.has && callbacks.has(root, accessChain, property);

            // Pretend property exists
            return true;
        },

        apply: (_target, thisArg, argumentsList) => {
            // Run callback
            callbacks && callbacks.apply && callbacks.apply(root, accessChain, thisArg, argumentsList);

            // Return a new inner proxy with the Call symbol in the access 
            // chain
            return create([...accessChain, Call], callbacks, root);
        },

        ownKeys: (_target) => {
            // Run callback
            callbacks && callbacks.ownKeys && callbacks.ownKeys(root, accessChain);

            // Return a blank enumerable object - empty array
            return [];
        },

        construct: (_target, argumentsList) => {
            // Run callback
            callbacks && callbacks.construct && callbacks.construct(root, accessChain, argumentsList);

            // Return a new inner proxy with the Construct symbol in the
            // access chain
            return create([...accessChain, Construct], callbacks, root);
        },

        isExtensible: (_target) => {
            // Run callback
            callbacks && callbacks.isExtensible && callbacks.isExtensible(root, accessChain);

            // We report that the object is extensible
            //
            // Note that the BlankTarget is extensible by default, and this
            // inner proxy must return the same extensibility value as part of
            // the invariant condition for the proxy
            return true;
        },

        defineProperty: (_target, property, descriptor) => {
            // Run callback
            callbacks && callbacks.defineProperty && callbacks.defineProperty(root, accessChain, property, descriptor);

            // Pretend property definition was successful
            return true;
        },

        deleteProperty: (_target, property) => {
            // Run callback
            callbacks && callbacks.deleteProperty && callbacks.deleteProperty(root, accessChain, property);

            // Pretend property deletion was successful
            return true;
        },

        getPrototypeOf: (_target) => {
            // Run callback
            callbacks && callbacks.getPrototypeOf && callbacks.getPrototypeOf(root, accessChain);

            // Return a new inner proxy with the Prototype symbol in the
            // access chain
            return create([...accessChain, Prototype], callbacks, root);
        },

        setPrototypeOf: (_target, prototype) => {
            // Run callback
            callbacks && callbacks.setPrototypeOf && callbacks.setPrototypeOf(root, accessChain, prototype);

            // Pretend prototype set was successful
            return true;
        },

        preventExtensions: (_target) => {
            // Run callback
            callbacks && callbacks.preventExtensions && callbacks.preventExtensions(root, accessChain);

            // Invariant conditions mean that we must report that the setting of
            // non-extensibility on the object failed
            return false;
        },

        getOwnPropertyDescriptor: (_target, property) => {
            // Run callback
            callbacks && callbacks.getOwnPropertyDescriptor && callbacks.getOwnPropertyDescriptor(root, accessChain, property);

            // Return an undefined property descriptor for all properties
            //
            // Note that this is implying that the property does not exist on
            // the object, even though we return `true` for #has().
            return undefined;
        }
    }) as any;

    // If the root has not been set, then make this proxy object the root
    if (root === undefined) {
        root = proxyObj;
    }

    // Register proxy in WeakMap
    RegisteredProxies.set(proxyObj, {
        root,
        accessChain,
    });

    return proxyObj;
}

