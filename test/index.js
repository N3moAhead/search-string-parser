import {
  tokenize,
  parse,
  compile2DisplayString,
} from "../src/searchStringParser";

const testSearchString =
  "firstName:lachen and lastName=weinen or lastName=tanzen or age~21";

const tokenList = tokenize(testSearchString);
const ast = parse(tokenList);
console.log("AST:\n", JSON.stringify(ast, null, 2));
const displayString = compile2DisplayString(ast);
console.log("Original Input\n", testSearchString);
console.log("Compiled Output\n", displayString);
