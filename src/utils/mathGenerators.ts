import { MathTopic } from '../types';

export interface ProceduralMathResult {
  question: string;
  answer: string;
  explanation: string;
  formula?: string;
  topic: MathTopic;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export const mathGenerators: Record<string, () => ProceduralMathResult> = {
  'arithmetic-mult': () => {
    const a = randInt(11, 29);
    const b = randInt(4, 9);
    const product = a * b;
    const aTens = Math.floor(a / 10) * 10;
    const aUnits = a % 10;
    return {
      question: `Calculate: ${a} × ${b} = ?`,
      answer: `${product}`,
      explanation: `Mental Breakdown:\n${a} × ${b} = (${aTens} × ${b}) + (${aUnits} × ${b})\n= ${aTens * b} + ${aUnits * b}\n= ${product}`,
      topic: 'Arithmetic',
    };
  },

  'arithmetic-order': () => {
    const a = randInt(15, 35);
    const b = randInt(2, 6);
    const c = randInt(2, 5);
    const d = randInt(1, 4);
    const inner = c + d;
    const mult = b * inner;
    const result = a + mult;
    return {
      question: `Evaluate: ${a} + ${b} × (${c} + ${d})`,
      answer: `${result}`,
      explanation: `Order of Operations (PEMDAS/BODMAS):\n1. Parentheses: (${c} + ${d}) = ${inner}\n2. Multiplication: ${b} × ${inner} = ${mult}\n3. Addition: ${a} + ${mult} = ${result}`,
      formula: 'PEMDAS: Parentheses → Exponents → Multiplication/Division → Addition/Subtraction',
      topic: 'Arithmetic',
    };
  },

  'linear-eq': () => {
    const x = randInt(2, 9);
    const a = randInt(2, 7);
    const b = randInt(3, 15);
    const c = a * x + b;
    return {
      question: `Solve for x: ${a}x + ${b} = ${c}`,
      answer: `x = ${x}`,
      explanation: `Step 1: Subtract ${b} from both sides:\n${a}x = ${c} - ${b}\n${a}x = ${c - b}\n\nStep 2: Divide both sides by ${a}:\nx = ${c - b} ÷ ${a}\nx = ${x}`,
      formula: 'ax + b = c  ⟹  ax = c - b  ⟹  x = (c - b) / a',
      topic: 'Equations',
    };
  },

  'fractions-add': () => {
    const d1 = [2, 3, 4, 5][randInt(0, 3)];
    let d2 = [2, 3, 4, 5][randInt(0, 3)];
    while (d2 === d1) {
      d2 = [2, 3, 4, 5, 6][randInt(0, 4)];
    }
    const n1 = randInt(1, d1 - 1);
    const n2 = randInt(1, d2 - 1);

    const commonDenom = (d1 * d2) / gcd(d1, d2);
    const newN1 = n1 * (commonDenom / d1);
    const newN2 = n2 * (commonDenom / d2);
    const sumN = newN1 + newN2;
    const finalGcd = gcd(sumN, commonDenom);
    const simplifiedN = sumN / finalGcd;
    const simplifiedD = commonDenom / finalGcd;

    const answerStr =
      simplifiedD === 1 ? `${simplifiedN}` : `${simplifiedN}/${simplifiedD}`;

    return {
      question: `Add and simplify: ${n1}/${d1} + ${n2}/${d2} = ?`,
      answer: answerStr,
      explanation: `Step 1: Find the least common denominator of ${d1} and ${d2}: ${commonDenom}.\nStep 2: Convert fractions:\n${n1}/${d1} = ${newN1}/${commonDenom}\n${n2}/${d2} = ${newN2}/${commonDenom}\nStep 3: Add numerators: (${newN1} + ${newN2}) / ${commonDenom} = ${sumN}/${commonDenom}${
        finalGcd > 1 ? `\nStep 4: Simplify by dividing by ${finalGcd} ⟹ ${answerStr}` : ''
      }`,
      topic: 'Fractions',
    };
  },

  'percent-calc': () => {
    const percents = [10, 15, 20, 25, 30, 40, 50, 75];
    const p = percents[randInt(0, percents.length - 1)];
    const base = randInt(2, 12) * (p === 15 ? 20 : 10);
    const result = (p * base) / 100;
    return {
      question: `What is ${p}% of ${base}?`,
      answer: `${result}`,
      explanation: `${p}% = ${p}/100 = ${(p / 100).toFixed(2)}\n${base} × ${(p / 100).toFixed(2)} = ${result}\nShortcut: ${
        p === 10
          ? `10% of ${base} is ${base / 10}`
          : p === 20
          ? `10% is ${base / 10}, so 20% is ${base / 10} × 2 = ${result}`
          : p === 25
          ? `25% is one-quarter of ${base} = ${base} ÷ 4 = ${result}`
          : p === 50
          ? `50% is half of ${base} = ${result}`
          : `${base} × ${p} ÷ 100 = ${result}`
      }`,
      formula: 'Percentage = (Rate / 100) × Base',
      topic: 'Percentages',
    };
  },

  'ratios-divide': () => {
    const r1 = randInt(1, 4);
    let r2 = randInt(2, 5);
    while (r2 === r1) r2 = randInt(2, 6);
    const sumParts = r1 + r2;
    const unitValue = randInt(5, 25);
    const total = sumParts * unitValue;
    const share1 = r1 * unitValue;
    const share2 = r2 * unitValue;

    return {
      question: `Divide $${total} in the ratio ${r1} : ${r2}.`,
      answer: `$${share1} and $${share2}`,
      explanation: `Total ratio parts = ${r1} + ${r2} = ${sumParts} parts.\nValue of 1 part = $${total} ÷ ${sumParts} = $${unitValue}.\n\nFirst share: ${r1} × $${unitValue} = $${share1}\nSecond share: ${r2} × $${unitValue} = $${share2}`,
      formula: 'Value per part = Total / Sum of Parts',
      topic: 'Ratios',
    };
  },

  'geometry-pythagoras': () => {
    // Pythagorean triples: 3-4-5, 5-12-13, 6-8-10, 9-12-15
    const triples = [
      { a: 3, b: 4, c: 5 },
      { a: 6, b: 8, c: 10 },
      { a: 5, b: 12, c: 13 },
      { a: 8, b: 15, c: 17 },
      { a: 9, b: 12, c: 15 },
    ];
    const t = triples[randInt(0, triples.length - 1)];
    return {
      question: `In a right-angled triangle, leg a = ${t.a} cm and leg b = ${t.b} cm. Find hypotenuse c.`,
      answer: `c = ${t.c} cm`,
      formula: 'a² + b² = c²  ⟹  c = √(a² + b²)',
      explanation: `Using the Pythagorean Theorem:\nc² = a² + b²\nc² = ${t.a}² + ${t.b}²\nc² = ${t.a * t.a} + ${t.b * t.b} = ${t.c * t.c}\nc = √${t.c * t.c} = ${t.c} cm`,
      topic: 'Geometry',
    };
  },

  'geometry-circle': () => {
    const radii = [7, 14, 21, 28, 3.5];
    const r = radii[randInt(0, radii.length - 1)];
    const area = Math.round((22 / 7) * r * r);
    const circ = Math.round(2 * (22 / 7) * r);
    const askArea = Math.random() > 0.5;

    if (askArea) {
      return {
        question: `Find the area of a circle with radius r = ${r} cm (use π ≈ 22/7).`,
        answer: `Area = ${area} cm²`,
        formula: 'Area = πr²',
        explanation: `Area = π × r²\n= (22 / 7) × ${r}²\n= (22 / 7) × ${r * r}\n= ${area} cm²`,
        topic: 'Geometry',
      };
    } else {
      return {
        question: `Find the circumference of a circle with radius r = ${r} cm (use π ≈ 22/7).`,
        answer: `Circumference = ${circ} cm`,
        formula: 'Circumference = 2πr',
        explanation: `Circumference = 2 × π × r\n= 2 × (22 / 7) × ${r}\n= ${circ} cm`,
        topic: 'Geometry',
      };
    }
  },

  'stats-mean': () => {
    const count = randInt(4, 5);
    const targetMean = randInt(8, 25);
    const total = targetMean * count;
    const nums: number[] = [];
    let currentSum = 0;

    for (let i = 0; i < count - 1; i++) {
      const n = randInt(targetMean - 6, targetMean + 6);
      nums.push(n);
      currentSum += n;
    }
    nums.push(total - currentSum);
    // Sort slightly to look realistic
    nums.sort((a, b) => a - b);

    return {
      question: `Find the mean (average) of: [${nums.join(', ')}]`,
      answer: `Mean = ${targetMean}`,
      formula: 'Mean = Sum of items ÷ Count of items',
      explanation: `Step 1: Sum the numbers: ${nums.join(' + ')} = ${total}\nStep 2: Count of numbers = ${count}\nStep 3: Mean = ${total} ÷ ${count} = ${targetMean}`,
      topic: 'Basic Statistics',
    };
  },

  'graphs-slope': () => {
    const m = randInt(-4, 4);
    const safeM = m === 0 ? 2 : m;
    const x1 = randInt(-3, 4);
    const deltaX = randInt(2, 4);
    const x2 = x1 + deltaX;
    const y1 = randInt(-5, 8);
    const y2 = y1 + safeM * deltaX;

    return {
      question: `Find the slope (m) of the line through (${x1}, ${y1}) and (${x2}, ${y2}).`,
      answer: `m = ${safeM}`,
      formula: 'Slope m = (y₂ - y₁) / (x₂ - x₁)',
      explanation: `m = (${y2} - ${y1}) / (${x2} - ${x1})\nm = ${y2 - y1} / ${deltaX} = ${safeM}`,
      topic: 'Graphs',
    };
  },
};

export function getProceduralMath(generatorType?: string): ProceduralMathResult {
  if (generatorType && mathGenerators[generatorType]) {
    return mathGenerators[generatorType]();
  }
  const keys = Object.keys(mathGenerators);
  const randomKey = keys[randInt(0, keys.length - 1)];
  return mathGenerators[randomKey]();
}
