module.exports = {
	functions: {
		print: {
			args: ['String'],
			fn: function(str) {
				console.log(str.value);
			}
		},

		exec: {
			args: ['String'],
			fn: function(command) {
				var exec = require('child_process').exec;

				console.log(str.value);
			}
		}
	}
};