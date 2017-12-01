"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Target is a function and not just an ordinary object because the target must 
// be callable in order for apply/construct to work
var ProxyTarget = new Function();
var RegisteredProxies = new WeakMap();
exports.Call = Symbol("Call");
exports.Construct = Symbol("Construct");
exports.Prototype = Symbol("Prototype");
function Kuro(callbacks) {
    return create([], callbacks);
}
exports.Kuro = Kuro;
function getInfo(obj) {
    return RegisteredProxies.get(obj);
}
exports.getInfo = getInfo;
function create(accessChain, callbacks, root) {
    var proxyObj = new Proxy(ProxyTarget, {
        get: function (_target, property) {
            // Run callback
            callbacks && callbacks.get && callbacks.get(root, accessChain, property);
            // Return a placeholder primitive value if requested by the host 
            // environment via built-ins
            switch (property) {
                case Symbol.toStringTag: return "";
                case Symbol.toPrimitive: return function (hint) {
                    switch (hint) {
                        case "number": return 0;
                        case "string": return "";
                    }
                    return false;
                };
            }
            // Return new inner proxy going further down the access chain
            return create(accessChain.concat([property]), callbacks, root);
        },
        set: function (_target, property, value) {
            // Run callback
            callbacks && callbacks.set && callbacks.set(root, accessChain, property, value);
            // Pretend property assignment was successful
            return true;
        },
        has: function (_target, property) {
            // Run callback
            callbacks && callbacks.has && callbacks.has(root, accessChain, property);
            // Pretend property exists
            return true;
        },
        apply: function (_target, thisArg, argumentsList) {
            // Run callback
            callbacks && callbacks.apply && callbacks.apply(root, accessChain, thisArg, argumentsList);
            // Return a new inner proxy with the Call symbol in the access 
            // chain
            return create(accessChain.concat([exports.Call]), callbacks, root);
        },
        ownKeys: function (_target) {
            // Run callback
            callbacks && callbacks.ownKeys && callbacks.ownKeys(root, accessChain);
            // Return a blank enumerable object - empty array
            return [];
        },
        construct: function (_target, argumentsList) {
            // Run callback
            callbacks && callbacks.construct && callbacks.construct(root, accessChain, argumentsList);
            // Return a new inner proxy with the Construct symbol in the
            // access chain
            return create(accessChain.concat([exports.Construct]), callbacks, root);
        },
        isExtensible: function (_target) {
            // Run callback
            callbacks && callbacks.isExtensible && callbacks.isExtensible(root, accessChain);
            // We report that the object is extensible
            //
            // Note that the BlankTarget is extensible by default, and this
            // inner proxy must return the same extensibility value as part of
            // the invariant condition for the proxy
            return true;
        },
        defineProperty: function (_target, property, descriptor) {
            // Run callback
            callbacks && callbacks.defineProperty && callbacks.defineProperty(root, accessChain, property, descriptor);
            // Pretend property definition was successful
            return true;
        },
        deleteProperty: function (_target, property) {
            // Run callback
            callbacks && callbacks.deleteProperty && callbacks.deleteProperty(root, accessChain, property);
            // Pretend property deletion was successful
            return true;
        },
        getPrototypeOf: function (_target) {
            // Run callback
            callbacks && callbacks.getPrototypeOf && callbacks.getPrototypeOf(root, accessChain);
            // Return a new inner proxy with the Prototype symbol in the
            // access chain
            return create(accessChain.concat([exports.Prototype]), callbacks, root);
        },
        setPrototypeOf: function (_target, prototype) {
            // Run callback
            callbacks && callbacks.setPrototypeOf && callbacks.setPrototypeOf(root, accessChain, prototype);
            // Pretend prototype set was successful
            return true;
        },
        preventExtensions: function (_target) {
            // Run callback
            callbacks && callbacks.preventExtensions && callbacks.preventExtensions(root, accessChain);
            // Invariant conditions mean that we must report that the setting of
            // non-extensibility on the object failed
            return false;
        },
        getOwnPropertyDescriptor: function (_target, property) {
            // Run callback
            callbacks && callbacks.getOwnPropertyDescriptor && callbacks.getOwnPropertyDescriptor(root, accessChain, property);
            // Return an undefined property descriptor for all properties
            //
            // Note that this is implying that the property does not exist on
            // the object, even though we return `true` for #has().
            return undefined;
        }
    });
    // If the root has not been set, then make this proxy object the root
    if (root === undefined) {
        root = proxyObj;
    }
    // Register proxy in WeakMap
    RegisteredProxies.set(proxyObj, {
        root: root,
        accessChain: accessChain,
    });
    return proxyObj;
}
