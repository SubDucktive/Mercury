class AstNode {
    constructor(type) {
        this.type = type
    }
}

// Statements

class Statement extends AstNode {
    constructor() {
        super("Statement")
    }
}

class Program extends Statement {
    constructor() {
        super()
        this.type = "Program"

        this.body = []
    }
}

class VariableDeclaration extends Statement {
    constructor(kind, id, init) {
        super()
        this.type = "VariableDeclaration"

        this.kind = kind
        this.id = id
        this.init = init
    }
}

class PrintStatement extends Statement {
    constructor(message) {
        super()
        this.type = "PrintStatement"

        this.message = message
    }
}

class BlockStatement extends Statement {
    constructor(body) {
        super()
        this.type = "BlockStatement"

        this.body = body
    }
}

class IfStatement extends Statement {
    constructor(test, consequent, alternate) {
        super()
        this.type = "IfStatement"

        this.test = test
        this.consequent = consequent
        this.alternate = alternate
    }
}

class WhileStatement extends Statement {
    constructor(test, body) {
        super()
        this.type = "WhileStatement"

        this.test = test
        this.body = body
    }
}

class FunctionDeclaration extends Statement {
    constructor(id, params, body) {
        super()
        this.type = "FunctionDeclaration"

        this.id = id
        this.params = params
        this.body = body
    }
}

class ReturnStatement extends Statement {
    constructor(argument) {
        super()
        this.type = "ReturnStatement"

        this.argument = argument
    }
}

class ImportStatement extends Statement {
    constructor(filename) {
        super()
        this.type = "ImportStatement"

        this.filename = filename
    }
}

class ForStatement extends Statement {
    constructor(init, test, update, body) {
        super()
        this.type = "ForStatement"

        this.init = init
        this.test = test
        this.update = update
        this.body = body
    }
}

// Expressions

class Expression extends AstNode {
    constructor() {
        super("Expression")
    }
}

class AssignmentExpression extends Expression {
    constructor(left, right) {
        super()

        this.type = "AssignmentExpression"

        this.left = left
        this.right = right
    }
}

class BinaryExpression extends Expression {
    constructor(op, left, right) {
        super()
        this.type = "BinaryExpression"
        this.op = op
        this.left = left
        this.right = right
    }
}

class UnaryExpression extends Expression {
    constructor(operator, argument) {
        super()
        this.type = "UnaryExpression"

        this.operator = operator
        this.argument = argument
    }
}

class ArrayExpression extends Expression {
    constructor(elements) {
        super()

        this.type = "ArrayExpression"

        this.elements = elements
    }
}

class MemberExpression extends Expression {
    constructor(object, property) {
        super()
        this.type = "MemberExpression"

        this.object = object
        this.property = property
    }
}

class CallExpression extends Expression {
    constructor(callee, args) {
        super()
        this.type = "CallExpression"

        this.callee = callee
        this.args = args
    }
}

class NumericLiteral extends Expression {
    constructor(value) {
        super()
        this.type = "NumericLiteral"
        this.value = value
    }
}

class StringLiteral extends Expression {
    constructor(value) {
        super()
        this.type = "StringLiteral"
        this.value = value
    }
}

class Identifier extends Expression {
    constructor(symbol) {
        super()
        this.type = "Identifier"
        this.symbol = symbol
    }
}

class NullLiteral extends Expression {
    constructor() {
        super()
        this.type = "NullLiteral"
        this.value = "Null"
    }
}

module.exports = {
    Program,
    BinaryExpression,
    NumericLiteral,
    Identifier,
    VariableDeclaration,
    NullLiteral,
    AssignmentExpression,
    PrintStatement,
    StringLiteral,
    BlockStatement,
    IfStatement,
    UnaryExpression,
    WhileStatement,
    FunctionDeclaration,
    ReturnStatement,
    ArrayExpression,
    MemberExpression,
    CallExpression,
    ImportStatement,
    ForStatement
}