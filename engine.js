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
        receivemessage: 5
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
    for (var item of value)
    {
        var eventName = item.name;
        var eventBody = item.body;
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
            System.alert("Unknown node type " + value.type);
            return 0;
            break;
    }
}