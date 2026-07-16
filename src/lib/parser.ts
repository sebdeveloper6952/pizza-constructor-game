/**
 * A tiny, forgiving parser for Java constructor calls. It scans the student's
 * code for EVERY object instantiation:
 *
 *     Pizza p1 = new Pizza("large", "tomato", "pepperoni", "mushroom");
 *     Drink d1 = new Drink("cola");
 *
 * We do NOT run Java. We read each `new Pizza(...)` / `new Drink(...)` call,
 * pull out the String arguments and the variable it's assigned to, and turn it
 * into a plain object the UI can render. When a statement doesn't fit the
 * expected shape we report a friendly, specific error tied to that statement.
 */

export const KNOWN_CLASSES = ['Pizza', 'Drink'] as const;

export type PizzaInstance = {
	kind: 'Pizza';
	varName?: string;
	size: string;
	sauce: string;
	toppings: string[];
	args: string[];
};

export type DrinkInstance = {
	kind: 'Drink';
	varName?: string;
	flavor: string;
	args: string[];
};

export type Instance = PizzaInstance | DrinkInstance;

/** An error tied to one instantiation statement. */
export type StatementError = {
	ordinal: number; // 1-based position among the `new` calls (0 = whole-program)
	varName?: string;
	className?: string;
	error: string;
	hint?: string;
};

export type ParseOutcome = {
	instances: Instance[];
	errors: StatementError[];
};

/** Remove `// line comments` so students can annotate their code freely. */
function stripLineComments(code: string): string {
	return code
		.split('\n')
		.map((line) => {
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

/** Index of the ')' matching the '(' at openIndex, ignoring quotes. -1 if none. */
function findMatchingParen(code: string, openIndex: number): number {
	let depth = 0;
	let inString = false;
	for (let i = openIndex; i < code.length; i++) {
		const c = code[i];
		if (inString) {
			if (c === '\\') i++;
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
			if (c === '\\') current += argString[++i] ?? '';
			else if (c === '"') inString = false;
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

type LiteralResult = { ok: true; value: string } | { ok: false; error: string; hint?: string };

/** Turn one raw argument token into its String value, or explain what's wrong. */
function readStringLiteral(token: string): LiteralResult {
	const t = token.trim();
	if (t === '') return { ok: false, error: 'There is an empty argument (an extra comma?).' };
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
	if (inString) return { ok: false, error: `${t} is missing its closing quote (").` };
	return { ok: true, value };
}

/** The variable an instantiation is assigned to, if any: `Pizza p1 = new ...` -> "p1". */
function variableNameBefore(code: string, newIndex: number): string | undefined {
	const prefix = code.slice(0, newIndex);
	const m = prefix.match(/([A-Za-z_]\w*)\s*=\s*$/);
	return m ? m[1] : undefined;
}

export function parseProgram(code: string): ParseOutcome {
	const cleaned = stripLineComments(code);
	const instances: Instance[] = [];
	const errors: StatementError[] = [];

	const re = /new\s+([A-Za-z_]\w*)\s*\(/g;
	let m: RegExpExecArray | null;
	let ordinal = 0;

	while ((m = re.exec(cleaned)) !== null) {
		ordinal += 1;
		const className = m[1];
		const varName = variableNameBefore(cleaned, m.index);
		const openIndex = m.index + m[0].length - 1;
		const closeIndex = findMatchingParen(cleaned, openIndex);

		if (closeIndex === -1) {
			errors.push({
				ordinal,
				varName,
				className,
				error: 'This constructor call is missing its closing parenthesis `)`.'
			});
			break; // can't reliably keep scanning past an unbalanced call
		}
		re.lastIndex = closeIndex + 1;

		const argString = cleaned.slice(openIndex + 1, closeIndex);
		const values: string[] = [];
		let argError: LiteralResult | null = null;
		if (argString.trim() !== '') {
			for (const raw of splitArgs(argString)) {
				const parsed = readStringLiteral(raw);
				if (!parsed.ok) {
					argError = parsed;
					break;
				}
				values.push(parsed.value);
			}
		}
		if (argError && !argError.ok) {
			errors.push({ ordinal, varName, className, error: argError.error, hint: argError.hint });
			continue;
		}

		// Validate the class + its arguments.
		if (className === 'Pizza') {
			if (values.length < 2) {
				errors.push({
					ordinal,
					varName,
					className,
					error: 'A Pizza needs at least a size and a sauce.',
					hint: 'For example: new Pizza("medium", "tomato", "cheese").'
				});
				continue;
			}
			const [size, sauce, ...toppings] = values;
			instances.push({ kind: 'Pizza', varName, size, sauce, toppings, args: values });
		} else if (className === 'Drink') {
			if (values.length !== 1) {
				errors.push({
					ordinal,
					varName,
					className,
					error:
						values.length === 0
							? 'A Drink needs a flavor.'
							: 'A Drink takes exactly one argument: its flavor.',
					hint: 'For example: new Drink("cola").'
				});
				continue;
			}
			instances.push({ kind: 'Drink', varName, flavor: values[0], args: values });
		} else {
			const lower = className.toLowerCase();
			const caseMatch = KNOWN_CLASSES.find((c) => c.toLowerCase() === lower);
			errors.push({
				ordinal,
				varName,
				className,
				error: `\`${className}\` is not a class you can make here.`,
				hint: caseMatch
					? `Java is case-sensitive — did you mean \`${caseMatch}\`?`
					: `Available classes: ${KNOWN_CLASSES.join(' and ')}.`
			});
		}
	}

	// Nothing was instantiated at all — nudge toward the constructor.
	if (ordinal === 0) {
		const calledWithoutNew = KNOWN_CLASSES.some((c) => new RegExp(`\\b${c}\\s*\\(`).test(cleaned));
		errors.push({
			ordinal: 0,
			error: calledWithoutNew
				? 'You are calling a constructor without creating an object.'
				: 'No objects are being created yet.',
			hint: 'Instantiate with `new`, e.g. new Pizza("large", "tomato", "pepperoni") or new Drink("cola").'
		});
	}

	return { instances, errors };
}
