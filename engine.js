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

function div(a, b) {
    checkTypes([a, b], ['number', 'number']);
    return a / b;
}

function mul(a, b) {
    checkTypes([a, b], ['number', 'number']);
    return a * b;
}

function sub(a, b) {
    checkTypes([a, b], ['number', 'number']);
    return a - b;
}

function concat(a, b) {
    checkTypes([a, b], ['string', 'string']);
    return a + b;
}

var localRegisters = [];
var globalRegisters = [];

function setRegister(local, number, setTo) {
    checkTypes([local, number], ['boolean', 'number']);
    var cRegister = local ? localRegisters : globalRegisters;
    cRegister[number] = setTo;
}

function getRegister(local, number) {
    checkTypes([local, number], ['boolean', 'number']);
    return (local ? localRegisters : globalRegisters)[number];
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
    for (var item of value.events)
    {
        var eventName = item.name;
        var eventData = item.data;
        var eventBody = compileBlocks(item.body, value);
        var eventNumber = ClassDBScratch.Events[eventName];
        result.events.push(
            {
                id: eventNumber,
                data: eventData,
                body: eventBody
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
    var resultArray = [];
    var scope = {declaredVariables:[]};
    for (var item of value)
        resultArray.push(compileBlock(item, program, scope));
    return {
    	body:resultArray,
    	variables:scope.declaredVariables.length
    };
}

function literalise(v) {
    return {
        literal: v,
        type:'literal'
    }
}

function compileBlock(value, program, scope) {
    var $t;
    switch (value.type)
    {
        case 'vardecl':
            return {
                "type": "native",
                "native": setRegister,
                "args": [true, scope.declaredVariables.push(value.name) - 1].map(literalise).concat([($t = value.setTo, $t != null ? $t : null)])
            };
        case 'getvar':
            return {
                type: "native",
                "native": getRegister,
                args: [($t = value.local), ($t ? scope.declaredVariables : program.globalVariables).indexOf(value.name)].map(literalise)
            };
        case 'setvar':
            return {
                "type": "native",
                "native": setRegister,
                "args":[$t = value.local, ($t ? scope.declaredVariables : program.globalVariables).indexOf(value.name), value.setTo].map(literalise)
            };
        case 'native':
            var valueCopy = merge({}, value);
            valueCopy.args = valueCopy.args.map(function (v) { return compileBlock(v, program, scope); });
            return valueCopy;
        case 'ifStatement':
            return {
                type: 'native',
                native: $if,
                args: [value.condition, value.consequent, value.alternate]
            };
        default:
            return value;
    }
}

function isArray (obj) {
    return Object.prototype.toString.call(obj) in {
        "[object Array]": 1,
        "[object Uint8Array]": 1,
        "[object Int8Array]": 1,
        "[object Int16Array]": 1,
        "[object Uint16Array]": 1,
        "[object Int32Array]": 1,
        "[object Uint32Array]": 1,
        "[object Float32Array]": 1,
        "[object Float64Array]": 1
    };
}

function merge (to, from, elemFactory) {
    // Maps instance of plain JS value or Object into Bridge object. 
    // Used for deserialization. Proper deserialization requires reflection that is currently not supported in Bridge. 
    // It currently is only capable to deserialize:
    // -instance of single class or primitive
    // -array of primitives 
    // -array of single class           

    var key,
        i,
        value,
        toValue,
        fn;

    if (isArray(from) && isFunction(to.add || to.push)) {
        fn = isArray(to) ? to.push : to.add;

        for (i = 0; i < from.length; i++) {
            var item = from[i];

            if (!isArray(item)) {
                item = [typeof elemFactory === 'undefined' ? item : merge(elemFactory(), item)];
            }

            fn.apply(to, item);
        }
    } else {
        for (key in from) {
            value = from[key];

            if (typeof to[key] === "function") {
                if (key.match(/^\s*get[A-Z]/)) {
                    Bridge.merge(to[key](), value);
                } else {
                    to[key](value);
                }
            } else {
                var setter = "set" + key.charAt(0).toUpperCase() + key.slice(1);

                if (typeof to[setter] === "function" && typeof value !== "function") {
                    to[setter](value);
                } else if (value && value.constructor === Object && to[key]) {
                    toValue = to[key];
                    Bridge.merge(toValue, value);
                } else {
                    to[key] = value;
                }
            }
        }
    }

    return to;
}

function run(value) {
    switch (value.type) {
        case "literal":
            return value.literal;
        case "native":
            if (value.run === void 0) value.run = true;
            var tempArgs = value.run ? value.args.map(function (v) {
                return run(v);
            }) : value.args;
            var $t;
            return value.native.apply(($t = value.specialApply, $t != null ? $t : null), tempArgs);
        case "function":
            return function () {
                value.blocks.forEach(run);
            };
        default:
            throw new Error("Unknown node type: " + value.type);
    }
}

function runBody(value) {
    localRegisters = arrayInit(value.variables, null);
    value.body.forEach(run);
}

function runProgram(value) {
    globalRegisters = arrayInit(value.globalVariables, null);
    var events = value.events;
    for (var rItem of events) {
       (function (item) {
            switch (item.id) {
                case ClassDBScratch.Events.greenflag:
                    runBody(item.body);
                    break;
                case ClassDBScratch.Events.keypress:
                    var keyDown = function () {
                        var itemBody = item.body;
                        var itemData0 = item.data[0];
                        document.body.addEventListener('keydown', function (event) {
                            if (itemData0 === -1 || event.keyCode === itemData0)
                                runBody(itemBody);
                        });
                    }
                    if (document.body)
                        keyDown();
                    else
                        addOnLoad(keyDown);
                    break;
                case ClassDBScratch.Events.keyrelease:
                    var keyDown = function (itemBody, itemData0) {
                        document.body.addEventListener('keyup', function (event) {
                            if (itemData0 === -1 || event.keyCode === itemData0)
                                runBody(itemBody);
                        });
                    }
                    if (document.body)
                        keyDown(item.body, item.data[0]);
                    else
                        addOnLoad(function () {
                            keyDown(item.body, item.data[0]);
                        });
                    break;
                case ClassDBScratch.Events.debugOnly:
                    break;
                default:
                    var name = item.id;
                    for (var key in ClassDBScratch.Events) {
                        var value = ClassDBScratch.Events[key];
                        if (value === item.id)
                            name = key;
                    }
                    throw new Error("Event not supported: " + name + ".");
            }
        })(rItem);
    }
}

var onLoads = [];

function addOnLoad(value) {
    onLoads.push(value);
    if (!window.onload)
        window.onload = function () {
            onLoads.forEach(function (v) {
                v();
            });
        };
}