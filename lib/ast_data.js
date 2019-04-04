/**
 * Created by ghy on 2019/4/4.
 */
module.exports = {
    "ind": 4,
    "type": "rule",
    "name": "<>",
    "ast": [{
        "ind": 1,
        "type": "rule",
        "name": "<表达式>",
        "ast": [{
            "ind": 0,
            "type": "rule",
            "name": "<计算>",
            "ast": [{
                "ind": 0,
                "type": "rule",
                "name": "<值>",
                "ast": [{
                    "ind": 0,
                    "type": "rule",
                    "name": "<整形>",
                    "ast": [{
                        "ind": 1,
                        "type": "rule",
                        "name": "<数字>",
                        "ast": [{"type": "token", "name": "1", "pos": 0, "epos": 1}],
                        "pos": 0,
                        "epos": 1
                    }, {
                        "ind": 0,
                        "type": "rule",
                        "name": "<整形>",
                        "ast": [{
                            "ind": 2,
                            "type": "rule",
                            "name": "<数字>",
                            "ast": [{"type": "token", "name": "2", "pos": 1, "epos": 2}],
                            "pos": 1,
                            "epos": 2
                        }, {
                            "ind": 1,
                            "type": "rule",
                            "name": "<整形>",
                            "ast": [{
                                "ind": 3,
                                "type": "rule",
                                "name": "<数字>",
                                "ast": [{"type": "token", "name": "3", "pos": 2, "epos": 3}],
                                "pos": 2,
                                "epos": 3
                            }],
                            "pos": 2,
                            "epos": 3
                        }],
                        "pos": 1,
                        "epos": 3
                    }],
                    "pos": 0,
                    "epos": 3
                }],
                "pos": 0,
                "epos": 3
            }],
            "pos": 0,
            "epos": 3
        }, {"type": "white", "pos": 3, "epos": 3, "name": " "}, {
            "type": "token",
            "name": "加",
            "pos": 3,
            "epos": 4
        }, {"type": "white", "pos": 4, "epos": 4, "name": " "}, {
            "ind": 0,
            "type": "rule",
            "name": "<表达式>",
            "ast": [{
                "ind": 0,
                "type": "rule",
                "name": "<计算>",
                "ast": [{
                    "ind": 1,
                    "type": "rule",
                    "name": "<值>",
                    "ast": [
                        {"type": "token", "name": "(", "pos": 4, "epos": 5},
                        {
                        "ind": 1,
                        "type": "rule",
                        "name": "<表达式>",
                        "ast": [{
                            "ind": 0,
                            "type": "rule",
                            "name": "<计算>",
                            "ast": [{
                                "ind": 0,
                                "type": "rule",
                                "name": "<值>",
                                "ast": [{
                                    "ind": 1,
                                    "type": "rule",
                                    "name": "<整形>",
                                    "ast": [{
                                        "ind": 1,
                                        "type": "rule",
                                        "name": "<数字>",
                                        "ast": [{"type": "token", "name": "1", "pos": 5, "epos": 6}],
                                        "pos": 5,
                                        "epos": 6
                                    }],
                                    "pos": 5,
                                    "epos": 6
                                }],
                                "pos": 5,
                                "epos": 6
                            }],
                            "pos": 5,
                            "epos": 6
                        }, {"type": "white", "pos": 6, "epos": 6, "name": " "}, {
                            "type": "token",
                            "name": "加",
                            "pos": 6,
                            "epos": 7
                        }, {"type": "white", "pos": 7, "epos": 7, "name": " "}, {
                            "ind": 0,
                            "type": "rule",
                            "name": "<表达式>",
                            "ast": [{
                                "ind": 0,
                                "type": "rule",
                                "name": "<计算>",
                                "ast": [{
                                    "ind": 0,
                                    "type": "rule",
                                    "name": "<值>",
                                    "ast": [{
                                        "ind": 1,
                                        "type": "rule",
                                        "name": "<整形>",
                                        "ast": [{
                                            "ind": 1,
                                            "type": "rule",
                                            "name": "<数字>",
                                            "ast": [{"type": "token", "name": "1", "pos": 7, "epos": 8}],
                                            "pos": 7,
                                            "epos": 8
                                        }],
                                        "pos": 7,
                                        "epos": 8
                                    }],
                                    "pos": 7,
                                    "epos": 8
                                }],
                                "pos": 7,
                                "epos": 8
                            }],
                            "pos": 7,
                            "epos": 8
                        }],
                        "pos": 5,
                        "epos": 8
                    }, {"type": "white", "pos": 8, "epos": 8, "name": " "}, {
                        "type": "token",
                        "name": ")",
                        "pos": 8,
                        "epos": 9
                    }],
                    "pos": 4,
                    "epos": 9
                }],
                "pos": 4,
                "epos": 9
            }],
            "pos": 4,
            "epos": 9
        }],
        "pos": 0,
        "epos": 9
    }],
    "pos": 0,
    "epos": 9
}



