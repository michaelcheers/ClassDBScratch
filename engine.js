// JavaScript source code

ClassDBScratch = {};
ClassDBScratch.TypeError = function (value, expectedType) {
    this.message = "Expected " + expectedType + ", got " + typeof (value) + ".";
}
ClassDBScratch.TypeError.prototype = Error;
ClassDBScratch.Events =
    {
        greenflag: 0,
        redflag: 1,
        keypress: 2,
        keyrelease: 3,
        click: 4,
        receivemessage: 5,
        debugOnly: 6
    };

function checkTypes(values, expectedTypes) {
    for (var n = 0; n < values.length; n++) {
        var itemValue = values[n];
        var typeValue = expectedTypes[n];
        if (typeof (itemValue) != typeValue)
            throw new ClassDBScratch.TypeError(itemValue, typeValue);
    }
}

function $if(condition, consequent, alternate) {
    checkTypes([condition, consequent, alternate], ['boolean', 'function', 'function']);
    if (condition)
        consequent();
    else if (alternate)
        alternate();
}

function add(a, b) {
    checkTypes([a, b], ['number', 'number']);
    return a + b;
}

var localRegisters = [];
var globalRegisters = [];

function setRegister(local, number, setTo) {
    checkTypes([local, number], ['boolean', 'number']);
    var cRegister = local ? localRegisters : globalRegisters;
    cRegister[number] = setTo;
}

function eq(a, b) {
    checkTypes([a, b], ['number', 'number']);
    return a === b;
}

function lt(a, b) {
    checkTypes([a, b], ['number', 'number']);
    return a < b;
}

function gt(a, b) {
    checkTypes([a, b], ['number', 'number']);
    return a > b;
}

function leq(a, b) {
    checkTypes([a, b], ['number', 'number']);
    return a <= b;
}

function geq(a, b) {
    checkTypes([a, b], ['number', 'number']);
    return a >= b;
}

function compile(value) {
    var result = {events:[]};
    var globalRegisterLength = value.globalVariables.length;
    result.globalVariables = globalRegisterLength;
    for (var item of value.program)
    {
        var eventName = item.name;
        var eventData = item.data;
        var eventBody = compileBlocks(item.body, value);
        var eventNumber = ClassDBScratch.Events[eventName];
        result.events.push(
            {
                id: eventNumber,
                data: eventData,
                body: eventBody,
            });
    }
    return result;
}

function isFunction (value) {
    return typeof (value) === "function";
}

function arrayInit (size, value) {
    var arr = new Array(size),
        isFn = isFunction(value);

    for (var i = 0; i < size; i++) {
        arr[i] = isFn ? value() : value;
    }

    return arr;
}

function compileBlocks(value, program) {
    var result = {};
    var resultArray = [];
    var scope = {};
    for (var item of value) {
        resultArray.push(compileBlock(item, program, scope));
    }
    result.body = resultArray;
    result.variables = scope.declaredVariables.length;
    return result;
}

function compileBlock(value, program, scope) {
    var $t;
    switch (value.block)
    {
        case 'vardecl':
            return {
                "type": "native",
                "native": setRegister,
                "args":[true, scope.declaredVariables.push(value.name) - 1, ($t = value.setTo, $t != null ? $t : null)]
            };
        case 'setvar':
            return {
                "type": "native",
                "native": setRegister,
                "args":[$t = value.local, ($t ? scope.declaredVariables : program.globalVariables[value.name])[value.name], value.setTo]
            };
        default:
            return value;
    }
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
            System.alert("Unknown node type: " + value.type);
            return 0;
            break;
    }
}

function runBody(value) {
    localRegisters = arrayInit(value.variables, null);
    for (var item of value.body) {
        run(item);
    }
}

function runProgram(value) {
    globalRegisters = arrayInit(value.globalVariables, null);
    var events = value.events;
    for (var item of events) {
        if (item.id !== ClassDBScratch.Events.greenflag)
            throw new Error("Not Supported");
        runBody(item.body);
    }
}