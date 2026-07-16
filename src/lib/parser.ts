/**
 * A tiny, forgiving parser for a single Java constructor call:
 *
 *     Pizza pizza = new Pizza("large", "tomato", "pepperoni", "mushroom");
 *
 * We do NOT run Java. We only read the `new Pizza(...)` call, pull out the
 * String arguments, and turn them into a plain object the UI can render.
 *
 * The whole point is teaching: so when the student's code doesn't fit the
 * expected shape, we return a friendly, specific error instead of nothing.
 */

export type ParsedPizza = {
	size: string;
	sauce: string;
	toppings: string[];
	/** the raw string arguments, in the order they were written */
	args: string[];
};

export type ParseResult =
	| { ok: true; pizza: ParsedPizza }
	| { ok: false; error: string; hint?: string };

/** Remove `// line comments` so students can annotate their code freely. */
function stripLineComments(code: string): string {
	return code
		.split('\n')
		.map((line) => {
			// naive but fine here: cut at // unless it's inside a string
			let inString = false;
			for (let i = 0; i < line.length; i++) {
				const c = line[i];
				if (c === '"' && line[i - 1] !== '\\') inString = !inString;
				if (!inString && c === '/' && line[i + 1] === '/') return line.slice(0, i);
			}
			return line;
		})
		.join('\n');
}

/**
 * Starting at the index of an opening '(', return the index of its matching
 * ')', ignoring parentheses that appear inside string literals. Returns -1 if
 * no match is found (unbalanced).
 */
function findMatchingParen(code: string, openIndex: number): number {
	let depth = 0;
	let inString = false;
	for (let i = openIndex; i < code.length; i++) {
		const c = code[i];
		if (inString) {
			if (c === '\\') i++; // skip escaped char
			else if (c === '"') inString = false;
			continue;
		}
		if (c === '"') inString = true;
		else if (c === '(') depth++;
		else if (c === ')') {
			depth--;
			if (depth === 0) return i;
		}
	}
	return -1;
}

/** Split a constructor's argument string on top-level commas (respecting strings). */
function splitArgs(argString: string): string[] {
	const parts: string[] = [];
	let current = '';
	let inString = false;
	for (let i = 0; i < argString.length; i++) {
		const c = argString[i];
		if (inString) {
			current += c;
			if (c === '\\') {
				current += argString[++i] ?? '';
			} else if (c === '"') {
				inString = false;
			}
			continue;
		}
		if (c === '"') {
			inString = true;
			current += c;
		} else if (c === ',') {
			parts.push(current);
			current = '';
		} else {
			current += c;
		}
	}
	parts.push(current);
	return parts;
}

/** Turn one raw argument token into its String value, or explain what's wrong. */
function readStringLiteral(token: string): { ok: true; value: string } | { ok: false; error: string; hint?: string } {
	const t = token.trim();
	if (t === '') {
		return { ok: false, error: 'There is an empty argument (an extra comma?).' };
	}
	if (t.startsWith("'")) {
		return {
			ok: false,
			error: `${t} uses single quotes.`,
			hint: 'In Java, text (a String) goes in double quotes: "pepperoni". Single quotes are only for a single char.'
		};
	}
	if (!t.startsWith('"')) {
		return {
			ok: false,
			error: `${t} is not text.`,
			hint: 'Every argument must be a String in double quotes, e.g. "large".'
		};
	}
	// starts with a quote — make sure it's a single, closed string
	let inString = false;
	let value = '';
	for (let i = 0; i < t.length; i++) {
		const c = t[i];
		if (c === '"' && t[i - 1] !== '\\') {
			inString = !inString;
			continue;
		}
		if (inString) value += c;
	}
	if (inString) {
		return { ok: false, error: `${t} is missing its closing quote (").` };
	}
	return { ok: true, value };
}

export function parsePizza(code: string): ParseResult {
	const cleaned = stripLineComments(code);

	// Find a `new <ClassName>(` instantiation.
	const newMatch = cleaned.match(/new\s+([A-Za-z_]\w*)\s*\(/);

	if (!newMatch) {
		if (/\bPizza\s*\(/.test(cleaned)) {
			return {
				ok: false,
				error: 'You are calling the constructor without creating an object.',
				hint: 'Use the `new` keyword to instantiate: new Pizza("large", "tomato", ...).'
			};
		}
		return {
			ok: false,
			error: 'No object is being created yet.',
			hint: 'Instantiate a pizza with the constructor: new Pizza("large", "tomato", ...).'
		};
	}

	const className = newMatch[1];
	if (className !== 'Pizza') {
		const hint =
			className.toLowerCase() === 'pizza'
				? 'Java is case-sensitive — the class is `Pizza` with a capital P.'
				: 'The class we are instantiating is called `Pizza`.';
		return { ok: false, error: `\`${className}\` is not the class we are making.`, hint };
	}

	const openIndex = cleaned.indexOf('(', newMatch.index!);
	const closeIndex = findMatchingParen(cleaned, openIndex);
	if (closeIndex === -1) {
		return {
			ok: false,
			error: 'The constructor call is missing its closing parenthesis `)`.'
		};
	}

	const argString = cleaned.slice(openIndex + 1, closeIndex);

	// No arguments at all.
	if (argString.trim() === '') {
		return {
			ok: false,
			error: 'The constructor was called with no arguments.',
			hint: 'A pizza needs at least a size and a sauce: new Pizza("large", "tomato").'
		};
	}

	const rawArgs = splitArgs(argString);
	const values: string[] = [];
	for (const raw of rawArgs) {
		const parsed = readStringLiteral(raw);
		if (!parsed.ok) return parsed;
		values.push(parsed.value);
	}

	if (values.length < 2) {
		return {
			ok: false,
			error: 'The constructor needs at least a size and a sauce.',
			hint: 'For example: new Pizza("medium", "tomato", "cheese").'
		};
	}

	const [size, sauce, ...toppings] = values;
	return {
		ok: true,
		pizza: { size, sauce, toppings, args: values }
	};
}
