var peg = require('pegjs');
var cg = require('escodegen');
var fs = require('fs');
var _ =require('underscore');
var rules = fs.readFileSync('lang.pegjs', 'utf-8');
var programFile = process.argv[2] || 'program.txt';
var programCode = fs.readFileSync(programFile, 'utf-8');
var util = require('util');

console.log('=== Program ===', '\n');
console.log(programCode, '\n\n');

var parser = peg.buildParser(rules);
var context = {};

try {
	var ast = parser.parse(programCode);

	console.log('=== Syntax tree ===', '\n');
	console.log(util.inspect(ast, { depth: null, colors: true }));
	console.log('\n');

	evaluate(ast);

	console.log('=== Context ===', '\n');
	console.log(util.inspect(context, { depth: null, colors: true }));
	console.log('\n');
} catch (e) {
	console.log('=== Error ===', '\n');
	console.log(util.inspect(e, { depth: null, colors: true }));
}

function evaluate(node) {
	if (node.type == 'Program') {
		_.each(node.instructions, evaluate);
		return null;
	}

	if (node.type == 'String') {
		return {
			type: node.type,
			value: node.value
		};
	}

	if (node.type == 'Int') {
		return {
			type: node.type,
			value: node.value
		};
	}

	if (node.type == 'Float') {
		return {
			type: node.type,
			value: node.value
		};
	}

	if (node.type == 'Bool') {
		return {
			type: node.type,
			value: node.value
		};
	}

	if (node.type == 'VariableDeclaration') {
		var type = node.variableType;
		var value = evaluate(node.value);

		if (type && value && type != value.type) {
			throw {
				name: 'TypeMismatch',
				line: node.line,
				data: node
			};
		}

		context[node.variable] = {
			type: node.variableType,
			value: value
		};

		return value;
	}

	if (node.type == 'VariableAssignment') {
		var variableName = node.variable.name;
		var value = evaluate(node.value);

		if (!_.has(context, variableName)) {
			throw {
				name: 'UnknownVariable',
				line: node.line,
				data: node
			};
		}

		var variable = context[variableName];

		if (variable.type != value.type) {
			throw {
				name: 'TypeMismatch',
				line: node.line,
				data: node
			};
		}

		variable.value = value;

		return value;
	}


}