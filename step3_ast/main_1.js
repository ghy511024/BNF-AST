/**
 * Created by ghy on 2019/4/11.
 */
const ASTParse = require('./ASTParse');
var RuleParser = require('./RuleParser');

const bnf = `
<数字>     ::= 0|1|2|3|4|5|6|7|8|9
<整形>     ::= <数字><整形> | <数字>
`
const ruleMap = RuleParser.parse(bnf);
const pro = `567`;

const ast = ASTParse(pro, ruleMap);

console.log(JSON.stringify(ast));
