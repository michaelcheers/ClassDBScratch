// JavaScript source code

function getHelloWorldTest() {
    return {
        "type": "native",
        "native": $if,
        "args": [
        {
            type: "native",
            "native": eq,
            args: [
                {
                    type: "literal",
                    literal: 7
                },
                {
                    type: "literal",
                    literal: 8
                }
            ]
        },
        {
            type: "function",
            blocks: [
                {
                    type: "native",
                    "native": alert,
                    args: [
                        {
                            type: "literal",
                            literal: "Hello World"
                        }
                    ]
                }
            ]
        },
        {
            type: "function",
            blocks: [
                {
                    type: "native",
                    "native": alert,
                    args: [
                        {
                            type: "literal",
                            literal: "Hello World 2"
                        }
                    ]
                },
                {
                    type: "native",
                    "native": alert,
                    args: [
                        {
                            type: "literal",
                            literal: "Hello World 3"
                        }
                    ]
                }
            ]
        }
        ]
    }
}

function $if(condition, consequent, alternate) {
    if (condition)
        consequent();
    else if (alternate)
        alternate();
}

function eq(a, b) {
    return a === b;
}

function lt(a, b) {
    return a < b;
}

function gt(a, b) {
    return a > b;
}

function leq(a, b) {
    return a <= b;
}

function geq(a, b) {
    return a >= b;
}

function compile(value) {
    return value;
}

function run(value) {
    switch (value.type) {
        case "literal":
            return value.literal;
        case "native":
            var tempArgs = value.args.map(function (v) {
                return run(v);
            });
            return value["native"].apply(null, tempArgs);
        case "function":
            return function () {
                for (var item of value.blocks)
                    run(item);
            };
        default:
            System.alert("Unknown node type " + value.type);
            return 0;
            break;
    }
}