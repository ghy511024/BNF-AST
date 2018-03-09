/**
 * Created by ghy on 2018/3/8.
 */

operators = {
    "+": function (x, y) {
        return x + y;
    }, "-": function (x, y) {
        return x - y;
    }
};
interpreter = {
    "<计算>": function (ast, ops) {
        if (ast.ast.length == 1) {
            return ast.val;
        }
        var fun = operators(ast.ast[1].name)
        return fun(ast.ast[0].val, ast.ast[2].val)
    },
    "<整形>": function (ast, ops) {
        var num = ast.name;
        return parseInt(num, 0);
    },
};
