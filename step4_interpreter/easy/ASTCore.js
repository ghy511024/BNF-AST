/**
 * Created by ghy on 2019/4/10.
 */
var operators = {
    ">=": function (x, y) {
        return x >= y;
    },
    "加": function (x, y) {
        return x + y;
    },
    "<=": function (x, y) {
        return x <= y;
    },
    "减": function (x, y) {
        return x - y;
    },
    "==": function (x, y) {
        return x == y;
    },
    "乘": function (x, y) {
        return x * y;
    },
    "除": function (x, y) {
        return x / y;
    },
    "!=": function (x, y) {
        return x != y;
    },
    ">": function (x, y) {
        return x > y;
    },
    "&&": function (x, y) {
        return x && y;
    },
    "<": function (x, y) {
        return x < y;
    },
    "or": function (x, y) {
        return x || y;
    }
};
function operate(ast, ops) {
    if (ast.type == "rule" && ops[ast.name] != undefined) {
        return (ops[ast.name])(ast, ops);
    }
    return print(ast, ops);
}
function print(ast, ops) {
    let res = '';
    if (ast.type == "rule") {
        for (var i = 0; i < ast.ast.length; ++i) {
            if (ast.ast[i].type == "rule") {
                if (!res) {
                    res = ops[ast.ast[i].name](ast.ast[i], ops);
                } else {
                    res += ops[ast.ast[i].name](ast.ast[i], ops);
                }
            } else if (ast.ast[i].type == "token") {
                res += ast.ast[i].name;
            }
        }
    }
    return res;
}

function do_operator(op, x, y) {
    if (op in operators) {
        return operators[op](x, y);
    }
    throw("ASTCore error: operator `" + op + "'");
}
module.exports = {
    operate: operate,
    print: print,
    do_operator: do_operator,
}