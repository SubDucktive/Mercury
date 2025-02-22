const { NativeFunctionValue, StringValue } = require("./runtimevalues")

class Variable {
    constructor(name, value, kind="let") {
        this.name = name
        this.value = value
        this.kind = kind
    }
}

function CreateGlobalEnv() {
    let env = new Enviornment()

    // Global vars
    env.declareVar("typeof", new NativeFunctionValue((args) => {
        if (args.length != 1) {
            console.log("Error: typeof function expects one argument");
            process.exit(1)
        }

        return new StringValue(args[0].type)
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