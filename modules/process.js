module.exports = {
	functions: {
		arguments: {
			args: [],
			fn: function() {
				return {
					type: 'Array',
					value: process.argv
				}
			}
		},
		exit: {
			args: ['Int'],
			fn: function(code) {
				process.exit(code.value);
			}
		},
	}
};