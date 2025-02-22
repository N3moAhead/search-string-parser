import {
  tokenize,
  parse,
  transform2DisplayString,
  transform2SqlString,
} from "../src/searchStringParser";

const testSearchString =
  "firstName:lachen and lastName=weinen or lastName=tanzen or age~21";

const tokenList = tokenize(testSearchString);
const ast = parse(tokenList);
console.log("AST:\n", JSON.stringify(ast, null, 2));
const displayString = transform2DisplayString(ast);
const sql = transform2SqlString(ast);
console.log("Original Input\n", testSearchString);
console.log("Transformed Text Output\n", displayString);
console.log("Transformed SQL Output\n", sql);
