/**
 * Created by ghy on 2019/4/3.
 */


var ast = {
    "ind": 0,
    "type": "rule",
    "name": "<>",
    "ast": [{
        "ind": 0,
        "type": "rule",
        "name": "<整形>",
        "ast": [
            {
            "ind": 1,
            "type": "rule",
            "name": "<数字>",
            "ast": [{"type": "token", "name": "一", "pos": 0, "epos": 1}],
            "pos": 0,
            "epos": 1
        }, {
            "ind": 1,
            "type": "rule",
            "name": "<整形>",
            "ast": [{
                "ind": 1,
                "type": "rule",
                "name": "<数字>",
                "ast": [{"type": "token", "name": "一", "pos": 1, "epos": 2}],
                "pos": 1,
                "epos": 2
            }],
            "pos": 1,
            "epos": 2
        }],
        "pos": 0,
        "epos": 2
    }],
    "pos": 0,
    "epos": 2
}
