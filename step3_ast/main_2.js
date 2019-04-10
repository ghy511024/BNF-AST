/**
 * Created by ghy on 2019/4/11.
 */
const RuleParser = require('../lib/RuleParser');

const ASTParse = require('../lib/ASTParse');
const bnf = `
<数字>     ::= 0|1|2|3|4|5|6|7|8|9
<整形>     ::= <数字><整形> | <数字>
<值>       ::= <整形> | ( <表达式> )
<计算>     ::= <值> | <值> 乘 <计算> | <值> 除 <计算>
<表达式>   ::= <计算> | <计算> 加 <表达式> | <计算> 减 <表达式>
`
const pro = `8除(1加3)`
var rulsMap = RuleParser.parse(bnf)

let ast = ASTParse(pro, rulsMap);

console.log(JSON.stringify(ast));