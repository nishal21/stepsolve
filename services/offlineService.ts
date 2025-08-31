import type { CalculationResponse, CalculationStep, SymbolDefinition } from '../types';

// Regex to check for allowed characters. Now includes more letters for functions and commas for integrals.
const offlineSolvableRegex = /^[a-z09\s\+\-\*\/\(\)\.x\^=d\/,]+$/;
const hasXCubed = /x\^3/i;
const hasXSquared = /x\^2/i;
const hasX = /x/i;
const isDerivativeRegex = /d\/dx\s*\((.+)\)/i;
const isIndefiniteIntegralRegex = /integrate\s*\(([^,]+)\)/i;
const isDefiniteIntegralRegex = /integrate\s*\((.+),\s*([^,]+),\s*([^,]+)\)/i;

const symbolMap: Record<string, SymbolDefinition> = {
    '=': { symbol: '=', name: 'Equals', meaning: 'Represents equality between two expressions.' },
    '+': { symbol: '+', name: 'Addition', meaning: 'Adds two numbers or expressions.' },
    '-': { symbol: '-', name: 'Subtraction', meaning: 'Subtracts one number or expression from another.' },
    '*': { symbol: '*', name: 'Multiplication', meaning: 'Multiplies two numbers or expressions.' },
    '/': { symbol: '/', name: 'Division', meaning: 'Divides one number or expression by another.' },
    '^': { symbol: 'a^b', name: 'Exponentiation', meaning: 'Raises a base (a) to the power of an exponent (b).' },
    'sqrt': { symbol: '\\sqrt{x}', name: 'Square Root', meaning: 'Finds a number that, when multiplied by itself, equals x.' },
    'd/dx': { symbol: 'd/dx', name: 'Derivative', meaning: 'Represents the rate of change of a function with respect to the variable x.' },
    'integrate': { symbol: '∫', name: 'Integral', meaning: 'Represents the area under a curve, or the antiderivative of a function.' },
};

const extractSymbols = (equation: string): SymbolDefinition[] => {
    const found = new Set<SymbolDefinition>();
    const lowerEq = equation.toLowerCase();

    if (lowerEq.includes('d/dx')) found.add(symbolMap['d/dx']);
    if (lowerEq.includes('integrate')) found.add(symbolMap['integrate']);
    if (lowerEq.includes('sqrt')) found.add(symbolMap['sqrt']);
    if (lowerEq.includes('=')) found.add(symbolMap['=']);
    if (lowerEq.includes('^')) found.add(symbolMap['^']);
    if (lowerEq.includes('+')) found.add(symbolMap['+']);
    if (lowerEq.includes('-')) found.add(symbolMap['-']);
    if (lowerEq.includes('*')) found.add(symbolMap['*']);
    if (lowerEq.includes('/') && !lowerEq.includes('d/dx')) {
        found.add(symbolMap['/']);
    }
    
    return Array.from(found);
};

export const canSolveOffline = (equation: string): boolean => {
  const sanitized = equation.trim().toLowerCase();
  if (!sanitized) return false;
  
  // Quick checks for function-like patterns
  if (hasXCubed.test(sanitized)) return true;
  if (isDefiniteIntegralRegex.test(sanitized)) return true;
  if (isIndefiniteIntegralRegex.test(sanitized)) return true;
  if (isDerivativeRegex.test(sanitized)) return true;

  return offlineSolvableRegex.test(sanitized);
};


export const solveOffline = (equation: string): CalculationResponse => {
    try {
        let sanitized = equation.trim().toLowerCase();
        const symbols = extractSymbols(sanitized);

        // Handle "f(x) = ..., find roots" format
        if (sanitized.includes(", find roots")) {
            sanitized = sanitized.replace(/f\(x\)\s*=/,'').replace(/, find roots/i, ' = 0');
        }

        let response: CalculationResponse;

        // Highest precedence for complex patterns
        if (isDefiniteIntegralRegex.test(sanitized)) {
            response = solveDefiniteIntegral(sanitized);
        } else if (isIndefiniteIntegralRegex.test(sanitized)) {
            response = solveIndefiniteIntegral(sanitized);
        } else if (isDerivativeRegex.test(sanitized)) {
            response = solveDerivative(sanitized);
        } else if (hasXCubed.test(sanitized) && sanitized.includes('=')) {
            response = solveCubicEquation(sanitized);
        } else if (hasXSquared.test(sanitized) && sanitized.includes('=')) {
            response = solveQuadraticEquation(sanitized);
        } else if (hasX.test(sanitized) && sanitized.includes('=')) {
            response = solveLinearEquation(sanitized);
        } else {
            // Fallback to general arithmetic for everything else
            response = solveArithmetic(sanitized);
        }
        
        response.symbols = symbols;
        return response;

    } catch (err) {
        if (err instanceof Error) throw err;
        throw new Error("The expression could not be solved by the offline engine.");
    }
};

const solveDefiniteIntegral = (equation: string): CalculationResponse => {
    const steps: CalculationStep[] = [];
    steps.push({ expression: equation, explanation: "Starting with the definite integral expression.", rule: "Initial Expression" });

    const match = equation.match(isDefiniteIntegralRegex);
    if (!match) throw new Error("Invalid definite integral format. Use integrate(expression, from, to)");

    const [, expression, lowerBoundStr, upperBoundStr] = match;

    steps.push({ expression: `∫(${expression}) dx from ${lowerBoundStr} to ${upperBoundStr}`, explanation: "Identify the expression and the lower and upper bounds of integration.", rule: "Parse Integral" });

    const lowerBoundResult = solveArithmetic(lowerBoundStr);
    const a = parseFloat(lowerBoundResult.finalAnswer);
    if (lowerBoundResult.steps.length > 0) {
        steps.push({ expression: `${lowerBoundStr} = ${a}`, explanation: "Evaluate the lower bound.", rule: "Bounds Evaluation" });
    }

    const upperBoundResult = solveArithmetic(upperBoundStr);
    const b = parseFloat(upperBoundResult.finalAnswer);
     if (upperBoundResult.steps.length > 0) {
        steps.push({ expression: `${upperBoundStr} = ${b}`, explanation: "Evaluate the upper bound.", rule: "Bounds Evaluation" });
    }

    if (isNaN(a) || isNaN(b)) throw new Error("Invalid integral bounds.");

    // Simpson's Rule for numerical integration
    const n = 1000; // Number of steps, must be even
    const h = (b - a) / n;
    
    const evaluateAtX = (expr: string, x: number): number => {
      // Replace all 'x' with the value, ensuring it's wrapped in parens for safety
      const substitutedExpr = expr.replace(/x/g, `(${x})`);
      try {
        const result = solveArithmetic(substitutedExpr);
        return parseFloat(result.finalAnswer);
      } catch (e) {
        // If there's an error, it might be an unsolvable expression for that x.
        console.error(`Error evaluating '${substitutedExpr}'`, e);
        return NaN;
      }
    };
    
    let sum = evaluateAtX(expression, a) + evaluateAtX(expression, b);

    for (let i = 1; i < n; i += 2) {
        sum += 4 * evaluateAtX(expression, a + i * h);
    }
    for (let i = 2; i < n - 1; i += 2) {
        sum += 2 * evaluateAtX(expression, a + i * h);
    }

    const finalAnswer = (h / 3) * sum;
    
    if(isNaN(finalAnswer)) throw new Error("Could not compute the integral. The expression may be invalid for the given range.");

    steps.push({ expression: `h = (${b} - ${a})/${n} = ${h.toPrecision(4)}`, explanation: `Using Simpson's Rule for numerical integration with n=${n} intervals. The step size $h$ is calculated.`, rule: "Numerical Method Setup" });
    steps.push({ expression: `∫ ≈ (h/3) * [f(a) + 4f(a+h) + 2f(a+2h) + ... + f(b)]`, explanation: `The integral is approximated by calculating the weighted sum of the function at ${n+1} points.`, rule: "Apply Simpson's Rule" });
    
    const finalAnswerStr = finalAnswer.toFixed(6);
    steps.push({ expression: `Result ≈ ${finalAnswerStr}`, explanation: "The final calculated value of the definite integral.", rule: "Final Answer" });

    return { finalAnswer: finalAnswerStr, steps, symbols: [] };
};


interface PolynomialTerm {
    coefficient: number;
    power: number;
}

const parseGeneralPolynomial = (expr: string): PolynomialTerm[] => {
    const terms: PolynomialTerm[] = [];
    const normalized = expr.replace(/\s/g, '').replace(/-/g, '+-');
    const termStrings = normalized.split('+').filter(Boolean);

    for (const termStr of termStrings) {
        if (!termStr.includes('x')) {
            const coeff = parseFloat(termStr);
            if (!isNaN(coeff)) {
                 terms.push({ coefficient: coeff, power: 0 });
            }
            continue;
        }

        const [coeffPart, powerPart] = termStr.split('x');
        let coefficient = 1;
        if (coeffPart === '' || coeffPart === '+') coefficient = 1;
        else if (coeffPart === '-') coefficient = -1;
        else coefficient = parseFloat(coeffPart);

        let power = 1;
        if (powerPart) {
            if (powerPart.startsWith('^')) {
                power = parseFloat(powerPart.substring(1));
            } else {
                 power = 1;
            }
        }
        terms.push({ coefficient, power });
    }
    return terms;
};

const solveIndefiniteIntegral = (equation: string): CalculationResponse => {
    const steps: CalculationStep[] = [];
    steps.push({ expression: equation, explanation: "Starting with the indefinite integral expression.", rule: "Initial Expression" });

    const match = equation.match(isIndefiniteIntegralRegex);
    if (!match || !match[1]) {
        throw new Error("Invalid integral format. Use integrate(...)");
    }
    const innerExpression = match[1];

    steps.push({ expression: `∫(${innerExpression}) dx`, explanation: "Identify the expression to integrate with respect to $x$.", rule: "Isolate Expression" });
    
    const polynomialTerms = parseGeneralPolynomial(innerExpression);
    const integralTerms: string[] = [];

    polynomialTerms.forEach(term => {
        const newPower = term.power + 1;
        const newCoeff = term.coefficient / newPower;
        const formattedCoeff = parseFloat(newCoeff.toFixed(4));

        const explanation = `Apply the reverse power rule ($∫ax^n dx = (a/(n+1))x^{n+1}$) to the term $${term.coefficient}x^${term.power}$. The new coefficient is $${term.coefficient} / ${newPower} = ${formattedCoeff}$ and the new power is $${term.power} + 1 = ${newPower}$.`;
        
        let newTermStr = '';
        if (newPower === 1) {
            newTermStr = `${formattedCoeff}x`;
        } else {
            newTermStr = `${formattedCoeff}x^${newPower}`;
        }

        steps.push({ expression: `∫${term.coefficient}x^${term.power} dx = ${newTermStr}`, explanation, rule: "Reverse Power Rule" });
        
        if (formattedCoeff !== 0) {
            integralTerms.push(newTermStr);
        }
    });

    let integratedExpression = integralTerms.join(' + ').replace(/\+ -/g, '- ');
    if (!integratedExpression) {
      integratedExpression = "0";
    }
    
    const finalAnswer = `${integratedExpression} + C`;

    steps.push({ expression: finalAnswer, explanation: "Combine the integrals of each term and add the constant of integration, $C$, to represent all possible antiderivatives.", rule: "Add Constant of Integration" });
    
    return { finalAnswer, steps, symbols: [] };
};


const solveDerivative = (equation: string): CalculationResponse => {
    const steps: CalculationStep[] = [];
    steps.push({ expression: equation, explanation: "Starting with the derivative expression.", rule: "Initial Expression" });

    const match = equation.match(isDerivativeRegex);
    if (!match || !match[1]) {
        throw new Error("Invalid derivative format. Use d/dx(...)");
    }
    const innerExpression = match[1];
    
    steps.push({ expression: innerExpression, explanation: "Identify the expression to differentiate with respect to $x$.", rule: "Isolate Expression" });

    const polynomialTerms = parseGeneralPolynomial(innerExpression);
    const derivativeTerms: string[] = [];
    
    polynomialTerms.forEach(term => {
        if (term.power === 0) {
            steps.push({ expression: `d/dx(${term.coefficient}) = 0`, explanation: `The derivative of a constant ($${term.coefficient}$) is 0.`, rule: "Constant Rule" });
        } else {
            const newCoeff = term.coefficient * term.power;
            const newPower = term.power - 1;

            const explanation = `Apply the power rule ($d/dx(ax^n) = anx^{n-1}$) to the term $${term.coefficient}x^${term.power}$. The new coefficient is $${term.coefficient} \\cdot ${term.power} = ${newCoeff}$ and the new power is $${term.power} - 1 = ${newPower}$.`;
            steps.push({ expression: `d/dx(${term.coefficient}x^${term.power}) = ${newCoeff}x^${newPower}`, explanation, rule: "Power Rule" });
            
            if (newCoeff !== 0) {
              if (newPower === 0) {
                  derivativeTerms.push(String(newCoeff));
              } else if (newPower === 1) {
                  derivativeTerms.push(`${newCoeff}x`);
              } else {
                  derivativeTerms.push(`${newCoeff}x^${newPower}`);
              }
            }
        }
    });

    let finalAnswer = derivativeTerms.join(' + ').replace(/\+ -/g, '- ');
    if (!finalAnswer) {
      finalAnswer = "0";
    }

    steps.push({ expression: finalAnswer, explanation: "Combine the derivatives of each term to get the final result.", rule: "Sum Rule / Final Answer" });

    return { finalAnswer, steps, symbols: [] };
};

const parsePolynomialCoefficients = (expr: string): { a: number, b: number, c: number, d: number } => {
    let a = 0, b = 0, c = 0, d = 0; // for ax^3 + bx^2 + cx + d
    const normalized = expr.replace(/\s/g, '').replace(/-/g, '+-');
    const terms = normalized.split('+').filter(Boolean);

    for (const term of terms) {
        if (term.includes('x^3')) {
            const coeffStr = term.replace('x^3', '').replace('*', '');
            if (coeffStr === '' || coeffStr === '+') a += 1;
            else if (coeffStr === '-') a -= 1;
            else a += parseFloat(coeffStr);
        } else if (term.includes('x^2')) {
            const coeffStr = term.replace('x^2', '').replace('*', '');
            if (coeffStr === '' || coeffStr === '+') b += 1;
            else if (coeffStr === '-') b -= 1;
            else b += parseFloat(coeffStr);
        } else if (term.includes('x')) {
            const coeffStr = term.replace('x', '').replace('*', '');
            if (coeffStr === '' || coeffStr === '+') c += 1;
            else if (coeffStr === '-') c -= 1;
            else c += parseFloat(coeffStr);
        } else {
            if (!isNaN(parseFloat(term))) {
              d += parseFloat(term);
            }
        }
    }
    return { a, b, c, d };
};

const solveQuadraticFromCoefficients = (a: number, b: number, c: number): { roots: number[], steps: CalculationStep[], message?: string } => {
    const steps: CalculationStep[] = [];
    const discriminant = b * b - 4 * a * c;
    steps.push({ expression: `D = b^2 - 4ac = (${b})^2 - 4(${a})(${c}) = ${discriminant}`, explanation: "Calculate the discriminant ($D = b^2 - 4ac$) to determine the number of real solutions.", rule: "Calculate Discriminant" });

    const roots: number[] = [];
    let message: string | undefined;

    if (discriminant > 0) {
        const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        roots.push(x1, x2);
        steps.push({ expression: `x = (-b ± \\sqrt{D}) / 2a`, explanation: "Since the discriminant is positive, there are two distinct real roots. We apply the quadratic formula.", rule: "Quadratic Formula" });
        steps.push({ expression: `x_1 = ${x1.toFixed(4)}, x_2 = ${x2.toFixed(4)}`, explanation: "Calculate the final roots for $x$.", rule: "Calculate Roots" });
    } else if (discriminant === 0) {
        const x = -b / (2 * a);
        roots.push(x);
        steps.push({ expression: `x = -b / 2a`, explanation: "Since the discriminant is zero, there is exactly one real root.", rule: "Quadratic Formula (One Root)" });
         steps.push({ expression: `x = ${x.toFixed(4)}`, explanation: "Calculate the final root for $x$.", rule: "Calculate Root" });
    } else {
        steps.push({ expression: `D < 0`, explanation: "Since the discriminant is negative, there are no real roots. The solutions are complex numbers.", rule: "No Real Roots" });
        message = "No real solutions";
    }
    return { roots, steps, message };
};


const getIntegerFactors = (n: number): number[] => {
    n = Math.abs(n);
    const factors = new Set<number>();
    for (let i = 1; i <= Math.sqrt(n); i++) {
        if (n % i === 0) {
            factors.add(i);
            factors.add(-i);
            factors.add(n / i);
            factors.add(-(n / i));
        }
    }
    if (n === 0) factors.add(0);
    return Array.from(factors);
};

const solveCubicEquation = (equation: string): CalculationResponse => {
    const steps: CalculationStep[] = [];
    steps.push({ expression: equation, explanation: "Starting with the cubic equation.", rule: "Initial Equation" });

    const parts = equation.split('=');
    if (parts.length !== 2) throw new Error("Invalid equation format. It must contain one '=' sign.");

    const leftSide = parsePolynomialCoefficients(parts[0]);
    const rightSide = parsePolynomialCoefficients(parts[1]);

    const a = leftSide.a - rightSide.a;
    const b = leftSide.b - rightSide.b;
    const c = leftSide.c - rightSide.c;
    const d = leftSide.d - rightSide.d;

    if (a === 0) return solveQuadraticEquation(equation);

    const standardForm = `${a}x^3 + ${b}x^2 + ${c}x + ${d} = 0`.replace(/\+ -/g, '- ').replace(/\+ 0x\^3 | \+ 0x\^2 | \+ 0x /g, '').replace(/^0x\^3 \+ /,'');
    steps.push({ expression: standardForm, explanation: `Rearrange the equation into standard form $ax^3+bx^2+cx+d=0$. Here, $a=${a}$, $b=${b}$, $c=${c}$, $d=${d}$.`, rule: "Standard Form" });

    const p_factors = getIntegerFactors(d);
    const q_factors = getIntegerFactors(a);
    const potentialRoots = new Set<number>();
    for (const p of p_factors) {
        for (const q of q_factors) {
            if (q !== 0) potentialRoots.add(p / q);
        }
    }
    steps.push({ expression: 'x = p/q', explanation: "Using the Rational Root Theorem, we test potential rational roots. Potential roots are fractions $p/q$, where $p$ is a factor of the constant term ($d$) and $q$ is a factor of the leading coefficient ($a$).", rule: "Rational Root Theorem" });
    
    let firstRoot: number | null = null;
    for (const root of Array.from(potentialRoots).sort((x, y) => Math.abs(x) - Math.abs(y))) {
        // Test if f(root) is close to 0 to handle floating point issues
        if (Math.abs(a * root**3 + b * root**2 + c * root + d) < 1e-9) {
            firstRoot = root;
            break;
        }
    }

    if (firstRoot === null) {
        throw new Error("Could not find a rational root for this equation using the offline solver.");
    }
    
    steps.push({ expression: `f(${firstRoot}) = 0`, explanation: `By testing the potential values, we find that $x = ${firstRoot}$ is a root of the equation.`, rule: "Find First Root" });

    // Synthetic division
    const q_a = a;
    const q_b = b + firstRoot * q_a;
    const q_c = c + firstRoot * q_b;
    const remainder = d + firstRoot * q_c;

    if (Math.abs(remainder) > 1e-9) {
         throw new Error("Synthetic division resulted in a non-zero remainder. Calculation error.");
    }

    const quadraticExpression = `${q_a}x^2 + ${q_b}x + ${q_c} = 0`.replace(/\+ -/g, '- ');
    steps.push({ expression: `(x - (${firstRoot}))(${quadraticExpression}) = 0`, explanation: `Using synthetic division with the root $x = ${firstRoot}$, we can factor the original polynomial. We are left with solving the quadratic equation: $${quadraticExpression}$$.`, rule: "Synthetic Division" });
    
    const { roots: quadraticRoots, steps: solveSteps } = solveQuadraticFromCoefficients(q_a, q_b, q_c);
    steps.push(...solveSteps);
    
    const allRoots = [firstRoot, ...quadraticRoots];
    const uniqueRoots = [...new Set(allRoots.map(r => parseFloat(r.toFixed(6))))].sort((x, y) => x - y);
    
    const finalAnswer = uniqueRoots.length > 1 
        ? `x \\in \\{${uniqueRoots.join(', ')}\\}`
        : `x = ${uniqueRoots.join('')}`;

    return { finalAnswer, steps, symbols: [] };
};

const solveQuadraticEquation = (equation: string): CalculationResponse => {
    const steps: CalculationStep[] = [];
    steps.push({ expression: equation, explanation: "Starting with the quadratic equation.", rule: "Initial Equation" });

    const parts = equation.split('=');
    if (parts.length !== 2) throw new Error("Invalid quadratic equation format. It must contain one '=' sign.");
    
    const leftSide = parsePolynomialCoefficients(parts[0]);
    const rightSide = parsePolynomialCoefficients(parts[1]);

    const a = leftSide.b - rightSide.b;
    const b = leftSide.c - rightSide.c;
    const c = leftSide.d - rightSide.d;
    
    if ((leftSide.a - rightSide.a) !== 0) return solveCubicEquation(equation);
    if (a === 0) return solveLinearEquation(equation); 

    const standardForm = `${a}x^2 + ${b}x + ${c} = 0`.replace(/\+ -/g, '- ');
    steps.push({ expression: standardForm, explanation: `Rearrange the equation into the standard form $ax^2 + bx + c = 0$. Here, $a=${a}$, $b=${b}$, and $c=${c}$.`, rule: "Standard Form" });

    const { roots, steps: solveSteps, message } = solveQuadraticFromCoefficients(a, b, c);
    steps.push(...solveSteps);
    
    const finalAnswer = message || (roots.length > 1 
        ? `x \\in \\{${roots.map(r => parseFloat(r.toFixed(4))).join(', ')}\\}` 
        : `x = ${roots.map(r => parseFloat(r.toFixed(4))).join('')}`);


    return { finalAnswer, steps, symbols: [] };
};

const solveLinearEquation = (equation: string): CalculationResponse => {
    const steps: CalculationStep[] = [];
    steps.push({ expression: equation, explanation: "Starting with the original linear equation.", rule: "Initial Equation" });

    const parts = equation.split('=');
    if (parts.length !== 2) throw new Error("Invalid linear equation format. Must contain one '=' sign.");

    const leftSide = parsePolynomialCoefficients(parts[0]);
    const rightSide = parsePolynomialCoefficients(parts[1]);

    const xCoeff = leftSide.c - rightSide.c;
    const constVal = rightSide.d - leftSide.d;

    const leftExpr = `${leftSide.c}x + ${leftSide.d}`.replace(/\+ -/g, '- ');
    const rightExpr = `${rightSide.c}x + ${rightSide.d}`.replace(/\+ -/g, '- ');
    steps.push({ expression: `${leftExpr} = ${rightExpr}`, explanation: "Identify variable ($x$) terms and constant terms on each side.", rule: "Identify Terms" });
    
    const isolatedExpr = `${leftSide.c - rightSide.c}x = ${rightSide.d - leftSide.d}`;
    steps.push({ expression: isolatedExpr, explanation: "Move all variable terms to the left side and all constant terms to the right side of the equation.", rule: "Isolate Variable Term" });

    if (xCoeff === 0) {
        const result = constVal === 0 ? "Infinite solutions" : "No solution";
        steps.push({ expression: `${xCoeff}x = ${constVal}`, explanation: "After combining terms, the coefficient of $x$ is zero.", rule: "Simplification" });
        return { finalAnswer: result, steps, symbols: [] };
    }

    steps.push({ expression: `${xCoeff}x = ${constVal}`, explanation: "Simplify both sides of the equation.", rule: "Simplification" });
    
    const finalAnswerVal = constVal / xCoeff;
    steps.push({ expression: `x = ${constVal} / ${xCoeff}`, explanation: `To solve for $x$, divide both sides by its coefficient, $${xCoeff}$.`, rule: "Solve for Variable" });
    const finalAnswer = `x = ${finalAnswerVal}`;
    steps.push({ expression: finalAnswer, explanation: "The final solution for $x$.", rule: "Final Answer" });

    return { finalAnswer, steps, symbols: [] };
};

const factorial = (n: number): number => {
    if (n < 0) throw new Error("Factorial is not defined for negative numbers.");
    if (n > 170) throw new Error("Factorial of numbers > 170 is too large to calculate.");
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

const solveArithmetic = (equation: string): CalculationResponse => {
    const steps: CalculationStep[] = [];
    let currentExpression = equation;

    steps.push({ expression: equation, explanation: "Starting expression.", rule: "Initial Expression" });

    // Pre-processing for constants and operators
    const preProcess = (expr: string): string => {
        let processedExpr = expr;
        // Constants
        if (processedExpr.includes('pi') || processedExpr.includes('e')) {
            processedExpr = processedExpr.replace(/pi/g, String(Math.PI)).replace(/e/g, String(Math.E));
            steps.push({ expression: processedExpr, explanation: "Substitute mathematical constants like $\\pi$ and $e$ with their numerical values.", rule: "Constant Substitution" });
        }
        // Percentage
        if (processedExpr.includes('%')) {
            processedExpr = processedExpr.replace(/(\d+\.?\d*)\s*%/g, '($1/100)');
            steps.push({ expression: processedExpr, explanation: "Convert percentage values to their decimal equivalents (e.g., $50\\% \\rightarrow 0.5$).", rule: "Percentage Conversion" });
        }
        return processedExpr;
    }
    currentExpression = preProcess(currentExpression);
    
    const functionNames = ['sin', 'cos', 'tan', 'log', 'ln', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'sqrt', 'fact', 'degtorad', 'radtodeg'];
    // eslint-disable-next-line no-constant-condition
    while (true) {
        let foundFunction = false;
        let functionName = '';
        let startIndex = -1;

        for (const name of functionNames) {
            const lastIndex = currentExpression.lastIndexOf(name + '(');
            if (lastIndex > startIndex) {
                startIndex = lastIndex;
                functionName = name;
                foundFunction = true;
            }
        }

        if (!foundFunction) break;

        const openParenIndex = startIndex + functionName.length;
        let balance = 1;
        let endIndex = -1;

        for (let i = openParenIndex + 1; i < currentExpression.length; i++) {
            if (currentExpression[i] === '(') balance++;
            if (currentExpression[i] === ')') balance--;
            if (balance === 0) {
                endIndex = i;
                break;
            }
        }

        if (endIndex === -1) throw new Error(`Mismatched parentheses for function ${functionName}.`);
        
        const subExpression = currentExpression.substring(openParenIndex + 1, endIndex);
        // Recursively solve inner part. Pass an empty array for steps to avoid duplicating them.
        const subResult = solveArithmetic(subExpression); 
        const innerResult = parseFloat(subResult.finalAnswer);
        
        if (subResult.steps.length > 1) {
           steps.push({ expression: currentExpression, explanation: `Evaluate the expression inside the ${functionName} function: $${subExpression}$`, rule: "Function Argument" });
        }
        
        let result: number;
        let rule: string;
        let explanation: string;

        switch (functionName) {
            case 'sin': result = Math.sin(innerResult); rule = "Sine Function"; explanation = `Calculate the sine (in radians): $sin(${innerResult}) = ${result.toPrecision(8)}$`; break;
            case 'cos': result = Math.cos(innerResult); rule = "Cosine Function"; explanation = `Calculate the cosine (in radians): $cos(${innerResult}) = ${result.toPrecision(8)}$`; break;
            case 'tan': result = Math.tan(innerResult); rule = "Tangent Function"; explanation = `Calculate the tangent (in radians): $tan(${innerResult}) = ${result.toPrecision(8)}$`; break;
            case 'asin': result = Math.asin(innerResult); rule = "Arcsine"; explanation = `Calculate the arcsine: $asin(${innerResult}) = ${result.toPrecision(8)}$`; break;
            case 'acos': result = Math.acos(innerResult); rule = "Arccosine"; explanation = `Calculate the arccosine: $acos(${innerResult}) = ${result.toPrecision(8)}$`; break;
            case 'atan': result = Math.atan(innerResult); rule = "Arctangent"; explanation = `Calculate the arctangent: $atan(${innerResult}) = ${result.toPrecision(8)}$`; break;
            case 'sinh': result = Math.sinh(innerResult); rule = "Hyperbolic Sine"; explanation = `Calculate the hyperbolic sine: $sinh(${innerResult}) = ${result.toPrecision(8)}$`; break;
            case 'cosh': result = Math.cosh(innerResult); rule = "Hyperbolic Cosine"; explanation = `Calculate the hyperbolic cosine: $cosh(${innerResult}) = ${result.toPrecision(8)}$`; break;
            case 'tanh': result = Math.tanh(innerResult); rule = "Hyperbolic Tangent"; explanation = `Calculate the hyperbolic tangent: $tanh(${innerResult}) = ${result.toPrecision(8)}$`; break;
            case 'log': if (innerResult <= 0) throw new Error("Logarithm of a non-positive number is undefined."); result = Math.log10(innerResult); rule = "Logarithm (Base 10)"; explanation = `Calculate the base-10 logarithm: $log(${innerResult}) = ${result.toPrecision(8)}$`; break;
            case 'ln': if (innerResult <= 0) throw new Error("Natural log of a non-positive number is undefined."); result = Math.log(innerResult); rule = "Natural Logarithm"; explanation = `Calculate the natural logarithm: $ln(${innerResult}) = ${result.toPrecision(8)}$`; break;
            case 'sqrt': if (innerResult < 0) throw new Error("Square root of a negative number is not a real number."); result = Math.sqrt(innerResult); rule = "Square Root"; explanation = `Calculate the square root: $sqrt(${innerResult}) = ${result.toPrecision(8)}$`; break;
            case 'fact': result = factorial(innerResult); rule = "Factorial"; explanation = `Calculate the factorial: $fact(${innerResult}) = ${result}$`; break;
            case 'degtorad': result = innerResult * (Math.PI / 180); rule = "Degrees to Radians"; explanation = `Convert degrees to radians: $${innerResult}^\\circ \\times \\frac{\\pi}{180} = ${result.toPrecision(8)} \\text{ rad}$`; break;
            case 'radtodeg': result = innerResult * (180 / Math.PI); rule = "Radians to Degrees"; explanation = `Convert radians to degrees: $${innerResult} \\text{ rad} \\times \\frac{180}{\\pi} = ${result.toPrecision(8)}^\\circ$`; break;
            default: throw new Error("Unknown function.");
        }
        
        const fullFunctionCall = currentExpression.substring(startIndex, endIndex + 1);
        currentExpression = currentExpression.replace(fullFunctionCall, String(result));
        steps.push({ expression: currentExpression, explanation, rule });
    }

    while (currentExpression.includes('(')) {
        const startIndex = currentExpression.lastIndexOf('(');
        const endIndex = currentExpression.indexOf(')', startIndex);
        if (startIndex === -1 || endIndex === -1) throw new Error("Mismatched parentheses.");

        const subExpression = currentExpression.substring(startIndex + 1, endIndex);
        const subResult = solveArithmetic(subExpression); 
        const innerResult = subResult.finalAnswer;
        
        currentExpression = `${currentExpression.substring(0, startIndex)}${innerResult}${currentExpression.substring(endIndex + 1)}`;
        steps.push({ expression: currentExpression, explanation: `First, solve the expression inside the parentheses: $${subExpression} = ${innerResult}$`, rule: "Parentheses (Brackets)" });
    }

    const evaluateOperations = (expr: string, operators: string[], rule: string): string => {
        let expression = expr;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const opRegex = new RegExp(`(-?\\d*\\.?\\d+(?:e[+-]?\\d+)?)\\s*([\\${operators.join('\\')}])\\s*(-?\\d*\\.?\\d+(?:e[+-]?\\d+)?)`);
            const match = expression.match(opRegex);

            if (!match) break;

            const [fullMatch, leftStr, op, rightStr] = match;
            const left = parseFloat(leftStr);
            const right = parseFloat(rightStr);
            if (op === '-' && leftStr === '') { // It's a negative number, not subtraction
                const nextMatch = expression.substring(1).match(opRegex);
                if (!nextMatch) break;
            }


            let result: number;
            switch (op) {
                case '^': result = Math.pow(left, right); break;
                case '*': result = left * right; break;
                case '/': 
                    if (right === 0) throw new Error("Division by zero is not allowed.");
                    result = left / right; 
                    break;
                case '+': result = left + right; break;
                case '-': result = left - right; break;
                default: continue;
            }

            const stepExplanation = `Perform ${rule.toLowerCase()}: $${left} ${op} ${right} = ${result}$`;
            expression = expression.replace(fullMatch, String(result));
            steps.push({ expression: expression, explanation: stepExplanation, rule });
        }
        return expression;
    };

    currentExpression = evaluateOperations(currentExpression, ['^'], "Exponents");
    currentExpression = evaluateOperations(currentExpression, ['*', '/'], "Multiplication/Division");
    currentExpression = evaluateOperations(currentExpression, ['+', '-'], "Addition/Subtraction");

    const finalAnswer = parseFloat(currentExpression);
    if (isNaN(finalAnswer)) throw new Error("Invalid arithmetic expression.");

    if (steps.length === 1 && steps[0].expression === String(finalAnswer)) {
        steps.pop();
    }
    
    // Don't add final answer step if it's identical to the previous step
    if (steps.length > 0 && steps[steps.length - 1].expression !== String(finalAnswer)) {
        steps.push({ expression: String(finalAnswer), explanation: "The final simplified answer.", rule: "Final Answer" });
    } else if (steps.length === 0 && equation !== String(finalAnswer)) {
         steps.push({ expression: String(finalAnswer), explanation: "The final simplified answer.", rule: "Final Answer" });
    }
    
    // For a single number input, there should be no steps.
    if(equation.trim() === String(finalAnswer).trim()) {
        return { finalAnswer: String(finalAnswer), steps: [], symbols: [] };
    }


    return {
        finalAnswer: String(finalAnswer),
        steps,
        symbols: [],
    };
};