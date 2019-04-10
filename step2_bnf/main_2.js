/**
 * Created by ghy on 2019/4/11.
 */
var RuleParser = require('./RuleParser');

const bnf = `
<数字>     ::= 0|1|2|3|4|5|6|7|8|9
<整形>     ::= <数字><整形> | <数字>
<值>       ::= <整形> | ( <表达式> )
<计算>     ::= <值> | <值> 乘 <计算> | <值> 除 <计算>
<表达式>   ::= <计算> | <计算> 加 <表达式> | <计算> 减 <表达式>
`
const ruleMap = RuleParser.parse(bnf);

console.log(JSON.stringify(ruleMap));