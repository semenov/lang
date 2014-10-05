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

	if (node.type == 'Variable') {
		if (!_.has(context, node.name)) {
			throw {
				name: 'UnknownVariable',
				line: node.line,
				data: node
			};
		}

		var value = context[node.name].value;

		return {
			type: value.type,
			value: value.value
		};
	}

	if (node.type == 'BinaryOperation' && node.operator == '==') {
		var left = evaluate(node.left);
		var right = evaluate(node.right);

		return {
			type: 'Bool',
			value: left.type == right.type && left.value == right.value
		};
	}

	if (node.type == 'BinaryOperation' && node.operator == '!=') {
		var left = evaluate(node.left);
		var right = evaluate(node.right);

		return {
			type: 'Bool',
			value: left.type != right.type || left.value != right.value
		};
	}

	if (node.type == 'BinaryOperation' && node.operator == '&&') {
		var left = evaluate(node.left);
		var right = evaluate(node.right);

		if (left.type != 'Bool' || right.type != 'Bool') {
			throw {
				name: 'TypeMismatch',
				line: node.line,
				data: node
			};
		}

		return {
			type: 'Bool',
			value: left.value && right.value
		};
	}

	if (node.type == 'BinaryOperation' && node.operator == '||') {
		var left = evaluate(node.left);
		var right = evaluate(node.right);

		if (left.type != 'Bool' || right.type != 'Bool') {
			throw {
				name: 'TypeMismatch',
				line: node.line,
				data: node
			};
		}

		return {
			type: 'Bool',
			value: left.value || right.value
		};
	}

	function arithmeticOperation(node, fn) {
		var left = evaluate(node.left);
		var right = evaluate(node.right);

		var typesOk = (left.type == 'Int' || left.type == 'Float') &&
			(right.type == 'Int' || right.type == 'Float');

		if (!typesOk) {
			throw {
				name: 'TypeMismatch',
				line: node.line,
				data: node
			};
		}

		var returnType;

		if (left.type == 'Float' || right.type == 'Float') {
			returnType = 'Float';
		} else {
			returnType = 'Int';
		}

		return {
			type: returnType,
			value: fn(left.value, right.value)
		};
	}

	if (node.type == 'BinaryOperation' && node.operator == '+') {
		return arithmeticOperation(node, function(left, right) { return left + right });
	}

	if (node.type == 'BinaryOperation' && node.operator == '-') {
		return arithmeticOperation(node, function(left, right) { return left - right });
	}

	if (node.type == 'BinaryOperation' && node.operator == '*') {
		return arithmeticOperation(node, function(left, right) { return left * right });
	}


	function comparisonOperation(node, fn) {
		var left = evaluate(node.left);
		var right = evaluate(node.right);

		var typesOk = (left.type == 'Int' || left.type == 'Float') &&
			(right.type == 'Int' || right.type == 'Float');

		if (!typesOk) {
			throw {
				name: 'TypeMismatch',
				line: node.line,
				data: node
			};
		}

		return {
			type: 'Bool',
			value: fn(left.value, right.value)
		};
	}

	if (node.type == 'BinaryOperation' && node.operator == '>') {
		return comparisonOperation(node, function(left, right) { return left > right });
	}

	if (node.type == 'BinaryOperation' && node.operator == '>=') {
		return comparisonOperation(node, function(left, right) { return left >= right });
	}

	if (node.type == 'BinaryOperation' && node.operator == '<') {
		return comparisonOperation(node, function(left, right) { return left < right });
	}

	if (node.type == 'BinaryOperation' && node.operator == '<=') {
		return comparisonOperation(node, function(left, right) { return left <= right });
	}

	if (node.type == 'If') {
		var condition = evaluate(node.condition);

		if (condition.type != 'Bool') {
			throw {
				name: 'TypeMismatch',
				line: node.line,
				data: node
			};
		}

		var chosenNode = (condition.value ? node.trueCase : node.falseCase);

		return evaluate(chosenNode);
	}


	if (node.type == 'While') {
		while (true) {
			var condition = evaluate(node.condition);
			if (condition.type != 'Bool') {
				throw {
					name: 'TypeMismatch',
					line: node.line,
					data: node
				};
			}

			if (condition.value) {
				evaluate(node.body);
			} else {
				break;
			}
		}

		return null;
	}


	if (node.type == 'Block') {
		_.each(node.instructions, evaluate);
		return null;
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

		if (variable.type && variable.type != value.type) {
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