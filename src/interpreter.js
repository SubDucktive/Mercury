const { Enviornment } = require("./enviornment");
const { NumberValue, NullValue, StringValue, ArrayValue, FunctionValue, ReturnValue } = require("./runtimevalues");

function invalidReturn() {
    console.log(`Error: Invalid Return Statement`)
    process.exit(1)
}

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
            return value.value
        }
    }
}

function evaluate(node, env, inFunction=false) {
    switch (node.type) {
        case "Program": {
            let lastEvaluated = new NullValue()

            for (let i = 0; i < node.body.length; i++) {
                lastEvaluated = evaluate(node.body[i], env)
            }

            return lastEvaluated
        }

        case "NumericLiteral":
            return new NumberValue(node.value)

        case "StringLiteral":
            return new StringValue(node.value)

        case "NullLiteral":
            return new NullValue()

        case "BinaryExpression": {
            let lhs = evaluate(node.left, env) 
            let rhs = evaluate(node.right, env)

            if (lhs.type == "Number" && rhs.type == "Number") {
                let result = new NullValue()
                if (node.op == "+") {
                    result = lhs.value + rhs.value
                } else if (node.op == "-") {
                    result = lhs.value - rhs.value
                } else if (node.op == "*") {
                    result = lhs.value * rhs.value
                } else if (node.op == "/") {
                    if (rhs.value == 0) {
                        console.log(`ERROR: Division by zero is not supported.`)
                        process.exit(1)
                    }
                    result = lhs.value / rhs.value
                } else if (node.op == "%") {
                    result = lhs.value % rhs.value
                } else if (node.op == ">") {
                    result = Number(lhs.value > rhs.value)
                } else if (node.op == "<") {
                    result = Number(lhs.value < rhs.value)
                } else if (node.op == ">=") {
                    result = Number(lhs.value >= rhs.value)
                } else if (node.op == "<=") {
                    result = Number(lhs.value <= rhs.value)
                } else if (node.op == "==") {
                    result = Number(lhs.value == rhs.value)
                } else if (node.op == "!=") {
                    result = Number(lhs.value != rhs.value)
                }

                return new NumberValue(result)
            } else if (lhs.type == "String" || rhs.type == "String") {
                let result = new NullValue()
                if (node.op == "+") {
                    result = new StringValue(`${lhs.value}${rhs.value}`)
                    return result
                } else if (node.op == "==") {
                    result = Number(lhs.value == rhs.value)
                } else if (node.op == "!=") {
                    result = Number(lhs.value != rhs.value)
                }

                return new NumberValue(result)
            }

            return new StringValue(`${lhs.value}${rhs.value}`)
        }

        case "Identifier":
            return env.lookup(node.symbol)
        case "AssignmentExpression":
            
            if (node.left.type == "Identifier") {
                return env.assignVar(node.left.symbol, evaluate(node.right, env));
            }
        
            if (node.left.type == "MemberExpression") {
                let object = evaluate(node.left.object, env)
                let property = evaluate(node.left.property, env)

                if (property.type != "Number") {
                    console.log(`Error: Indices must be of type 'Number'`)
                    process.exit(1)
                }

                const index = property.value

                if (object.type == "Array") {
                    if (index >= object.elements.length || index < 0) {
                        console.log(`ERROR: Index out of range`);
                        process.exit(1);
                    }
    
                    return object.elements[index] = evaluate(node.right, env)
                }
            }
        
            console.log(`ERROR: Invalid left hand side of assignment`);
            process.exit(1);
            break;

        case "VariableDeclaration": {
            let value = evaluate(node.init, env)
            env.declareVar(node.id.symbol, value, node.kind)
            break
        }

        case "PrintStatement": {
            console.log(stringifyvalue(evaluate(node.message, env)))
            break
        }

        case "BlockStatement": {
            let blockEnv = new Enviornment(env)

            for (const statement of node.body) {
                evaluate(statement, blockEnv, inFunction)
            }
            break
        }

        case "IfStatement": {
            let result;
            if (evaluate(node.test, env).value) {
                result = evaluate(node.consequent, env, inFunction)
            } else if (node.alternate) {
                result = evaluate(node.alternate, env, inFunction)
            }
            
            return result
        }

        case "WhileStatement": {
            while (evaluate(node.test, env, inFunction).value) {
                evaluate(node.body, env, inFunction)
            }
            break
        }

        case "FunctionDeclaration": {
            const func = new FunctionValue(
                node.id.symbol,
                node.params,
                node.body
            )

            env.declareVar(func.id, func, "const")

            break
        }

        case "UnaryExpression": {
            let result = new NullValue()
            if (node.operator == "!") {
                result = !evaluate(node.argument, env).value
            } else if (node.operator == "-") {
                result = -evaluate(node.argument, env).value
            }

            return new NumberValue(Number(result))
        }
        
        case "ArrayExpression": {
            let elements = [];

            for (const element of node.elements) {
                elements.push(evaluate(element, env))
            }

            return new ArrayValue(elements)
        }

        case "MemberExpression": {
            let object = evaluate(node.object, env)
            let property = evaluate(node.property, env)

            if (property.type != "Number") {
                console.log(`Error: Indices must be of type 'Number'`)
                process.exit(1)
            }

            const index = property.value

            while (object.type == "MemberExpression") {
                object = evaluate(node.object, env)
            }

            if (object.type == "Array") {
                if (index >= object.elements.length || index < 0) {
                    console.log(`ERROR: Index out of range`);
                    process.exit(1);
                }

                return object.elements[index]
            }

            if (object.type == "String") {
                if (index >= object.value.length || index < 0) {
                    console.log(`ERROR: Index out of range`);
                    process.exit(1);
                }

                return new StringValue(object.value[index])
            }

            console.log(`Cannot index type '${object.type}'`);
            process.exit(1);
            break
        }

        case "CallExpression": {
            let callee = evaluate(node.callee, env)

            let args = []

            for (const arg of node.args) {
                args.push(evaluate(arg, env))
            }

            if (callee.type == "Function") {
                // Create a new scope for the function call
                let funcEnv = new Enviornment(env)
        
                // Assign the arguments to the parameters in the function's environment
                for (let i = 0; i < callee.params.length; i++) {
                    const param = callee.params[i]
                    funcEnv.declareVar(param.symbol, args[i], "const")
                }
        
                // Now evaluate the function body using the new scope
                let lastEvaluated = new NullValue()
                for (const statement of callee.body) {
                    try {
                        lastEvaluated = evaluate(statement, funcEnv, true)
                    } catch (err) {
                        if (err instanceof ReturnValue) {
                            return err.value
                        } else {
                            throw err
                        }
                    }
                }
                return lastEvaluated  // Return the result of the function body
        
            }

            if (callee.type == "NativeFunction") {
                return callee.jsfunction(args)
            }

            console.log(`Error: Cannot call ${callee.type} as function.`)
            process.exit(1)
            break
        }

        case "ReturnStatement": {
            if (!inFunction) {
                invalidReturn()
            }
            throw new ReturnValue(evaluate(node.argument, env))
        }

        default:
            console.log(`Ast node not implemented yet: ${node.type}.`)
            process.exit(1)
            
    }
}

module.exports = { evaluate, stringifyvalue }