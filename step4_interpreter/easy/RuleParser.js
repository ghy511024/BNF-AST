/**
 * Created by ghy on 2019/4/3.
 */
class RuleParser {
    //  解析整个bnf
    parse(bnf) {
        var rules_raw = bnf.split(/(<.*?>)\s*::=\s*(.*)\s*/);
        var rules = {};
        for (var i = 0; i + 2 < rules_raw.length; i += 3) {
            rules[rules_raw[i + 1]] = this._parse_rule(rules_raw[i + 2]);
        }
        return rules;
    }

    //字符串解码 &lt; &gt; &pipe; &#124; and &amp;
    _ndecode(x) {
        return x.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&pipe;/g, "|").replace(/&x7C;/g, "|").replace(/&amp;/g, "&");
    }

    //  字符串编码
    _nencode(x) {
        return x.replace(/&/g, "&amp;").replace(/\|/g, "&#124;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    //  解析单条规则
    _parse_rule(rule) {
        var res = [], resraw = rule.split(/\s*\|\s*/);
        for (var i = 0; i < resraw.length; ++i) {
            var psh = [], pshraw = resraw[i].split(/(<.*?>)/);
            for (var j = 0; j < pshraw.length; ++j) if (pshraw[j].length > 0) {
                if (pshraw[j][0] != '<') {
                    var isp = this._ndecode(pshraw[j]).split(/(\s+)/);
                    for (var k = 0; k < isp.length; ++k) if (isp[k].length > 0)
                        psh.push(isp[k].trim().length > 0 ? isp[k] : " ");
                }
                else {
                    psh.push(pshraw[j]);
                }
            }
            res.push(psh);
        }
        return res;
    }
}
// var bnf = `
// <整形>     ::= <数字><整形> | <数字>
// <数字>     ::= 0|1|2|3|4|5|6|7|8|9
// `
// var parse = new RuleParser();
// var result = parse.parse_rules(bnf);
// console.log(result)

module.exports = new RuleParser();