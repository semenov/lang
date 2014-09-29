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
	= 'fn' _ name:Identifier '(' args:FunctionArguments? ')' returnType:ReturnType? _ block:Block {
		return {
			type: 'Function',
			name: name.value,
			arguments: args,
			returnType: returnType,
			line: line(),
			body: block
		}
	}

ReturnType
	= _ '->' _ type:CamelIdentifier {
		return type.value;
	}

FunctionArguments
	= first:Argument rest:NextArgument* {
		var args = [first];
		if (rest) {
			args = args.concat(rest);
		}

		return args;
	}

Argument
	= variable:Identifier type:ArgumentType? {
		return {
			type: 'Argument',
			name: variable.value,
			argumentType: type,
			line: line()
		};
	}

ArgumentType
	= ':' _ type:CamelIdentifier {
		return type.value;
	}

NextArgument
	= ',' _ argument:Argument {
		return argument;
	}

Identifier "identifier"
	= first:[a-z] rest:[a-z0-9_]* {
		return {
			type: 'Identifier',
			line: line(),
			value: first + rest.join('')
		}
	}

CamelIdentifier "camel case identifier"
	= first:[A-Z] rest:[A-Za-z0-9]* {
		return {
			type: 'CamelIdentifier',
			line: line(),
			value: first + rest.join('')
		}
	}

VariableDeclaration
	= 'let' _ variable:Identifier type:VariableType? value:VariableDeclarationAssignment? {
		return {
			type: 'VariableDeclaration',
			line: line(),
			variable: variable.value,
			variableType: type,
			value: value
		}
	}

VariableType
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
			type: 'If',
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
			type: 'While',
			line: line(),
			condition: condition,
			body: body
		}
	}

Variable
	= variable:Identifier {
		return {
			type: 'Variable',
			name: variable.value,
			line: line()
		}
	}

VariableAssignment
	= variable:Variable _ '=' _ value:Expression {
		return {
			type: 'VariableAssignment',
			variable: variable,
			value: value
		}
	}

True
	= 'true' {
		return {
			type: 'Bool',
			value: true,
			line: line()
		}
	}

False
	= 'false' {
		return {
			type: 'Bool',
			value: false,
			line: line()
		}
	}

Null
	= 'null' {
		return {
			type: 'Null',
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
			type: 'Float',
			line: line(),
			value: Number(text())
		};
	}

Integer "integer literal"
	= Digit+ {
		return {
			type: 'Integer',
			line: line(),
			value: Number(text())
		};
	}

Digit "digit"
	= [0-9]

String "string literal"
	= "'" str:[^']* "'" {
		return {
			type: 'String',
			line: line(),
			value: str.join('')
		};
	}

BinaryOperator
	= '+'
	/ '-'
	/ '*'
	/ '/'
	/ '>'
	/ '<'
	/ '>='
	/ '<='
	/ '=='
	/ '!='

BinaryOperation
	= left:SubExpression _ operator:BinaryOperator _ right:SubExpression {
		return {
			type: 'BinaryOperation',
			operator: operator,
			left: left,
			right: right,
			line: line()
		};
	}

StructDeclaration
	= 'struct' _ name:CamelIdentifier _ '{' __ '}' {
		return {
			type: 'StructDeclaration',
			name: name.value,
			line: line()
		};
	}

StructPropertiesDeclaration
	= property:(StructPropertyDeclaration EOS)+

StructPropertyDeclaration
	= name:Identifier ':' _ type:CamelIdentifier {
		return {
			type: 'StructPropertyDeclaration',
			name: name,
			type: type,
			line: line()
		};
	}

Block "code block"
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

Expression "expession"
	= String
	/ Float
	/ Integer
	/ VariableDeclaration
	/ If
	/ While
	/ Atom
	/ StructDeclaration
	/ BinaryOperation
	/ VariableAssignment
	/ Variable

SubExpression "expession"
	= String
	/ Float
	/ Integer
	/ Atom
	/ Variable
