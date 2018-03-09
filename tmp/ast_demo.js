var d = {
    "type": "rule",
    "name": "<>",
    "ast": [{
        "type": "rule",
        "name": "<定义>",
        "ast": [
            {"type": "token", "name": "let"},
            {"type": "white", "name": " "},
            {
                "type": "rule",
                "name": "<变量 组>",
                "ast": [
                    {
                        "type": "rule",
                        "name": "<变量>",
                        "ast": [{
                            "type": "rule",
                            "name": "<字符>",
                            "ast": [{"type": "token", "name": "B"}],
                        }],
                    }],
            }],
    }],
}