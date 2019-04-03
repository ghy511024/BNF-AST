/**
 * Created by ghy on 2019/4/4.
 */
const RuleParser = require('../lib/RuleParser');
const ASTParse = require('../lib/ASTParse');
const bnf = `
<整形>     ::= <数字><整形> | <数字>
<数字>     ::= 零|一|二|三|四|五|六|七|八|九
<单引号>   ::= '
<双引号>   ::= "
<字符串>   ::= <单引号><整形><单引号>|<双引号><整形><双引号>
<字符>     ::= A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z
`
const pro = `一一`
var rulsMap = RuleParser.parse(bnf)

let ast = ASTParse(pro, rulsMap);

console.log(JSON.stringify(ast));