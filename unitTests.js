// JavaScript source code
/// <reference path = "engine.js" />

function setUnitReg(value) {
    registers.push(value);
}

function areArraysEqual(a, b) {
    var cLength;
    if ((cLength = a.length) !== b.length) return false;
    for (var n = 0; n < cLength; n++) {
        if (a[n] !== b[n]) return false;
    }
    return true;
}

function assertArrayEqual(value, assert) {
    if (assert === void 0) assert = "Assert failed.";
    if (!areArraysEqual(registers, value)) document.writeln(assert);
}

var registers = [];

function clearRegister() {
    registers = [];
}

var unitTests = [
    function () {
        var code = {
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
                        "native": setUnitReg,
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
                        "native": setUnitReg,
                        args: [
                            {
                                type: "literal",
                                literal: "Hello World 2"
                            }
                        ]
                    },
                    {
                        type: "native",
                        "native": setUnitReg,
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
        };
        run(code);
        assertArrayEqual(["Hello World 2", "Hello World 3"], "If else not working.");
    },
    function () {
        var code =
            {
                type: "native",
                native: setUnitReg,
                args: [
                {
                    type: "literal",
                    literal: "Hello World"
                }]
            };
        run(code);
        assertArrayEqual(["Hello World"], "Hello World not working.");
    },
    function () {
        var code =
            {
                globalVariables: [],
                events: [{
                    name: 'greenflag',
                    data: []
                , body: [{ "native": setUnitReg, args: [{ type: 'literal', literal: "hello world" }], type: "native" }]
                }
                ]
            };
        runProgram(compile(code));
        assertArrayEqual(["hello world"], "hello world not working.");
    },
    function () {
        var code =
            {
                globalVariables: [],
                events: [
                    {
                        name: 'greenflag',
                        data: [],
                        body:
                        [
                            {
                                name: "v",
                                setTo:
                                    {
                                        literal: "hello world",
                                        type: "literal"
                                    },
                                type: "vardecl"
                            },
                            {
                                type: "native",
                                native: setUnitReg,
                                args: [
                                    {
                                        type: "getvar",
                                        name: "v",
                                        local:true
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };
        runProgram(compile(code));
        assertArrayEqual(['hello world']);
    },
    function () {
        var code =
            {
                globalVariables: ['v'],
                events: [
                    {
                        name: 'greenflag',
                        data: [],
                        body: [
                            {
                                type: 'setvar',
                                local: false,
                                name: 'v',
                                setTo: 'hello world'
                            },
                            {
                                type: 'native',
                                native: setUnitReg,
                                args: [
                                    {
                                        type: 'getvar',
                                        name: 'v',
                                        local: false
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };
        runProgram(compile(code));
        assertArrayEqual(['hello world']);
    }
];
for (let item of unitTests)
{
    item();
    clearRegister();
}