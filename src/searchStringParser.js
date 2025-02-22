function tokenize(searchString) {
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

function parse(tokenList) {
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

function compile2DisplayString(ast) {
  if (ast.type === "STATEMENT") {
    return `${ast.identifier}${ast.operator}${ast.value}`;
  }
  if (ast.type === "or" || ast.type === "and") {
    return `(${compile2DisplayString(ast.left)} ${ast.type === "or" ? "||" : "&&"} ${compile2DisplayString(ast.right)})`;
  }
  throw new Error(`Unknown type ${ast.type}`);
}

const testSearchString =
  "firstName:lachen and lastName=weinen or lastName=tanzen or age~21";

const tokenList = tokenize(testSearchString);
const ast = parse(tokenList);
console.log("AST:\n", JSON.stringify(ast, null, 2));
const displayString = compile2DisplayString(ast);
console.log("Original Input\n", testSearchString);
console.log("Compiled Output\n", displayString);
