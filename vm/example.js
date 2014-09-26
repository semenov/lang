var vm = require('./vm');

vm.run([
	['def', 'dog', ['string', 'Megatron']],
	['def', 'cat', ['string', 'Matroskin']],
	['def', 'long_string', ['string.concat', ['deref', 'dog'], ['deref', 'cat']]],
	['print', ['deref', 'long_string']]
]);