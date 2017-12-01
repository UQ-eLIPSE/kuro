# kuro

Novel recursive JavaScript Proxy object with hooks

## Installation

```bash
npm install UQ-eLIPSE/kuro
```

## Usage

```javascript
/// Importing

// ES Modules style
import { Kuro } from "kuro";

// CommonJS style
const Kuro = require("kuro").Kuro;


/// In your code...

// Instantiate the proxy object with your desired hooks
// The hooks are modelled around the same ones available in ES2015 Proxy
const obj = Kuro({
    get: (root, accessChain, property) => {
        console.log(["obj", ...accessChain, property].map(x => x.toString()).join("->"));
    },
    set: (root, accessChain, property, value) => {
        console.log(`${["obj", ...accessChain, property].map(x => x.toString()).join("->")} = ${value}`);
    },
});

// You can basically use the proxy object (`obj`) however you like:

// This doesn't throw an access error...
obj.this.is.not.a.property.actually.defined.by.me;

/*
    As a result of the hooks defined above, the console log from the above statement is:

    obj->this
    obj->this->is
    obj->this->is->not
    obj->this->is->not->a
    obj->this->is->not->a->property
    obj->this->is->not->a->property->actually
    obj->this->is->not->a->property->actually->defined
    obj->this->is->not->a->property->actually->defined->by
    obj->this->is->not->a->property->actually->defined->by->me
*/

// You can do all sorts of crazy stuff and it won't throw an error
(new (obj[42].someFunction(1,2,3).magicConstructor)).someValue++;

/*
    Console log from the above statement is:

    testObj->42
    testObj->42->someFunction
    testObj->42->someFunction->Symbol(Call)->magicConstructor
    testObj->42->someFunction->Symbol(Call)->magicConstructor->Symbol(Construct)->someValue
    testObj->42->someFunction->Symbol(Call)->magicConstructor->Symbol(Construct)->someValue->Symbol(Symbol.toPrimitive)
    testObj->42->someFunction->Symbol(Call)->magicConstructor->Symbol(Construct)->someValue = 1
*/
```

## Access chain

`kuro` keeps track of an "access chain" as you go deeper into the object and for
things like function and constructor calls.

This is passed into each hook as the second parameter so that you can find out
how you got to where you are.

## Symbols

There are three symbols exported by the package that you can use to reference
things in the access chain:

```javascript
import {
    Call,       // Symbol("Call") = marks a function call
    Construct,  // Symbol("Construct") = marks a constructor call
    Prototype   // Symbol("Prototype") = marks a `getPrototypeOf` call
} from "kuro";
```

You would have noticed the `Call` and `Construct` symbols appearing in the
console output above.

## What can you use this for

* Testing for property access (use the `get` hook)
* As a placeholder object (e.g. when a certain function is disabled) but there
  is code that still expects certain properties (basically suppressing undefined
  access errors)
* Fun

## Notes

### Very much beta code

This is still very much a fun, novel project and not all Proxy hooks have been
tried out yet (but they should at least be somewhat functional.)

### ES2015/ES6 feature requirements

* Proxy: native support required
* Symbol: polyfillable
* WeakMap: polyfillable
