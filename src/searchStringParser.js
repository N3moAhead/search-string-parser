export function tokenize(searchString) {
  const TOKENS = {
    and: "AND",
    or: "OR",
    "(": "OPEN_PAREN",
    ")": "CLOSE_PAREN",
  };

  function tokenizeStatementSegment(segment) {
    const regex = /(.*?)(!{0,1}[=~:])(.*)/;
    const result = segment.match(regex);
    if (result) {
      const [match, identifier, operator, value] = result;
      return { type: "STATEMENT", identifier, operator, value };
    }
    throw new Error(`Error while trying to tokenize segment ${segment}`);
  }

  function splitStringSegments(searchString) {
    // Looks a bit funky but it splits at whitespace and before and after parenthesis
    return searchString
      .split(/(\s+|(?=[()])|(?<=[()]))/g)
      .filter((seg) => seg.trim().length > 0);
  }

  const tokens = [];
  const segments = splitStringSegments(searchString);
  segments.forEach((segment) => {
    if (TOKENS[segment]) {
      // TODO add error correction and stuff like that...
      tokens.push({ type: TOKENS[segment] });
    } else {
      tokens.push(tokenizeStatementSegment(segment));
    }
  });
  return tokens;
}

export function parse(tokenList) {
  let index = 0;

  function parseExpression() {
    let left = parseOr();
    return left;
  }

  function parseOr() {
    let left = parseAnd();

    while (index < tokenList.length && tokenList[index].type === "OR") {
      const combiner = tokenList[index].type;
      index++;
      const right = parseAnd();
      left = {
        type: combiner,
        left: left,
        right: right,
      };
    }

    return left;
  }

  function parseAnd() {
    let left = parsePrimary();

    while (index < tokenList.length && tokenList[index].type === "AND") {
      const combiner = tokenList[index].type;
      index++;
      const right = parsePrimary();
      left = {
        type: combiner,
        left: left,
        right: right,
      };
    }

    return left;
  }

  function parsePrimary() {
    if (index >= tokenList.length) {
      throw new Error("Unexpected end of input");
    }

    const token = tokenList[index];

    if (token.type === "OPEN_PAREN") {
      index++; // Consume '('
      const expression = parseExpression();

      if (
        index >= tokenList.length ||
        tokenList[index].type !== "CLOSE_PAREN"
      ) {
        throw new Error("Expected closing parenthesis");
      }
      index++; // Consume ')'
      return expression;
    }

    if (token.type === "STATEMENT") {
      index++; // Consume statement
      return token;
    }

    throw new Error(`Unexpected token: ${JSON.stringify(token)}`);
  }

  return parseExpression();
}

export function transform2DisplayString(ast) {
  if (ast.type === "STATEMENT") {
    return `${ast.identifier}${ast.operator}${ast.value}`;
  }
  if (ast.type === "OR" || ast.type === "AND") {
    return `(${transform2DisplayString(ast.left)} ${ast.type === "OR" ? "||" : "&&"} ${transform2DisplayString(ast.right)})`;
  }
  throw new Error(`Unknown type ${ast.type}`);
}

export function transform2SqlString(ast) {
  function transformSqlStatement(stmnt) {
    switch (stmnt.operator) {
      case "=":
        return `${stmnt.identifier} = ${stmnt.value}`;
      case "!=":
        return `${stmnt.identifier} != ${stmnt.value}`;
      case "~":
        return `${stmnt.identifier} ~* ${stmnt.value}`;
      case "!~":
        return `${stmnt.identifier} NOT ~* ${stmnt.value}`;
      case ":":
        return `${stmnt.identifier} LIKE '%${stmnt.value}%'`;
      case "!:":
        return `${stmnt.identifier} NOT LIKE '%${stmnt.value}%'`;
      default:
        throw new Error(`Unknown operator ${stmnt.operator}`);
    }
  }

  if (ast.type === "STATEMENT") {
    return transformSqlStatement(ast);
  }
  if (ast.type === "OR" || ast.type === "AND") {
    return `(${transform2SqlString(ast.left)} ${ast.type === "OR" ? "OR" : "AND"} ${transform2SqlString(ast.right)})`;
  }
  throw new Error(`Unknown type ${ast.type}`);
}
