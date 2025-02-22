export function tokenize(searchString) {
  function isCombiner(segment) {
    return segment === "or" || segment === "and";
  }

  function tokenizeStatementSegment(segment) {
    const regex = /(.*?)(!{0,1}[=~:])(.*)/;
    const result = segment.match(regex);
    if (result) {
      const [match, identifier, operator, value] = result;
      return { type: "STATEMENT", identifier, operator, value };
    }
    throw new Error(`Error while trying to parse segment ${segment}`);
  }

  const tokens = [];
  const segments = searchString.split(/\s+/);
  segments.forEach((segment) => {
    if (isCombiner(segment)) {
      // TODO add cleanup error correction and stuff like that...
      tokens.push({ type: segment });
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

    while (index < tokenList.length && tokenList[index].type === "or") {
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

    while (index < tokenList.length && tokenList[index].type === "and") {
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
    return tokenList[index++];
  }

  return parseExpression();
}

export function transform2DisplayString(ast) {
  if (ast.type === "STATEMENT") {
    return `${ast.identifier}${ast.operator}${ast.value}`;
  }
  if (ast.type === "or" || ast.type === "and") {
    return `(${transform2DisplayString(ast.left)} ${ast.type === "or" ? "||" : "&&"} ${transform2DisplayString(ast.right)})`;
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
  if (ast.type === "or" || ast.type === "and") {
    return `(${transform2SqlString(ast.left)} ${ast.type === "or" ? "OR" : "AND"} ${transform2SqlString(ast.right)})`;
  }
  throw new Error(`Unknown type ${ast.type}`);
}
