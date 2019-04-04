/**
 * Created by ghy on 2019/4/4.
 */

var ast = require('./ast_data')

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
    let res = "";
    if (ast.type == "rule") {
        for (var i = 0; i < ast.ast.length; ++i) {
            if (ast.ast[i].type == "rule") {
                res += ops[ast.ast[i].name](ast.ast[i], ops);
            } else if (ast.ast[i].type == "token") {
                res += ast.ast[i].name;
            }
        }
    }
    return res;
}
const interpreter = {
    "<数字>": operate,
    "<整形>": function (ast, ops) {
        var num = operate(ast, interpreter);
        return parseInt(num);
    },
    "<值>": function (ast, ops) {
        var value;
        if (ast.ast.length == 1) {
            value = operate(ast.ast[0], interpreter);
        } else {
            value = operate(ast.ast[2], interpreter);
        }

        return value;
    },
    "<计算>": function (ast, ops) {
        var value;
        if (ast.ast.length == 1) {
            value = operate(ast.ast[0], interpreter);
        } else {
            value = operate(ast.ast[2], interpreter);
        }

        return value;
    }
}
var res = operate(ast, interpreter);
console.log(res, typeof res);