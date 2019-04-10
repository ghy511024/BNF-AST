/**
 * Created by ghy on 2019/4/3.
 */


function parse_rules(bnf) {
    rules_raw = bnf.split(/(<.*?>)\s*::=\s*(.*)\s*/);
    rules = {};
    for (var i = 0; i + 2 < rules_raw.length; i += 3) {
        rules[rules_raw[i + 1]] = parse_rule(rules_raw[i + 2]);
    }
    return rules;
}
var sqwat = 0;
function ASTParse(string, rules) {
    var pos = 0;
    var max_streak = 0;
    var most_likely_error = {};

    function visit_rule_opt(rule, reject_ast, attempt) {
        var ast = reject_ast;

        function backtrack(errtxt, heuristic) {
            if (pos >= max_streak && errtxt != undefined && errtxt) {
                if (pos > max_streak)
                    most_likely_error = {};
                if (most_likely_error[errtxt] == undefined)
                    most_likely_error[errtxt] = 0;
                most_likely_error[errtxt] = Math.max(most_likely_error[errtxt], heuristic);
                max_streak = pos;
            }

            while (ast.length) {
                var olditem = ast[ast.length - 1];

                if (olditem == undefined)
                    throw " err";

                if (olditem.type != "rule") {
                    ast.pop();
                    continue;
                }

                var different_ast = visit_rule(olditem.name, rules[olditem.name], olditem);

                if (different_ast != null) {
                    ast[ast.length - 1] = different_ast; // Keep the new interpretation
                    return true; // Continue parsing from here
                }

                ast.pop();
            }

            return false;
        }

        if (ast.length)
            if (!backtrack("Extra symbols at end of input", 10))
                return null;


        for (var i = ast.length; i < rule.length; ++i) {
            var item = rule[i];
            var spos = pos;
            if (item in rules) {
                if (attempt) {
                    if (i < attempt.length && attempt[i].pos == pos && attempt[i].type == "rule" && attempt[i].name == item) {
                        ast[i] = attempt[i];
                        pos = attempt[i].epos;
                        continue;
                    }
                    attempt = null;
                }

                var stree = visit_rule(item, rules[item], (i < ast.length) ? ast[i] : null);
                if (stree == null) {
                    if (!backtrack("Expected " + item, i))
                        return null;
                    i = ast.length - 1;
                    continue;
                }
                ast[i] = stree;
                continue;
            }
            else if (item == " ") {
                var spos = pos;
                while (/\s/.test(string[pos])) ++pos;
                ast[i] = {type: "white", pos: spos, epos: pos, name: " "};
                continue;
            }
            else {
                if (string.substr(pos, item.length) != item) {
                    if (!backtrack("Expected `" + item + "'", i))
                        return null;
                    i = ast.length - 1;
                    continue;
                }

                if (attempt) {
                    if (i < attempt.length && attempt[i].pos == pos && attempt[i].type == "token" && attempt[i].name == item) {
                        ast[i] = attempt[i];
                        pos = attempt[i].epos;
                        continue;
                    }
                    attempt = null;
                }

                //成功转换为token
                pos += item.length;
                ast[i] = {type: "token", name: item, pos: spos, epos: pos}
            }
        }
        return ast;
    }

    var tolerance = 64;
    var worthless_nests = 0;
    var last_position = 0;

    function visit_rule(rule_name, whole_rule, reject_ast) {
        var ast = reject_ast;
        var nonnullsub = null;
        var offset = 0;

        if (pos > last_position) {
            last_position = pos;
            worthless_nests = 0;
        }
        if (++worthless_nests >= tolerance) {
            --worthless_nests;
            return null;
        }

        if (ast != null) {
            nonnullsub = ast.ast;
            pos = ast.pos;
            if (ast.type != "rule" || ast.ind == undefined) {
                if (worthless_nests > 0) --worthless_nests;
                return null;
            }
            var different_ast = visit_rule_opt(whole_rule[ast.ind], ast.ast, null);
            if (different_ast != null) {
                if (worthless_nests > 0) --worthless_nests;
                return {ind: ast.ind, type: "rule", name: rule_name, ast: different_ast, pos: ast.pos, epos: pos};
            }
            offset = ast.ind + 1;
        }

        for (var i = offset; i < whole_rule.length; ++i) {
            var rule = whole_rule[i];
            var spos = pos;
            var ap = visit_rule_opt(rule, [], nonnullsub);
            if (ap != null) {
                if (worthless_nests > 0) --worthless_nests;
                return ({ind: i, type: "rule", name: rule_name, ast: ap, pos: spos, epos: pos});
            }
            pos = spos;
        }

        if (worthless_nests > 0) --worthless_nests;
        return null;
    }

    sqwat = 0;
    brute_rule = [];
    for (var r in rules)
        brute_rule.push([r]);
    var res = visit_rule("<>", brute_rule, null);
    while (pos < string.length) {
        if (res == null) break;
        res = visit_rule("<>", brute_rule, res);
    }

    if (!res) {
        if (most_likely_error) {
            var encompassed = string.substr(0, max_streak);
            var line = (encompassed.match(/(\r\n|\n|\r)/g) || []).length + 1;
            var errpos = max_streak - Math.max(encompassed.lastIndexOf("\n"), encompassed.lastIndexOf("\r"));
            var ec = 0;
            var the_most_likely_error = "[No error text]";
            for (err in most_likely_error)
                if (most_likely_error[err] > ec) {
                    the_most_likely_error = err;
                    ec = most_likely_error[err];
                } else if (most_likely_error[err] == ec)
                    the_most_likely_error += " OR " + err;
            res = {type: "error", error: the_most_likely_error, line: line, position: errpos}
            console.log(most_likely_error);
        }
    }

    return res;
}

module.exports = ASTParse