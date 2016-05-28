// JavaScript source code

function getHelloWorldTest()
{
  return {
    "type":"native",
    "native":alert,
	"args":[{
	  "type":"literal",
	  "literal":"Hello, World!"
	}]
  }
}

function compile(value) {
    return value;
}

function run(value)
{
	switch(value.type)
	{
		case "literal":
			return value.literal;		
		case "native":
			var tempArgs = value.args.map(function(v){
				  return run(v);
				});
			return value["native"].apply(null,tempArgs);
		default:
			System.alert("Unknown node type "+value.type);
			return 0;
			break;
	}
}