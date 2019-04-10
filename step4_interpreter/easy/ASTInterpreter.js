/**
 * Created by ghy on 2019/4/4.
 */
const operate = require('./ASTCore').operate;
const print = require('./ASTCore').print;
const do_operator = require('./ASTCore').do_operator;

const interpreter = {
    "<数字>": function (ast, ops) {
        var num = print(ast, ops);
        let ret = parseInt(num);
        return parseInt(ret);
    },
    "<整形>": function (ast, ops) {
        var num = print(ast, interpreter);
        let ret = parseInt(num);
        return ret
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
            value = do_operator(ast.ast[2].name, operate(ast.ast[0], ops), operate(ast.ast[4], ops));
        }
        return value;
    },
    "<表达式>": function (ast, ops) {
        let value;
        if (ast.ast.length == 1) {
            value = operate(ast.ast[0], ops)
        } else {
            value = do_operator(ast.ast[2].name, operate(ast.ast[0], ops), operate(ast.ast[4], ops));
        }
        return value;
    }
}

module.exports = function (ast) {
    var res = operate(ast, interpreter);
    return res;
};