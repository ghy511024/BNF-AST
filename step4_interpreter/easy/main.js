/**
 * Created by ghy on 2019/4/11.
 */

const ASTParse = require('./ASTParse'); // bnf 转换器
const RuleParser = require('./RuleParser'); // ast 生成器
const ASTInterpreter = require('./ASTInterpreter');// 解释器

const bnf = `
<数字>     ::= 0|1|2|3|4|5|6|7|8|9
<整形>     ::= <数字><整形> | <数字>
<值>       ::= <整形> | ( <表达式> )
<计算>     ::= <值> | <值> 乘 <计算> | <值> 除 <计算>
<表达式>   ::= <计算> | <计算> 加 <表达式> | <计算> 减 <表达式>
`
const pro = `8除(1加3)`;
var rulsMap = RuleParser.parse(bnf)// 生成rule map
let ast = ASTParse(pro, rulsMap);  // 生成抽象语法树
let result = ASTInterpreter(ast);  // 解析抽象语法树

console.log(result);
