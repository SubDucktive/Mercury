const fs = require('fs')
const { Parser } = require("./parser")
const { evaluate } = require("./interpreter")
const { CreateGlobalEnv } = require('./enviornment')

if (process.argv.length - 2 == 0) {
    console.log("REPL mode not implemeneted yet.")
} else if (process.argv.length - 2 == 1) {
    // Ignore the shitty code plz
    let code;
    try {
        code = fs.readFileSync(process.argv[2], "utf8")
    } catch (err) {
        console.log(`Error reading file, error: ${err}`)
        process.exit(1)
    }

    let parser = new Parser(code)

    let ast = parser.parse()

    //console.log(JSON.stringify(ast, null, 4))

    let env = CreateGlobalEnv()

    evaluate(ast, env)
} else {
    console.log("What the fuck??")
    process.exit(1)
}
