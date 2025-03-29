const {
    Program,
    BinaryExpression,
    NumericLiteral,
    Identifier,
    VariableDeclaration,
    AssignmentExpression,
    PrintStatement,
    StringLiteral,
    BlockStatement,
    IfStatement,
    UnaryExpression,
    WhileStatement,
    ArrayExpression,
    MemberExpression,
    CallExpression,
    FunctionDeclaration,
    ReturnStatement,
    NullLiteral,
    ImportStatement
} = require("./ast")
const { Lexer, TokenType } = require("./lexer")

class Parser {
    constructor(src) {
        this.src = src
        this.tokens = []
        this.index = 0
    }

    eat() {
        let token = this.peek()
        this.index++
        return token
    }

    peek() {
        return this.tokens[this.index]
    }

    atEnd() {
        return this.peek().type == TokenType.EOF
    }

    expect(type) {
        let token = this.eat()
        if (token.type != type) {
            console.log(`ERROR: Expected token: ${type} after ${this.tokens[this.index - 2].type}: ${this.tokens[this.index - 2].value}`)
            process.exit(1)
        }
        return token
    }

    parse() {
        let lexer = new Lexer(this.src)
        this.tokens = lexer.tokenize()

        console.log(this.tokens)

        let program = new Program()

        while (!this.atEnd()) {
            program.body.push(this.parseStatement())
        }

        return program
    }

    parseVarDeclaration() {
        this.eat()

        let identifier = this.expect(TokenType.identifier)

        if (this.peek().type == TokenType.semi) {
            this.eat()
            return new VariableDeclaration("let", new Identifier(identifier.value), new NullLiteral())
        } else if (this.peek().type == TokenType.equals) {
            this.eat()
            let expr = this.parseExpression()

            this.expect(TokenType.semi)

            return new VariableDeclaration("let", new Identifier(identifier.value), expr)
        } else {
            console.log("Expected equals or semicolon in variable declaration.")
            process.exit(1)
        }
    }

    parseConstVarDeclaration() {
        this.eat()

        let identifier = this.expect(TokenType.identifier)

        this.expect(TokenType.equals)

        let expr = this.parseExpression()

        this.expect(TokenType.semi)
        return new VariableDeclaration("const", new Identifier(identifier.value), expr)
    }

    parsePrintStatement() {
        this.eat()

        let message = this.parseExpression()

        this.expect(TokenType.semi)

        return new PrintStatement(message)
    }

    parseBlockStatement() {
        this.expect(TokenType.leftBrace)

        let stmts = []

        while (this.peek().type != TokenType.rightBrace) {
            if (this.peek().type == TokenType.EOF) {
                console.log(`ERROR: Unexpected end of input`)
                process.exit(1)
            }

            stmts.push(this.parseStatement())
        }
        
        this.expect(TokenType.rightBrace)

        return new BlockStatement(stmts)
    }

    parseIfStatement() {

        this.eat()

        this.expect(TokenType.leftParen)
        let test = this.parseExpression()
        this.expect(TokenType.rightParen)

        let consequent = this.parseBlockStatement()

        if (this.peek().type != TokenType._else) {
            return new IfStatement(test, consequent, null)
        }

        this.eat() // eat the else

        let alternate;

        if (this.peek().type == TokenType._if) {
            alternate = this.parseIfStatement()
        } else {
            alternate = this.parseBlockStatement()
        }

        return new IfStatement(test, consequent, alternate)
    }

    parseWhileStatment() {
        //  {stmts}

        this.eat()

        this.expect(TokenType.leftParen)
        let test = this.parseExpression()
        this.expect(TokenType.rightParen)

        let body = this.parseBlockStatement()

        return new WhileStatement(test, body)
    }

    parseFunctionDeclaration() {
        // func name(args) {}
        this.eat()

        let id = this.expect(TokenType.identifier)
        id = new Identifier(id.value)

        let params = this.funcArgs()

        let body = []
        this.expect(TokenType.leftBrace)

        while (this.peek().type != TokenType.rightBrace) {
            body.push(this.parseStatement())
        }

        this.expect(TokenType.rightBrace)

        return new FunctionDeclaration(
            id,
            params,
            body
        )
    }

    parseReturnStatement() {
        this.eat()
        if (this.peek().type == TokenType.semi) {
            this.eat()
            return new ReturnStatement(new NullLiteral())
        }
        let argument = this.parseExpression()

        this.expect(TokenType.semi)

        return new ReturnStatement(argument)
    }

    parseImportStatement() {
        this.eat()

        let filename = this.expect(TokenType.identifier).value + ".mc"

        this.expect(TokenType.semi)

        return new ImportStatement(filename)
    }

    parseStatement() {
        switch (this.peek().type) {
            case TokenType._let:
                return this.parseVarDeclaration()
            
            case TokenType._const:
                return this.parseConstVarDeclaration()

            case TokenType._print:
                return this.parsePrintStatement()
            
            case TokenType._if:
                return this.parseIfStatement()
            
            case TokenType.leftBrace:
                return this.parseBlockStatement()

            case TokenType._while:
                return this.parseWhileStatment()

            case TokenType._func:
                return this.parseFunctionDeclaration()

            case TokenType._return:
                return this.parseReturnStatement()

            case TokenType._import:
                return this.parseImportStatement()

            
            default: {
                let expr = this.parseExpression()
                this.expect(TokenType.semi) // expect semicolon after standalone expressions
                return expr
            }
        }
    }

    parseExpression() {
        return this.parseAssignment()
    }

    parseAssignment() {
        let left = this.parseAnd()

        if (this.peek().type == TokenType.equals) {
            this.eat()
            let value = this.parseAssignment()
            return new AssignmentExpression(left, value)
        }

        return left
    }

    parseAnd() {
        let left = this.parseOr()

        while (this.peek().type == TokenType.and) {
            let operator = this.eat().value
            let right = this.parseOr()
            left = new BinaryExpression(operator, left, right)
        }

        return left;
    }

    parseOr() {
        let left = this.parseComparison()

        while (this.peek().type == TokenType.or) {
            let operator = this.eat().value
            let right = this.parseComparison()
            left = new BinaryExpression(operator, left, right)
        }

        return left;
    }

    parseComparison() {
        let left = this.parseAdditive()

        while (
            this.peek().type == TokenType.greaterthan ||
            this.peek().type == TokenType.lessthan ||
            this.peek().type == TokenType.greaterthanequal ||
            this.peek().type == TokenType.lessthanequal ||
            this.peek().type == TokenType.equalto ||
            this.peek().type == TokenType.notequal
        ) {
            let operator = this.eat().value
            let right = this.parseAdditive()
            left = new BinaryExpression(operator, left, right)
        }

        return left
    }

    parseAdditive() {
        let left = this.parseMultiplicative()

        while (this.peek().value == "+" || this.peek().value == "-") {
            let operator = this.eat().value
            let right = this.parseMultiplicative()
            left = new BinaryExpression(operator, left, right)
        }

        return left
    }

    parseMultiplicative() {
        let left = this.parseUnary()

        while (this.peek().value == "*" || this.peek().value == "/" || this.peek().value == "%") {
            let operator = this.eat().value
            let right = this.parseUnary()
            left = new BinaryExpression(operator, left, right)
        }

        return left
    }

    parseUnary() {
        if (this.peek().type == TokenType.not || this.peek().type == TokenType.minus) {
            let operator = this.eat().value
            let argument = this.parseUnary()
            return new UnaryExpression(operator, argument)
        }

        return this.parseMember()
    }

    parseMember() {
        let object = this.parseCall()

        while (this.peek().type == TokenType.leftBracket) {
            this.eat()
            let property = this.parseExpression()
            this.expect(TokenType.rightBracket)

            object = new MemberExpression(object, property)
        }

        return object
    }

    parseCall() {
        let callee = this.parsePrimary()
        let args;

        while (this.peek().type == TokenType.leftParen) {
            args = this.funcArgs()
            callee = new CallExpression(callee, args)
        }

        return callee
    }

    funcArgs() {
        // (arg1, arg2)
        this.eat()

        let args = []

        while (this.peek().type != TokenType.rightParen) {
            args.push(this.parseExpression())
            if (this.peek().type == TokenType.comma) {
                this.eat()
            }
        }

        this.eat()

        return args
    }  

    Array() {
        this.eat()

        let elements = []

        while (this.peek().type != TokenType.rightBracket) {
            elements.push(this.parseExpression())
            if (this.peek().type == TokenType.comma) {
                this.eat()
            }
        }

        this.eat()

        return new ArrayExpression(elements)
    }

    parsePrimary() {
        let token = this.peek()
        
        switch (token.type) {
            case TokenType.number:
                return new NumericLiteral(this.eat().value)

            case TokenType._null:
                return new NullLiteral(this.eat().value)
            
            case TokenType.identifier:
                return new Identifier(this.eat().value)
            
            case TokenType.leftParen: {
                this.eat()
                let value = this.parseExpression()
                this.expect(TokenType.rightParen)
                return value
            }

            case TokenType.string: {
                return new StringLiteral(this.eat().value)
            }

            case TokenType.leftBracket: {
                return this.Array()
            }

            default:
                console.log(`ERROR: Unexpected token: ${token.type}`)
                process.exit(1)
        }
    }
}

module.exports = { Parser }