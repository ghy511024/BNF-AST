/**
 * Created by ghy on 2019/4/4.
 */
const interpreter = {
    "<数字>": function (ast, ops) {
        var value = ast.name;
        var map = {
            "零": 0,
            "一": 1,
            "二": 2,
            "三": 3,
            "四": 4,
            "五": 5,
            "六": 6,
            "七": 7,
            "八": 8,
            "九": 9,
        }
        return map[value];
    },
    "<整形>": function (ast, ops) {
        var num = operate(ast, printer);
    }
}