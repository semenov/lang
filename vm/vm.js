var _ = require('lodash');

function object(type, data) {
	return {
		type: type,
		data: data
	};
}

var processors = {
	'print': function(args, context) {
		var param = evaluate(args[0], context);
		console.log(param.data);
	},

	'string': function(args) {
		return object('string', args[0]);
	},

	// Определить переменную
	'def': function(args, context) {
		var name = args[0];
		var value = args[1]

		context[name] = evaluate(value, context);
	},

	// Считать переменную
	'deref': function(args, context) {
		var name = args[0];
		return context[name];

	},

	'string.concat': function(args, context) {
		var concatString = evaluate(args[0], context).data + evaluate(args[1], context).data;
		return object('string', concatString);
	}
};

function run(program) {
	var context = {};
	_.each(program, function(expression) {
		evaluate(expression, context);
	});

}

function evaluate(expression, context) {
	var name = _.first(expression);
	var processor = processors[name];
	//console.log(expression, context);
	return processor(_.rest(expression), context);
}

module.exports = {run: run};
