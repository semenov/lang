var peg = require('pegjs');
var cg = require('escodegen');
var fs = require('fs');
var _ =require('underscore');
var rules = fs.readFileSync('lang.pegjs', 'utf-8');
var programCode = fs.readFileSync('program.txt', 'utf-8');
var util = require('util');


console.log('program [', '\n', programCode, '\n]\n');
var parser = peg.buildParser(rules);

try {
	var ast = parser.parse(programCode);

	console.log(JSON.stringify(ast, null, 4));

	//run(ast);
} catch (e) {
	if (e.name != 'SyntaxError') throw e;

	console.log('input [', programCode, ']');
	console.log('exception', e);
}