import {
  tokenize,
  parse,
  transform2DisplayString,
  transform2SqlString,
} from "../src/searchStringParser";

const testSearchString = "(first:n3mo or first:john) and last:ahead";

const tokenList = tokenize(testSearchString);
console.log(tokenList);
const ast = parse(tokenList);
console.log("AST:\n", JSON.stringify(ast, null, 2));
const displayString = transform2DisplayString(ast);
const sql = transform2SqlString(ast);
console.log("Original Input\n", testSearchString);
console.log("Transformed Text Output\n", displayString);
console.log("Transformed SQL Output\n", sql);
