var fs = require('fs');

function parse(source) {
	var lines = source.split('\n');
	var indent = 0;
	var instructions = [];
	lines.forEach(function(line, lineNumber) {
		lineNumber++;
		var atoms = line.split(' ');
		instructions.push({
			type: 'call',
			method: atoms[0],
			arguments: atoms.slice(1)
		});
	});
	return instructions;
}

function load(filename) {
	return fs.readFileSync(filename, 'utf-8');
}

var vars = {
	'def': {
		type: 'function',
		content: function(name, value) {
			vars[name] = {
				type: 'variable',
				content: processArgument(value)
			};
		}
	},

	'print': {
		type: 'function',
		content: function(content) {
			console.log(processArgument(content));
		}
	},

	'concat': {
		type: 'function',
		content: function(name, value) {
			return str1 + str2;
		}
	},
};

function processArgument(argument) {
	if (argument[0] == "'") {
		return argument.slice(1, -1);
	} else 	if (argument[0] == "(") {
		return argument.slice(1, -1);
	} else {

		var v = vars[argument];
		if (v === undefined) {
			console.log('Variable (' + argument + ') is unknown');
			process.exit(1);
		}
		return v.content;
	}
}

function execute(instructions) {
	instructions.forEach(function(instruction) {
		//console.log(vars);
		var methodName = instruction.method;
		var arguments = instruction.arguments;
		var method = vars[methodName];
		if (!method) {
			console.log('Function (' + methodName + ') is unknown');
			process.exit(1);
		} else if (method.type != 'function') {
			console.log('Variable (' + methodName + ') is not a function');
			process.exit(1);
		} else {
			method.content.apply(null, arguments);
		}
	});
}

function run(filename) {
	var source = load(filename);
	var instructions = parse(source);
	var result = execute(instructions);
}

run('nano.txt');