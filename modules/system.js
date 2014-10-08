var q = require('kew');

module.exports = {
	functions: {
		exec: {
			args: ['String'],
			fn: function(command) {
				var exec = require('child_process').exec;
				return q.nfcall(exec, command.value).then(function(stdout) {
					return {
						type: 'String',
						value: stdout
					};
				});
			}
		}
	}
};


