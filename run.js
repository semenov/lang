var peg = require('pegjs');
var cg = require('escodegen');
var fs = require('fs');
var _ =require('underscore');
var rules = fs.readFileSync('lang.pegjs', 'utf-8');
var programCode = fs.readFileSync('program.txt', 'utf-8');
var util = require('util');

console.log("\n###### PROGRAM ######\n");
console.log(programCode, '\n');

var parser = peg.buildParser(rules);

var input = programCode;

function int(num) {
	return { type: 'int', value: num };
}

function atom(name) {
	return { type: 'atom', value: name };
}

function nil() {
	return atom('nil');
}

var io = {
	'print': function(params) {
		console.log.apply(null, _.pluck(expandAll(params), 'value'));
	}
};

var math = {
	'+': function(params) {
		var a = expand(params[0]).value;
		var b = expand(params[1]).value;

		return int(a + b);
	},

	'-': function(params) {
		var a = expand(params[0]).value;
		var b = expand(params[1]).value;
		return int(a - b);
	}
};

var core = {
	'>': function(params) {
		var a = expand(params[0]).value;
		var b = expand(params[1]).value;
		return a > b;
	},

	'<': function(params) {
		var a = expand(params[0]).value;
		var b = expand(params[1]).value;
		return a < b;
	},

	'dump': function(params) {
		var param = expand(params[0]);
		console.log(param.type + ': ' + param.value);
		return nil();
	},

	'def': function(params) {
		var name = params[0].value;
		var value = expand(params[1]);
		variables[name] = value;
		return value;
	},

	'get': function(params) {
		var name = params[0].value;
		return variables[name];
	}
};

var variables = {

};

var namespaces = {
	core: core,
	math: math,
	io: io
};

// var functions = {

// 	'fn': function(params) {
// 		var name = params.shift().value;
// 		var args = params.shift().value;
// 		//console.log('fn', name, args, params);
// 		functions[name] = function() {
// 			return _.last(expand(params));
// 		};
// 	}
// };

try {
	var ast = parser.parse(input);

	console.log("\n###### AST ######\n\n");
	console.log(util.inspect(ast, { depth: null, colors: true }));

	console.log("\n###### OUTPUT ######\n");
	run(ast);

	console.log("\n");
} catch (e) {
	if (e.name != 'SyntaxError') throw e;

	console.log('input [', input, ']');
	console.log('exception', e);
}

function action(arr) {
	return _.first(arr).value;
}

function data(arr) {
	return _.rest(arr);
}

function expandAll(params) {
	return _.map(params, expand);
}

function expand(param) {
	if (param.type == 'list') {
		return run(param);
	} else {
		return param;
	}
}

function die(msg) {
	console.error(msg);
	process.exit();
}

function resolveAction(name) {
	var ns = 'core';
	var parts = name.split('.');
	if (parts.length > 1) {
		ns = parts[0];
		name = parts[1];
	}

	var fn = namespaces[ns][name];
	return fn;
}

function run(item) {
	if (item.type == 'program') {
		_.each(item.value, run);
	} else if (item.type == 'list') {
		var name = action(item.value);
		var fn = resolveAction(name);

		var params = data(item.value);
		if (!fn) {
			die('Calling unknown function `' + name + '` on line #' + item.line);
		}

		return fn(params);
	}
}
