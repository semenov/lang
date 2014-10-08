module.exports = {
	functions: {
		print: {
			args: ['String'],
			fn: function(str) {
				console.log(str.value);
			}
		}
	}
};