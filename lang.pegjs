Start
	= Program

Program
	= statements:(TopLevelStatementSpaced)* {
		return {
			type: 'program',
			line: line(),
			instructions: statements
		}
	}

TopLevelStatementSpaced
	= __ statement:TopLevelStatement __ {
		return statement;
	}

TopLevelStatement
	= Function
	/ Statement

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

Function "function declaration"
	= 'fn' _ name:Identifier arguments:ArgumentsDeclaration _ block:Block {
		return {
			type: 'function',
			name: name,
			line: line(),
			body: block
		}
	}

ArgumentsDeclaration
	= '(' ')' {
		return {
			type: 'arguments_declaration',
			line: line()
		}
	}

Identifier "identifier"
	= first:[a-z] rest:[a-z0-9_]* {
		return {
			type: 'identifier',
			line: line(),
			value: first + rest.join('')
		}
	}

CamelIdentifier "camel case identifier"
	= first:[A-Z] rest:[A-Za-z0-9]* {
		return {
			type: 'camel_identifier',
			line: line(),
			value: first + rest.join('')
		}
	}

VariableDeclaration
	= 'let' _ variable:Identifier type:VariableDeclarationType? value:VariableDeclarationAssignment? {
		return {
			type: 'variable_declaration',
			line: line(),
			variable: variable.value,
			variableType: type,
			value: value
		}
	}

VariableDeclarationType
	= ':' _ type:CamelIdentifier {
		return type.value;
	}

VariableDeclarationAssignment
	= _ '=' __ value:Expression {
		return value;
	}

If
	= 'if' _ condition:Expression _ trueCase:Block falseCase:Else? {
		return {
			type: 'if',
			line: line(),
			condition: condition,
			trueCase: trueCase,
			falseCase: falseCase
		}
	}

Else
	= _ 'else' _ body:( Block / If ) {
		return body;
	}

While
	= 'while' _ condition:Expression _ body:Block {
		return {
			type: 'while',
			line: line(),
			condition: condition,
			body: body
		}
	}

Variable
	= variable:Identifier {
		return {
			type: 'variable',
			name: variable.value,
			line: line()
		}
	}

VariableAssignment
	= variable:Variable _ '=' _ value:Expression {
		return {
			type: 'variable_assignment',
			variable: variable,
			value: value
		}
	}

True
	= 'true' {
		return {
			type: 'bool',
			value: true,
			line: line()
		}
	}

False
	= 'false' {
		return {
			type: 'bool',
			value: false,
			line: line()
		}
	}

Null
	= 'null' {
		return {
			type: 'null',
			line: line()
		}
	}

Atom
	= Null
	/ True
	/ False

Float "float literal"
	= Digit+ '.' Digit+ {
		return {
			type: 'float',
			line: line(),
			value: Number(text())
		};
	}

Integer "integer literal"
	= Digit+ {
		return {
			type: 'int',
			line: line(),
			value: Number(text())
		};
	}

Digit "digit"
	= [0-9]

String "string literal"
	= "'" str:[^']* "'" {
		return {
			type: 'string',
			line: line(),
			value: str.join('')
		};
	}


Block "code block"
	= '{' __ body:(StatementList __)? '}' {
		return {
			type: 'block_statement',
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
			type: 'statement_list',
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

Expression "expession"
	= String
	/ Float
	/ Integer
	/ VariableDeclaration
	/ If
	/ While
	/ Atom
	/ VariableAssignment
	/ Variable
