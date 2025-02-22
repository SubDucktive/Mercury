class RuntimeValue {
    constructor(type) {
        this.type = type
    }
}

class NumberValue extends RuntimeValue {
    constructor(value) {
        super("Number")
        this.value = value
    }
}

class StringValue extends RuntimeValue {
    constructor(value) {
        super("String")
        this.value = value
    }
}

class NullValue extends RuntimeValue {
    constructor() {
        super("Null")
        this.value = "null"
    }
}

class ArrayValue extends RuntimeValue {
    constructor(elements) {
        super("Array")

        this.elements = elements
    }
}

class NativeFunctionValue extends RuntimeValue {
    constructor(jsfunction, args) {
        super("NativeFunction")

        this.jsfunction = jsfunction
        this.args = args
    }
}

class FunctionValue extends RuntimeValue {
    constructor(id, params, body) {
        super("Function")

        this.id = id
        this.params = params
        this.body = body
    }
}

class ReturnValue extends RuntimeValue {
    constructor(value) {
        super("ReturnValue")

        this.value = value
    }
}

module.exports = { RuntimeValue, NumberValue, NullValue, StringValue, ArrayValue, NativeFunctionValue, FunctionValue, ReturnValue }