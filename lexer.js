/* =========================================================================
 *  Motor léxico multilenguaje (Python · JavaScript · C++)
 *  Simula un autómata finito determinista: lee carácter por carácter y
 *  agrupa los símbolos en lexemas. Si un carácter no tiene transición
 *  posible desde el estado actual → ERROR LÉXICO.
 *  Además incluye un "radar sintáctico" heurístico para mostrar la
 *  diferencia entre un error léxico y uno sintáctico.
 * ========================================================================= */
'use strict';

const LANGS = {
  python: {
    name: 'Python',
    icon: '🐍',
    keywords: 'False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case',
    valueKw: ['True', 'False', 'None'],
    lineComment: '#',
    blockComment: false,
    quotes: ['"', "'"],
    triple: true,
    stringPrefix: /^(r|u|f|b|br|rb|fr|rf)$/i,
    lineContinuation: true,
    dollarIdent: false,
    num: /(?:0[xX][\da-fA-F_]+|0[oO][0-7_]+|0[bB][01_]+|(?:\d[\d_]*\.?[\d_]*|\.\d[\d_]*)(?:[eE][+-]?\d[\d_]*)?[jJ]?)/y,
    ops: ['**=', '//=', '>>=', '<<=', '->', ':=', '**', '//', '==', '!=', '<=', '>=', '<<', '>>', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '@=', '+', '-', '*', '/', '%', '&', '|', '^', '~', '<', '>', '='],
    delims: ['...', '(', ')', '[', ']', '{', '}', ',', ':', ';', '.'],
    binOnly: ['**=', '//=', '>>=', '<<=', '->', ':=', '//', '==', '!=', '<=', '>=', '<<', '>>', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '@=', '/', '%', '&', '|', '^', '<', '>', '=', '*', '**', '@'],
    commentEdge: '#',
    alphabet: {
      specials: ['#  comentario', '\'  "  cadenas', '"""  cadena multilínea', '\\  continuación (fin de línea)', '@  decorador / matmul'],
      forbidden: ['$', '?', '! (solo)', '`', '¿ ¡', '“ ”', '€'],
    },
  },
  js: {
    name: 'JavaScript',
    icon: '⚡',
    keywords: 'break case catch class const continue debugger default delete do else export extends false finally for function if import in instanceof let new null return super switch this throw true try typeof var void while with yield async await of static',
    valueKw: ['true', 'false', 'null', 'this', 'super'],
    lineComment: '//',
    blockComment: true,
    quotes: ['"', "'", '`'],
    triple: false,
    stringPrefix: null,
    lineContinuation: false,
    dollarIdent: true,
    num: /(?:0[xX][\da-fA-F_]+|0[oO][0-7_]+|0[bB][01_]+|(?:\d[\d_]*\.?[\d_]*|\.\d[\d_]*)(?:[eE][+-]?\d[\d_]*)?)n?/y,
    ops: ['>>>=', '...', '===', '!==', '**=', '<<=', '>>=', '>>>', '&&=', '||=', '??=', '=>', '==', '!=', '<=', '>=', '&&', '||', '??', '?.', '++', '--', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '**', '<<', '>>', '+', '-', '*', '/', '%', '&', '|', '^', '~', '!', '?', ':', '=', '<', '>'],
    delims: ['(', ')', '[', ']', '{', '}', ';', ',', '.'],
    binOnly: ['>>>=', '===', '!==', '**=', '<<=', '>>=', '>>>', '&&=', '||=', '??=', '=>', '==', '!=', '<=', '>=', '&&', '||', '??', '?.', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '**', '<<', '>>', '*', '/', '%', '&', '|', '^', '?', ':', '=', '<', '>'],
    commentEdge: '// /*',
    alphabet: {
      specials: ['$ y _ en identificadores', '//  /* */  comentarios', '\'  "  `  cadenas', '/patrón/  regex', '#nombre  campo privado'],
      forbidden: ['@', '# (suelto)', '\\ (suelto)', '¿ ¡', '“ ”', '€', '°'],
    },
  },
  cpp: {
    name: 'C++',
    icon: '⚙️',
    keywords: 'alignas alignof and asm auto bool break case catch char char16_t char32_t class const constexpr const_cast continue decltype default delete do double dynamic_cast else enum explicit export extern false float for friend goto if inline int long mutable namespace new noexcept not nullptr operator or private protected public register reinterpret_cast return short signed sizeof static static_assert static_cast struct switch template this throw true try typedef typeid typename union unsigned using virtual void volatile wchar_t while override final',
    valueKw: ['true', 'false', 'nullptr', 'this'],
    lineComment: '//',
    blockComment: true,
    quotes: ['"', "'"],
    triple: false,
    stringPrefix: /^(u8|u|U|L)$/,
    lineContinuation: true,
    dollarIdent: false,
    num: /(?:0[xX][\da-fA-F']+(?:\.[\da-fA-F']*)?(?:[pP][+-]?\d+)?|0[bB][01']+|(?:\d[\d']*\.?[\d']*|\.\d[\d']*)(?:[eE][+-]?\d+)?)(?:[uU](?:ll|LL|[lLzZ])?|(?:ll|LL|[lL])[uU]?|[fFlL])?/y,
    ops: ['<=>', '<<=', '>>=', '->*', '->', '.*', '++', '--', '<<', '>>', '<=', '>=', '==', '!=', '&&', '||', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '+', '-', '*', '/', '%', '&', '|', '^', '~', '!', '=', '<', '>', '?', ':'],
    delims: ['...', '::', '(', ')', '[', ']', '{', '}', ';', ',', '.'],
    binOnly: ['<=>', '<<=', '>>=', '->*', '->', '.*', '<<', '>>', '<=', '>=', '==', '!=', '||', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '/', '%', '|', '^', '=', '<', '>', '?', ':'],
    commentEdge: '// /*',
    alphabet: {
      specials: ['#  directivas (inicio de línea)', '//  /* */  comentarios', '"  cadenas', '\'  caracteres', "1'000  separador de dígitos", 'R"(...)"  cadena cruda'],
      forbidden: ['$', '@', '`', '¿ ¡', '“ ”', '€'],
    },
  },
};

// Pre-cálculo: conjuntos y tabla de símbolos ordenada por longitud (maximal munch)
for (const L of Object.values(LANGS)) {
  L.kwSet = new Set(L.keywords.split(' '));
  L.binSet = new Set(L.binOnly);
  L.symbols = [
    ...L.ops.map(v => ({ v, t: 'operator' })),
    ...L.delims.map(v => ({ v, t: 'delimiter' })),
  ].sort((a, b) => b.v.length - a.v.length);
}

const isIdStart = (c, L) => !!c && (/[\p{L}_]/u.test(c) || (L.dollarIdent && c === '$'));
const isIdPart = (c, L) => !!c && (/[\p{L}\p{N}\p{Mn}\p{Mc}_]/u.test(c) || (L.dollarIdent && c === '$'));

/* ---------- Explicaciones de por qué un carácter no pertenece al alfabeto ---------- */
function explainChar(ch, key) {
  const lang = LANGS[key].name;
  const cp = 'U+' + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
  const S = {
    '$': {
      python: 'Python no utiliza «$» en ningún token: no sirve para nombrar variables ni es un operador. (Es típico de PHP, Bash o jQuery, pero no de Python.)',
      cpp: 'El estándar de C++ no incluye «$» en su conjunto de caracteres. GCC/Clang lo toleran en identificadores como extensión, pero no es estándar ni portable.',
    },
    '@': {
      js: 'El JavaScript estándar no tiene «@» en su alfabeto. Los decoradores (@algo) solo existen en TypeScript o con transpiladores como Babel.',
      cpp: '«@» no pertenece al conjunto de caracteres de C++. Ningún token (identificador, operador o delimitador) puede contenerlo.',
    },
    '?': { python: 'Python no tiene operador «?». El condicional ternario se escribe con palabras: «a if condición else b».' },
    '!': { python: 'En Python «!» solo es válido como parte de «!=». Para negar se usa la palabra reservada «not».' },
    '`': {
      python: 'Las comillas invertidas no existen en Python 3 (en Python 2 equivalían a repr()). Usa comillas rectas \' o ".',
      cpp: 'C++ no usa comillas invertidas para nada. Las cadenas van entre " y los caracteres entre \'.',
    },
    '\\': {
      python: 'Fuera de una cadena, «\\» solo es válida como continuación de línea, es decir, como ÚLTIMO carácter de la línea. Aquí hay algo después de ella.',
      cpp: 'Fuera de cadenas, «\\» solo puede usarse al final de una línea (continuación). Aquí aparece suelta.',
      js: 'En JavaScript «\\» solo tiene sentido dentro de cadenas o expresiones regulares (secuencias de escape). Suelta no forma ningún token.',
    },
    '#': {
      js: 'En JavaScript «#» solo es válido para campos privados de clase (#nombre) o el shebang «#!» de la primera línea. Para comentar usa // o /* */.',
      cpp: 'En C++ «#» solo es válido al inicio de una línea como directiva de preprocesador (#include, #define…). Para comentar usa // o /* */.',
    },
  };
  if (S[ch] && S[ch][key]) return S[ch][key];
  if ('“”„‟'.includes(ch)) return `«${ch}» es una comilla tipográfica (curva), típica de Word, Google Docs o WhatsApp. El autómata de ${lang} solo reconoce comillas rectas (" y '), así que no existe transición posible con este carácter.`;
  if ('‘’‚‛'.includes(ch)) return `«${ch}» es un apóstrofo tipográfico (curvo). ${lang} solo reconoce la comilla simple recta (').`;
  if ('«»'.includes(ch)) return `«${ch}» son comillas angulares del español: bonitas en un libro, inexistentes en el alfabeto de ${lang}.`;
  if ('¿¡'.includes(ch)) return `«${ch}» es un signo de apertura del español. Ningún lenguaje de programación lo incluye en su alfabeto (solo puede aparecer dentro de cadenas o comentarios).`;
  if ('\u00A0\u200B\u200C\u200D\u2060\uFEFF\u2028\u2029'.includes(ch)) return `Carácter invisible (${cp}). Suele colarse al copiar código desde páginas web o documentos. ${lang} no lo reconoce como un espacio válido.`;
  if (/\p{Extended_Pictographic}/u.test(ch)) return `¡Un emoji! «${ch}» es simpático, pero no forma parte del alfabeto de ${lang} fuera de cadenas o comentarios.`;
  if ('–—−×÷'.includes(ch)) return `«${ch}» parece un operador matemático, pero no es el carácter ASCII que ${lang} espera (usa - para restar, * para multiplicar y / para dividir).`;
  return `El carácter «${ch}» (${cp}) no pertenece al alfabeto Σ de ${lang}: desde el estado actual no existe ninguna transición con este símbolo, así que el autómata cae en el estado de error.`;
}

/* ============================== ESCÁNER ============================== */
function tokenize(src, key) {
  const L = LANGS[key];
  const n = src.length;
  const tokens = [];
  const errors = [];
  const lineStarts = [0];
  for (let k = 0; k < n; k++) if (src[k] === '\n') lineStarts.push(k + 1);

  const pos = off => {
    let lo = 0, hi = lineStarts.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (lineStarts[mid] <= off) lo = mid; else hi = mid - 1; }
    return { line: lo + 1, col: off - lineStarts[lo] + 1 };
  };
  let directiveLine = -1;
  const push = (type, start, end, extra = {}) => {
    const p = pos(start);
    const t = { type, value: src.slice(start, end), start, end, line: p.line, col: p.col, ...extra };
    if (key === 'cpp' && p.line === directiveLine) t.inDirective = true;
    tokens.push(t);
    return t;
  };
  const fail = (start, end, reason, title) => errors.push(push('error', start, end, { reason, title }));
  const lastSig = () => { for (let k = tokens.length - 1; k >= 0; k--) if (tokens[k].type !== 'comment') return tokens[k]; return null; };
  const isWS = key === 'js' ? c => /\s/.test(c) : c => ' \t\n\r\f\v'.includes(c);

  function readString(start, qi) {
    const q = src[qi];
    if (L.triple && src.startsWith(q + q + q, qi)) {
      let k = qi + 3;
      while (k < n) {
        if (src[k] === '\\') { k += 2; continue; }
        if (src.startsWith(q + q + q, k)) { push('string', start, k + 3); return k + 3; }
        k++;
      }
      fail(start, n, `La cadena multilínea abre con ${q.repeat(3)} pero el autómata llegó al final del código sin encontrar el cierre. Nunca alcanzó un estado de aceptación.`, 'Cadena multilínea sin cerrar');
      return n;
    }
    const multi = key === 'js' && q === '`';
    let k = qi + 1;
    while (k < n) {
      const ch = src[k];
      if (ch === '\\') { k += 2; continue; }
      if (ch === q) { push('string', start, k + 1); return k + 1; }
      if (ch === '\n' && !multi) break;
      k++;
    }
    const end = Math.min(k, n);
    fail(start, end, `La cadena abre con ${q} pero el autómata llegó al ${k >= n ? 'final del código' : 'final de la línea'} sin encontrar el ${q} de cierre. El estado «dentro de cadena» nunca llegó a un estado de aceptación.`, 'Cadena sin cerrar');
    return end;
  }

  function readRaw(start, qi) {
    const m = /^"([^()\\\s]{0,16})\(/.exec(src.slice(qi, qi + 20));
    if (!m) return readString(start, qi);
    const close = ')' + m[1] + '"';
    const e = src.indexOf(close, qi + m[0].length);
    if (e < 0) { fail(start, n, 'La cadena cruda R"(...)" nunca se cerró.', 'Cadena cruda sin cerrar'); return n; }
    push('string', start, e + close.length);
    return e + close.length;
  }

  function scanRegex(i) {
    let k = i + 1, inClass = false;
    while (k < n) {
      const ch = src[k];
      if (ch === '\n') return -1;
      if (ch === '\\') { k += 2; continue; }
      if (ch === '[') inClass = true;
      else if (ch === ']') inClass = false;
      else if (ch === '/' && !inClass) { k++; while (k < n && /[a-z]/i.test(src[k])) k++; return k; }
      k++;
    }
    return -1;
  }

  let i = 0;
  while (i < n) {
    const c = src[i], nx = src[i + 1];
    if (isWS(c)) { i++; continue; }

    // --- Comentarios ---
    if (L.lineComment && src.startsWith(L.lineComment, i)) {
      let e = src.indexOf('\n', i); if (e < 0) e = n;
      push('comment', i, e); i = e; continue;
    }
    if (L.blockComment && src.startsWith('/*', i)) {
      const e = src.indexOf('*/', i + 2);
      if (e < 0) { fail(i, n, 'Comentario de bloque /* sin cerrar: el autómata llegó al final del código esperando */ y nunca lo encontró.', 'Comentario sin cerrar'); i = n; }
      else { push('comment', i, e + 2); i = e + 2; }
      continue;
    }

    // --- Barra invertida (continuación de línea) ---
    if (c === '\\') {
      const m = /^\\[ \t]*(\r?\n|$)/.exec(src.slice(i, i + 200));
      if (L.lineContinuation && m) { const p = lastSig(); if (p) p.cont = true; i += m[0].length; continue; }
      fail(i, i + 1, explainChar('\\', key), 'Barra invertida suelta'); i++; continue;
    }

    // --- Identificadores / palabras reservadas / prefijos de cadena ---
    if (isIdStart(c, L)) {
      let e = i + 1;
      while (e < n && isIdPart(src[e], L)) e++;
      const word = src.slice(i, e);
      if (key === 'cpp' && /^(u8|u|U|L)?R$/.test(word) && src[e] === '"') { i = readRaw(i, e); continue; }
      if (L.stringPrefix && L.stringPrefix.test(word) && L.quotes.includes(src[e])) { i = readString(i, e); continue; }
      push(L.kwSet.has(word) ? 'keyword' : 'identifier', i, e); i = e; continue;
    }

    // --- Números ---
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(nx || ''))) {
      L.num.lastIndex = i;
      const m = L.num.exec(src);
      let e = i + m[0].length;
      if (key === 'cpp' && src[e] === '_') { while (e < n && isIdPart(src[e], L)) e++; push('number', i, e, { note: 'literal de usuario' }); i = e; continue; }
      if (e < n && isIdPart(src[e], L)) {
        let f = e; while (f < n && isIdPart(src[f], L)) f++;
        fail(i, f, `«${src.slice(i, f)}» empieza como número pero continúa con letras. El autómata estaba en el estado NÚMERO y no tiene transición con «${src[e]}»: no es un número válido ni un identificador (los identificadores no pueden empezar con dígito).`, 'Literal numérico inválido');
        i = f; continue;
      }
      push('number', i, e); i = e; continue;
    }

    // --- Cadenas ---
    if (L.quotes.includes(c)) { i = readString(i, i); continue; }

    // --- Regex en JavaScript ---
    if (key === 'js' && c === '/') {
      const p = lastSig();
      const operandBefore = p && (['identifier', 'number', 'string', 'regex'].includes(p.type) || (p.type === 'keyword' && L.valueKw.includes(p.value)) || (p.type === 'delimiter' && (p.value === ')' || p.value === ']')));
      if (!operandBefore) {
        const e = scanRegex(i);
        if (e > 0) { push('regex', i, e); i = e; continue; }
      }
    }

    // --- Casos especiales por lenguaje ---
    if (key === 'python' && c === '@') {
      if (nx === '=') { push('operator', i, i + 2); i += 2; continue; }
      const p = lastSig();
      const curLine = pos(i).line;
      const nextNon = /^[ \t]*([^ \t\r\n]?)/.exec(src.slice(i + 1, i + 100))[1];
      if ((!p || p.line < curLine) && isIdStart(nx, L)) { push('decorator', i, i + 1); i++; continue; }
      const pOperand = p && p.line === curLine && (['identifier', 'number', 'string'].includes(p.type) || (p.type === 'delimiter' && (p.value === ')' || p.value === ']')));
      if (pOperand && nextNon && (isIdStart(nextNon, L) || /[0-9(\[]/.test(nextNon))) { push('operator', i, i + 1, { note: 'multiplicación de matrices' }); i++; continue; }
      fail(i, i + 1, 'En Python «@» solo forma parte del vocabulario en dos papeles: como decorador al inicio de una línea (@staticmethod) o como operador de multiplicación de matrices entre dos operandos (a @ b). Aquí está suelto, sin cumplir ninguno de los dos papeles, así que el escáner no puede formar un lexema válido con él.', 'Símbolo @ suelto');
      i++; continue;
    }
    if (key === 'js' && c === '#') {
      if (i === 0 && nx === '!') { let e = src.indexOf('\n'); if (e < 0) e = n; push('comment', 0, e); i = e; continue; }
      if (isIdStart(nx, L)) { let e = i + 1; while (e < n && isIdPart(src[e], L)) e++; push('identifier', i, e, { note: 'campo privado' }); i = e; continue; }
    }
    if (key === 'cpp' && c === '#') {
      const ln = pos(i).line;
      if (/^[ \t]*$/.test(src.slice(lineStarts[ln - 1], i))) {
        let e = i + 1;
        while (e < n && (src[e] === ' ' || src[e] === '\t')) e++;
        while (e < n && isIdPart(src[e], L)) e++;
        directiveLine = ln;
        push('preproc', i, e);
        if (src.slice(i + 1, e).trim() === 'include') {
          let k = e; while (k < n && (src[k] === ' ' || src[k] === '\t')) k++;
          if (src[k] === '<') {
            const close = src.indexOf('>', k), nl = src.indexOf('\n', k);
            if (close > 0 && (nl < 0 || close < nl)) { push('string', k, close + 1, { note: 'cabecera' }); i = close + 1; continue; }
          }
        }
        i = e; continue;
      }
      if (ln === directiveLine) { const len = nx === '#' ? 2 : 1; push('operator', i, i + len); i += len; continue; }
    }

    // --- Operadores y delimitadores (coincidencia más larga) ---
    const sym = L.symbols.find(s => src.startsWith(s.v, i));
    if (sym) { push(sym.t, i, i + sym.v.length); i += sym.v.length; continue; }

    // --- Ninguna transición posible: ERROR LÉXICO ---
    const ch = String.fromCodePoint(src.codePointAt(i));
    fail(i, i + ch.length, explainChar(ch, key), 'Carácter fuera del alfabeto');
    i += ch.length;
  }
  return { tokens, errors };
}

/* ======================= RADAR SINTÁCTICO (heurístico) ======================= */
const PAIR_HINTS = {
  python: { '&&': 'En Python el «Y lógico» se escribe con la palabra «and».', '||': 'En Python el «O lógico» se escribe con la palabra «or».', '===': 'Python no tiene «===»; para comparar usa «==».', '!==': 'Python no tiene «!==»; usa «!=».', '==': '¿Querías comparar? Usa «==» sin espacios en medio.' },
  js: { '==>': '¿Querías una función flecha? Es «=>».' },
  cpp: { '===': 'C++ no tiene «===»; usa «==».' },
};

function syntaxRadar(tokens, key) {
  const L = LANGS[key];
  const W = [];
  const toks = tokens.filter(t => !['comment', 'error', 'preproc'].includes(t.type) && !t.inDirective);
  const OPEN = { '(': ')', '[': ']', '{': '}' };
  const CLOSE = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  const warn = (t, msg, hint, kind = 'syntax') => W.push({ line: t.line, col: t.col, start: t.start, end: t.end, value: t.value, msg, hint, kind });
  const isOp = t => t && t.type === 'operator';
  const exempt = (p, t) => {
    if (key === 'cpp' && ['*', '&', '&&'].includes(p.value) && ['>', '>>', ',', '='].includes(t.value)) return true;
    if (key === 'cpp' && p.value === '<' && t.value === '>') return true;
    return false;
  };

  for (let k = 0; k < toks.length; k++) {
    const t = toks[k], p = toks[k - 1], nxt = toks[k + 1];
    const depthBefore = stack.length;
    t.depth = depthBefore;

    if (t.type === 'delimiter') {
      if (OPEN[t.value]) stack.push(t);
      else if (CLOSE[t.value]) {
        const top = stack.pop();
        if (!top) warn(t, `Cierre «${t.value}» sin su apertura «${CLOSE[t.value]}». El analizador sintáctico no sabe qué está cerrando.`, 'Elimina el cierre sobrante o añade la apertura que falta.');
        else if (top.value !== CLOSE[t.value]) warn(t, `Se esperaba «${OPEN[top.value]}» para cerrar el «${top.value}» abierto en la línea ${top.line}, pero llegó «${t.value}».`, 'Los paréntesis, corchetes y llaves deben cerrarse en orden inverso a como se abrieron (como una pila).');
      }
      t.depthAfter = stack.length;
      continue;
    }
    t.depthAfter = stack.length;

    if (isOp(t)) {
      const pIsOp = isOp(p) && !['++', '--'].includes(p.value);
      const newStmt = key === 'python' && p && p.line < t.line && depthBefore === 0 && !p.cont;
      const startPos = !p || newStmt || (p.type === 'delimiter' && ['(', '[', '{', ',', ';', ':'].includes(p.value));
      if (L.binSet.has(t.value)) {
        if (pIsOp && !exempt(p, t)) {
          const pair = p.value + t.value;
          const hint = (PAIR_HINTS[key] && PAIR_HINTS[key][pair]) || `Un operador binario necesita un operando a cada lado. Prueba algo como: 20 ${p.value} 3 ${t.value} 5`;
          warn(t, `Choque de operadores: «${p.value}» seguido de «${t.value}». Ambos son lexemas válidos, pero «${t.value}» se quedó sin operando a su izquierda.`, hint);
        } else if (startPos && !(p && p.type === 'delimiter' && p.value === '[' && key === 'cpp' && t.value === '=')) {
          const pyUnpack = key === 'python' && (t.value === '*' || t.value === '**');
          const pySlash = key === 'python' && t.value === '/' && nxt && nxt.type === 'delimiter' && [',', ')'].includes(nxt.value);
          if (!pyUnpack && !pySlash) warn(t, `«${t.value}» aparece sin ningún operando a su izquierda.`, 'Revisa qué valor debería ir antes del operador.');
        }
      } else if (key === 'cpp' && pIsOp && (t.value === '*' || t.value === '&') && nxt && nxt.type === 'number') {
        warn(t, `Gramaticalmente C++ lee «${t.value}${nxt.value}» como un operador unario aplicado a ${nxt.value} (${t.value === '*' ? 'desreferenciar' : 'obtener su dirección'}), así que el parser no protesta… pero ${nxt.value} es un literal, no un puntero ni una variable.`, 'Este fallo lo detectaría el análisis SEMÁNTICO (comprobación de tipos), la fase que viene después del sintáctico.', 'semantic');
      }
    }

    if (p && p.line === t.line) {
      const lit = x => x.type === 'number' || x.type === 'string';
      if ((p.type === 'number' && (t.type === 'number' || t.type === 'identifier')) || (p.type === 'identifier' && t.type === 'number') || (p.type === 'string' && t.type === 'number') || (lit(p) && t.type === 'identifier' && key !== 'cpp')) {
        warn(t, `Dos operandos pegados («${p.value}» y «${t.value}») sin ningún operador entre ellos.`, '¿Falta un operador (+, -, *, ,) entre ambos?');
      }
    }
  }

  if (key === 'python') {
    for (let k = 0; k < toks.length - 1; k++) {
      const t = toks[k], nxt = toks[k + 1];
      if (nxt.line > t.line && isOp(t) && t.depthAfter === 0 && !t.cont && !['++', '--'].includes(t.value)) {
        warn(t, `La línea ${t.line} termina en «${t.value}»: al operador le falta su operando derecho.`, 'En Python una instrucción termina con el salto de línea (salvo dentro de paréntesis).');
      }
    }
  }
  stack.forEach(o => warn(o, `«${o.value}» se abrió en la línea ${o.line} y nunca se cerró.`, `Añade el «${OPEN[o.value]}» correspondiente.`));
  const last = toks[toks.length - 1];
  if (isOp(last) && !['++', '--'].includes(last.value)) warn(last, `El código termina en «${last.value}»: el operador se quedó esperando su operando derecho.`, 'Completa la expresión o elimina el operador.');

  return W.sort((a, b) => a.start - b.start);
}
