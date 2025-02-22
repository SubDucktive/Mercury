function isNumeric(char) {
    return char >= "0" && char <= "9"
}

function isAlpha(char) {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z')
}

function isAlphaNumeric(char) {
    return isNumeric(char) || isAlpha(char)
}

function isWhitespace(char) {
    return char == " " || char == "\t" || char == "\n"
}

const TokenType = {
    plus:       "plus",
    minus:      "minus",
    mult:       "mult",
    div:        "div",
    mod:        "mod",
    leftParen:  "leftParen",
    rightParen: "rightParen",
    semi: "semi",
    equals: "equals",
    string: "string",
    leftBrace: "leftBrace",
    rightBrace: "rightBrace",
    leftBracket: "leftBracket",
    rightBracket: "rightBracket",
    comma: "comma",


    number:     "number",
    identifier: "identifier",  

    // Relation operators

    equalto: "equalto", // == D
    notequal: "notequal", // != D
    greaterthan: "greaterthan", // > D
    lessthan: "lessthan", // < D
    greaterthanequal: "greaterthanequal", // >=
    lessthanequal: "lessthanequal", // <=

    // Unary operators

    not: "not",

    //keywords

    _let: "let",
    _const: "const",
    _print: "print",
    _if: "if",
    _else: "else",
    _while: "while",
    _func: "func",
    _return: "return",

    //eof
    EOF:        "EOF"
}

class Token {
    constructor(type, value) {
        this.type = type
        this.value = value
    }
}

class Lexer {
    constructor(src) {
        this.src = src

        this.index = 0
        this.tokens = []
    }

    eat() {
        return this.src[this.index++]
    }

    peek(ahead = 0) {
        return this.src[this.index + ahead]
    }

    atEnd() {
        return !this.peek()
    }

    tokenize() {
        while (!this.atEnd()) {
            if (this.peek() == "(") {
                this.tokens.push(new Token(TokenType.leftParen, this.eat()))
            } else if (this.peek() == ")") {
                this.tokens.push(new Token(TokenType.rightParen, this.eat()))
            } else if (this.peek() == "+") {
                this.tokens.push(new Token(TokenType.plus, this.eat()))
            } else if (this.peek() == "-") {
                this.tokens.push(new Token(TokenType.minus, this.eat()))
            } else if (this.peek() == "*") {
                this.tokens.push(new Token(TokenType.mult, this.eat()))
            } else if (this.peek() == "/") {
                if (this.peek(1) == "/") {
                    while (this.peek() != "\n" && this.peek(1)) {
                        this.eat()
                    }
                    this.eat()
                } else {
                    this.tokens.push(new Token(TokenType.div, this.eat()))
                }
            } else if (this.peek() == "%") {
                this.tokens.push(new Token(TokenType.mod, this.eat()))
            } else if (this.peek() == ";") {
                this.tokens.push(new Token(TokenType.semi, this.eat()))
            } else if (this.peek() == "{") {
                this.tokens.push(new Token(TokenType.leftBrace, this.eat()))
            } else if (this.peek() == "}") {
                this.tokens.push(new Token(TokenType.rightBrace, this.eat()))
            } else if (this.peek() == "[") {
                this.tokens.push(new Token(TokenType.leftBracket, this.eat()))
            } else if (this.peek() == "]") {
                this.tokens.push(new Token(TokenType.rightBracket, this.eat()))
            } else if (this.peek() == ",") {
                this.tokens.push(new Token(TokenType.comma, this.eat()))
            } else if (this.peek() == ">") {
                this.eat()

                if (this.peek() == "=") {
                    this.tokens.push(new Token(TokenType.greaterthanequal, ">="))
                    this.eat()
                } else {
                    this.tokens.push(new Token(TokenType.greaterthan, ">"))
                }
            } else if (this.peek() == "<") {
                this.eat()

                if (this.peek() == "=") {
                    this.tokens.push(new Token(TokenType.lessthanequal, "<="))
                    this.eat()
                } else {
                    this.tokens.push(new Token(TokenType.lessthan, "<"))
                }
            }
            
            
            else if (this.peek() == "=") {
                this.eat()

                if (this.peek() == "=") {
                    this.tokens.push(new Token(TokenType.equalto, "=="))
                    this.eat()
                } else {
                    this.tokens.push(new Token(TokenType.equals, "="))
                }
            } else if (this.peek() == "!") {
                this.eat()
                if (this.peek() == "=") {
                    this.tokens.push(new Token(TokenType.notequal, "!="))
                    this.eat()
                } else {
                    this.tokens.push(new Token(TokenType.not, "!"))
                }
            }
            
            else if (this.peek() == "\"") {
                let string = ""
                this.eat()
                while (this.peek() && this.peek() != "\"") {
                    if (!this.src[this.index + 1]) {
                        console.log("ERROR: Unterminated string")
                        process.exit(1)
                    }
                    if (this.peek() == "\\") {
                        this.eat()
                        switch (this.peek()) {
                            case "n": {
                                string += "\n"
                                this.eat()
                                break
                            }
                            case "\\": {
                                string += "\\"
                                this.eat()
                                break
                            }
                        }
                    } else {
                        string += this.eat()
                    }
                    
                }
                this.eat()

                this.tokens.push(new Token(TokenType.string, string))
            }
            
            else if (isNumeric(this.peek()) || this.peek() == ".") {
                let number = this.eat()
                let isFloat = false
                while (isNumeric(this.peek()) || this.peek() == ".") {
                    if (this.peek() == ".") {
                        if (isFloat) {
                            console.log(`Cannot have 2 '.'s in one number dumbass`)
                            process.exit(1)
                        }
                        isFloat = true
                    }
                    number += this.eat()
                }
                this.tokens.push(new Token(TokenType.number, Number(number)))
            } else if (isAlpha(this.peek())) {
                let symbol = this.eat()

                while (isAlphaNumeric(this.peek())) {
                    symbol += this.eat()
                }

                switch (symbol) {
                    case "let":
                        this.tokens.push(new Token(TokenType._let, symbol))
                        break

                    case "const":
                        this.tokens.push(new Token(TokenType._const, symbol))
                        break

                    case "print":
                        this.tokens.push(new Token(TokenType._print, symbol))
                        break

                    case "if":
                        this.tokens.push(new Token(TokenType._if, symbol))
                        break
                    
                    case "else":
                        this.tokens.push(new Token(TokenType._else, symbol))
                        break

                    case "while":
                        this.tokens.push(new Token(TokenType._while, symbol))
                        break

                    case "func":
                        this.tokens.push(new Token(TokenType._func, symbol))
                        break

                    case "return":
                        this.tokens.push(new Token(TokenType._return, symbol))
                        break

                    default:
                        this.tokens.push(new Token(TokenType.identifier, symbol))
                }
                
            } else if (isWhitespace(this.peek())) {
                this.eat()
            } else {
                console.log(`ERROR: Unexpected character: '${this.peek()}'`)
                process.exit(1)
            }
        }

        this.tokens.push(new Token(TokenType.EOF, "EOF"))
        return this.tokens
    }
}

module.exports = { Lexer, TokenType }