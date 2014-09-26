start
	= program

program
	= exps:spacedexpression+ {
		return {
			type: 'program',
			line: line(),
			value: exps
		};
	}

expression
	= string
	/ float
	/ integer
	/ atom
	/ vector
	/ list

spacedexpression
	= space*  exp:expression space* {
		return exp
	}

space
	= ' '
	/ '\r'
	/ '\n'
	/ '\t'

float
	= digit+ '.' digit+ {
		return {
			type: 'float',
			line: line(),
			value: Number(text())
		};
	}

integer
	= digit+ {
		return {
			type: 'int',
			line: line(),
			value: Number(text())
		};
	}

digit
	= [0-9]

string
	= '"' str:[^"]* '"' {
		return {
			type: 'string',
			line: line(),
			value: str.join('')
		};
	}


atom
	= chars:validchar+ {
    	return {
    		type: 'atom',
    		line: line(),
    		value: chars.join("")
    	};
    }

validchar
    = [0-9a-zA-Z_?!+\-=@#$%^&*/<>:.]

vector
	= '[' exps:spacedexpression* ']' {
		return {
			type: 'vector',
			line: line(),
			value: exps
		};
	}

list
	= '(' exps:spacedexpression* ')' {
		return {
			type: 'list',
			line: line(),
			value: exps
		};
	}