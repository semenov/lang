Start
	= Program

Program
	= fns:Function+ {
		return {
			type: 'program',
			line: line(),
			statements: fns
		}
	}

WhiteSpace "whitespace"
  = '\t'
  / '\v'
  / '\f'
  / ' '
  / '\u00A0'
  / '\uFEFF'

LineTerminator
  = [\n\r\u2028\u2029]

LineTerminatorSequence "end of line"
  = '\n'
  / '\r\n'
  / '\r'
  / '\u2028'
  / '\u2029'

__
  = (WhiteSpace / LineTerminatorSequence)*

_
  = WhiteSpace*


EOS
	= __ ';'
	/ _ LineTerminatorSequence
	/ _ &'}'
	/ __ EOF

EOF
 	= !.

Function
	= 'fn' _ name:Identifier _ block:Block {
		return {
			type: 'function',
			name: name,
			line: line(),
			body: block
		}
	}

Identifier
	= first:[a-z] rest:[a-z0-9-]* {
		return {
			type: 'identifier',
			line: line(),
			value: first + rest.join('')
		}
	}

Float
	= Digit+ '.' Digit+ {
		return {
			type: 'float',
			line: line(),
			value: Number(text())
		};
	}

Integer
	= Digit+ {
		return {
			type: 'float',
			line: line(),
			value: Number(text())
		};
	}

Digit
	= [0-9]

String
	= "'" str:[^']* "'" {
		return {
			type: 'string',
			line: line(),
			value: str.join('')
		};
	}

Block
	= '{' __ body:(StatementList __)? '}' {
		return {
			type: 'BlockStatement',
			body: body[0]
		};
    }

StatementList
	= first:Statement rest:(__ Statement)* {
		var result = [];
		result.push(first);
		rest.forEach(function(item) {
			result.push(item[1]);
		});

		return {
			type: 'StatementList',
			line: line(),
			value: result
		};
	}

Statement
	= ExpressionStatement

ExpressionStatement
	= exp:Expression EOS {
		return exp;
	}

Expression
	= String
	/ Float
	/ Integer
