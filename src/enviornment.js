const { NativeFunctionValue, StringValue, NumberValue, NullValue } = require("./runtimevalues")

const readlineSync = require('readline-sync')

// No matter what i did i couldn't import this from the other file so i just copy and pasted it
// Fuck you javascript

function stringifyvalue(value, quoteStrings=false) {
    switch (value.type) {
        case "Number":
            return value.value.toString()

        case "Array": {
            let result = "[";
            for (let i = 0; i < value.elements.length; i++) {
                result += stringifyvalue(value.elements[i],  true);  // Stringify each element
                if (i < value.elements.length - 1) {
                    result += ", ";  // Add a comma between elements, but not after the last one
                }
            }
            result += "]";
            return result;
        }

        case "String": {
            let result = quoteStrings ? `"${value.value}"` : value.value
            return result
        }

        default: {
            return null;
        }
    }
}

class Variable {
    constructor(name, value, kind="let") {
        this.name = name
        this.value = value
        this.kind = kind
    }
}

function CreateGlobalEnv() {
    let env = new Enviornment()

    // Global vars/native functions
    env.declareVar("typeof", new NativeFunctionValue((args) => {
        if (args.length != 1) {
            console.log("Error: typeof function expects one argument");
            process.exit(1)
        }

        return new StringValue(args[0].type)
    }), "const")

    env.declareVar("input", new NativeFunctionValue((args) => {
        let userin = readlineSync.question(args[0].type == "String" ? args[0].value : '');

        return new StringValue(userin)
    }), "const")

    env.declareVar("len", new NativeFunctionValue((args) => {
        switch (args[0].type) {
            case "String": {
                return new NumberValue(args[0].value.length)
            }

            case "Array": {
                return new NumberValue(args[0].elements.length)
            }

            default: {
                return new NullValue()
            }
        }
    }), "const")

    env.declareVar("String", new NativeFunctionValue((args) => {
        let result = stringifyvalue(args[0])

        if (result == null) {
            return new NullValue()
        }

        return new StringValue(result)
    }), "const")

    env.declareVar("Number", new NativeFunctionValue((args) => {
        if (["String", "Number"].includes(args[0].type)) {
            return new NumberValue(Number(args[0].value))
        }
        return new NullValue
    }), "const")

    return env;
}

class Enviornment {
    constructor(parent = null) {
        this.parent = parent

        this.variables = []
    }

    varExists(name) {
        return this.varIndex(name) !== null
    }

    varIndex(name) {
        for (let i = 0; i < this.variables.length; i++) {
            if (this.variables[i].name == name) {
                return i
            }
        }

        return null
    }

    declareVar(name, value, kind) {
        if (this.varExists(name)) {
            console.log(`Cannot declare ${name}, already defined`)
            process.exit(1)
        }

        this.variables.push(new Variable(name, value, kind))
    }

    assignVar(name, value) {
        let env = this.resolve(name)
        let index = env.varIndex(name)

        if (env.variables[index].kind == "const") {
            console.log(`ERROR: Cannot assign to constant variable: ${name}`)
            process.exit(1)
        }

        if (index !== null) {
            env.variables[index].value = value
        } else {
            console.log(`Cannot assign to undelcared variable: ${name}`)
            process.exit(1)
        }

        return value
    }

    lookup(name) {
        let env = this.resolve(name)
        let index = env.varIndex(name)

        return env.variables[index].value
    }

    resolve(name) {
        if (this.varExists(name)) {
            return this
        }

        if (this.parent == null) {
            console.log(`Cannot resolve variable: '${name}'`)
            process.exit(1)
        }

        return this.parent.resolve(name)
    }
}

module.exports = { Enviornment, Variable, CreateGlobalEnv }