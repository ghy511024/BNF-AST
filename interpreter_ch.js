CORE = (function () {

    var logwin = null;

    function log(message) {
        if (!logwin) logwin = document.getElementById("conout");
        if (logwin) logwin.value += message;
        else alert("Couldn't find log window");
    }

    function getStringIn(input, msg) {
        while (input.length) {
            var res = input[0];
            input.splice(0, 1);
            if (res.length > 0)
                return {car: res, cdr: input};
        }
        return {car: prompt(msg), cdr: []};
    }

    function getInput(input, msg) {
        var res = getStringIn(input, msg);
        if (!res.car.match(/[0-9]+/))
            throw("Input error: Please input only integers. In an input file, they must be separated by whitespace.");
        res.car = parseInt(res.car);
        return res;
    }

    function strrep(str, reps) {
        var res = "";
        for (var j = 0; j < reps; ++j)
            res += " ";
        return res;
    }

    /**
     * This is the default print function. It handles all aspects of pretty-printing a rule.
     * @param ast    The AST to be printed.
     * @param ops    The printer operations; these are passed from function to function by the BNF backend.
     * @param spaces An array of strings to use in place of whitespace tokens from the AST.
     * @param inds   An array of indentation levels to apply to each rule in the given AST.
     * @param rinds  An array of booleans denoting whether to respect the current indentation level.
     */
    function defprint(ast, ops, spaces, inds, rinds) {
        var res = "", spc = 0, indc = 0, rindc = 0, rind;
        spaces = (spaces && spaces.length) ? spaces : (console.log("ERROR: " + spaces), [' ']);
        inds = inds || [];
        rinds = rinds || [];
        if (ast.type == "rule")
            for (var i = 0; i < ast.ast.length; ++i)
                if (ast.ast[i].type == "rule") {
                    var indo = ind;
                    if (indc < inds.length)
                        ind += inds[indc++];
                    if (rindc < rinds.length && (rind = rinds[rindc++]))
                        res += strrep(" ", ind);
                    res += operate(ast.ast[i], ops);
                    ind = indo;
                }
                else if (ast.ast[i].type == "token") {
                    if (rindc < rinds.length && (rind = rinds[rindc++]))
                        res += strrep(" ", ind);
                    res += ast.ast[i].name;
                }
                else res += spc < spaces.length ? spaces[spc++] : spaces[spaces.length - 1];
        return res;
    }
    printer = {
        indents: ind = 0, ///< This is the amount of indentation used in recurring levels of the pretty-printer; it must be a member of ops so it can be passed through bnf.operate().
        operate: operate = bnf.operate,
        generic: defprint,
        "<程序>": function (ast, ops) {
            return defprint(ast, ops, [' ', '\n', '\n', ''], [0, 2]);
        },
        "<定义 块>": function (ast, ops) {
            return defprint(ast, ops, ['\n']);
        },
        "<语句 块>": function (ast, ops) {
            return defprint(ast, ops, ['\n'], [], [1]) + (ast.ind ? "\n" : "");
        },
        "<定义>": function (ast, ops) {
            return defprint(ast, ops, [' ', '']);
        },
        "<变量 组>": function (ast, ops) {
            return defprint(ast, ops, ['', ' ']);
        },
        "<语句>": defprint, // This is just a big OR of other rules.
        "<赋值>": function (ast, ops) {
            return defprint(ast, ops, [' ', ' ', '']);
        },
        "<判断>": function (ast, ops) {
            return defprint(ast, ops, [' ', ' ', '\n', '', '\n', ''], [0, 2, 2], [0, 0, 0, 0, 1, 0, 1]);
        },
        "<循环>": function (ast, ops) {
            return defprint(ast, ops, [' ', ' ', '\n', ''], [0, 2, 2], [0, 0, 0, 0, 1]);
        },
        "<输入>": function (ast, ops) {
            return defprint(ast, ops, [' ', '']);
        },
        "<输出>": function (ast, ops) {
            return defprint(ast, ops, [' ', '']);
        },
        "<条件>": function (ast, ops) {
            return defprint(ast, ops, ['', ' ', ' ', '']);
        },
        "<比较>": function (ast, ops) {
            return defprint(ast, ops, ['', ' ', ' ', '']);
        },
        "<表达式>": defprint, "<计算>": defprint,
        "<值>": defprint, "<比较 符>": defprint,
        "<变量>": defprint, "<整形>": defprint,
        "<字符>": defprint, "<数字>": defprint,
    }

    function badRule(rule) {
        throw("Internal error: attempted to perform operation on " + (rule ? rule.name ? rule.name : "invalid rule" : "undefined rule")
        + ", which should not happen");
    }

    /// This function is called to ensure that an AST node is actually a rule.
    function assertRule(rule) {
        if (!rule || rule.type != "rule")
            throw("Internal error: " +
            (rule ? rule.type == "white" ? "rule expected, whitespace found"
                : rule.name ? "`" + rule.name + "' should have been a rule"
                    : "anonymous rule; not a rule" : "undefined rule: not in tree"));
    }

    /// This function is called to ensure that an AST node is the token the interpreter thinks it is.
    function assertToken(ast, ind, name) {
        if (!ast || ast.type != "rule" || !ast.ast)
            throw("Internal error: " + (ast ? ast.name ? ast.name : "anonymous rule" : "undefined rule") + " does not contain expected token");
        if (!ast.ast[ind] || !ast.ast[ind].name || ast.ast[ind].name != name || ast.ast[ind].type != "token")
            throw("Internal error: expected token `" + name + "' in rule `" + ast.name + "' was not found");
    }

    /// This function is called to ensure that an AST node is whitespace, and so safe to ignore.
    function assertWhite(ast, ind) {
        if (!ast || ast.type != "rule" || !ast.ast)
            throw("Internal error: " + (ast ? ast.name ? ast.name : "anonymous rule" : "undefined rule") + " does not contain expected token");
        if (!ast.ast[ind] || ast.ast[ind].type != "white")
            throw("Internal error: unexpected pattern in rule `" + ast.name + "': white space expected");
    }

    /// This function is called on an arbitrary AST node which may not exist; it ensures that the node exists,
    /// and that it is a rule, and then it invokes the rule's handler method.
    function operateRule(rule, ops, defined) {
        if (!defined && !rule) return 0;
        // assertRule(rule);
        return operate(rule, ops);
    }

    /// This function ensures that a result is, in fact, an array of some length.
    function assertArray(arr, lower, upper, kind) {
        if (!arr || !arr.length || arr.length < lower || (upper != -1 && arr.length > upper))
            throw("Internal error: " + kind + " does not have expected length (" + (arr ? arr.length : "null") + " should be " +
            (upper == lower ? lower : upper == -1 ? "at least " + lower : "between " + upper + " and " + lower) + ")");
        return [].concat(arr);
    }

    function nonnull(x, item) {
        if (x == null)
            throw("Internal error: " + item + " should not be null");
        return x;
    }

    /* *********************************************************************** *
     * Here begins the actual interpreter code.                                *
     * *********************************************************************** */

    /** This maps CORE operator strings to their corresponding JavaScript equivalents. */
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

    function do_operator(op, x, y) {
        if (op in operators)
            return operators[op](x, y);
        throw("Internal error: Unrecognized CORE operator `" + op + "'");
    }

    /**
     * This is the interpreter dictionary; it's similar to the printer one, above, but actually executes the code.
     */
    interpreter = {
        symbols: symbolTable = {},
        symExist: assertSymbolExists = function (sym) {
            if (!(sym in symbolTable))
                throw("Program error: Variable `" + sym + "' has not been declared");
        },
        input: "", // This allows the caller to inject input
        generic: function (ast, ops) {
            if (!ast || ast.name != "<>") // This is our try-all rule that allows any rule in the program.
                throw("Internal error: Invalid rule to interpret: " + (ast ? ast.name : "(no rule passed)") + ": Rule not found");
            assertArray(ast.ast, 1, 1, "AST");
            if (ast.ast[0].name != "<程序>")
                throw("Mechanics error: A CORE program must begin with `program'");
            symbolTable = {};
            ops.input = ops.input.split(/[\s\n]+/);
            return operate(ast.ast[0], ops);
        },
        evalSeq: // Function to evaluate every rule in an AST, sequentially.
            evalSeq = function (ast, ops) {
                var res = null;
                for (var i = 0; i < ast.ast.length; ++i)
                    if (ast.ast[i].type == "rule")
                        res = operate(ast.ast[i], ops);
                return res;
            },

        "<程序>": evalSeq,
        "<定义 块>": evalSeq,
        "<语句 块>": evalSeq,
        "<语句>": evalSeq,

        // These rules are for working with variable names
        "<定义>": // Declares variables, adding them to our symbol table.
            function (ast, ops) {
                var ids = operateRule(ast.ast[2], ops, true);
                if (!ids || !ids.length || ids.length < 1)
                    throw("Internal error: empty ID list?");
                for (var i = 0; i < ids.length; ++i)
                    symbolTable[ids[i]] = null; // Declare, but do not initialize
            },
        "<变量 组>": // Returns an array of IDs.
            function (ast, ops) {
                var res = assertArray(operateRule(ast.ast[0], printer, true), 1, -1, "ID list");
                if (ast.ast.length > 1) {
                    var ida = operateRule(ast.ast[4], ops, true);
                    var rest = assertArray(ida, 1, -1, "ID list");
                    for (var i = 0; i < rest.length; ++i)
                        res.push(rest[i]);
                }
                return res;
            },
        "<赋值>": function (ast, ops) {
            var id = operateRule(ast.ast[0], printer, true); // This just asks the printer to print the variable name. Terrible, eh?
            // assertSymbolExists(id); //校验id 存在
            var val = operateRule(ast.ast[4], ops, true);
            return symbolTable[id] = val;
        },

        // These are the rules moving actual code.
        "<判断>": function (ast, ops) {
            var cond = operateRule(ast.ast[2], ops, true);
            if (cond)
                return operateRule(ast.ast[6], ops, true);
            if (ast.ind)
                return operateRule(ast.ast[10], ops, false); // The else code is optional.
        },
        "<循环>": function (ast, ops) {
            var res = 0;
            while (operateRule(ast.ast[2], ops, true))
                res = operateRule(ast.ast[6], ops, true);
            return res;
        },
        "<输入>": function (ast, ops) {
            var vars = assertArray(operateRule(ast.ast[2], ops, true), 1, -1, "ID list");
            for (var i = 0; i < vars.length; ++i) {
                var val = getInput(ops.input, "请输入" + vars[i] + ":");
                symbolTable[vars[i]] = val.car;
            }
        },
        "<输出>": function (ast, ops) {
            var vars = assertArray(operateRule(ast.ast[2], ops, true), 1, -1, "ID list");
            var maxlen = 0, msg = "";
            for (var i = 0; i < vars.length; ++i)
                maxlen = Math.max(maxlen, vars[i].length);
            for (var i = 0; i < vars.length; ++i)
                msg += strrep(" ", maxlen - vars[i].length)  + symbolTable[vars[i]] + "\n";
            log(msg);
            return 0;
        },
        "<条件>": function (ast, ops) {
            switch (ast.ind) {
                case 0: // <比较>
                    return operateRule(ast.ast[0], ops, true);
                case 1: // !<条件>
                    return !operateRule(ast.ast[2], ops, true);
                case 2: // [<条件> && <条件>]
                    return operateRule(ast.ast[2], ops, true) && operateRule(ast.ast[6], ops, true);
                case 3: // [<条件> or <条件>]
                    return operateRule(ast.ast[2], ops, true) || operateRule(ast.ast[6], ops, true);
            }
            throw("Internal error: Condition does not have expected format");
        },
        "<比较>": function (ast, ops) {
            return do_operator(operateRule(ast.ast[4], ops, true), operateRule(ast.ast[2], ops, true), operateRule(ast.ast[6], ops, true));
        },
        "<表达式>": function (ast, ops) {
            if (ast.ast.length == 1)
                return operateRule(ast.ast[0], ops, true);
            return do_operator(ast.ast[2].name, operateRule(ast.ast[0], ops, true), operateRule(ast.ast[4], ops, true));
        },
        "<计算>": function (ast, ops) {
            if (ast.ast.length == 1)
                return operateRule(ast.ast[0], ops, true);
            return do_operator(ast.ast[2].name, operateRule(ast.ast[0], ops, true), operateRule(ast.ast[4], ops, true));
        },
        "<值>": function (ast, ops) {
            if (ast.ast.length == 1)
                return operateRule(ast.ast[0], ops, true);
            return operateRule(ast.ast[2], ops, true);
        },
        "<变量>": function (ast, ops) {
            var id = operate(ast, printer);
            assertSymbolExists(id);
            var res = symbolTable[id];
            if (res == null)
                throw("Program error: Attempting to use a variable that has been declared, but not assigned");
            return res;
        },
        "<整形>": function (ast, ops) {
            var num = operate(ast, printer);
            if (!num.match(/[0-9]+/))
                throw("Internal error: number is not numeric");
            if (num == "0") return 0;
            return parseInt(num, 10);
        },
        "<字符串>": function (ast, ops) {
            var str = operate(ast, printer);
            return str;
        },
        "<比较 符>": function (ast, ops) {
            assertArray(ast.ast, 1, 1, "AST");
            return nonnull(ast.ast[0].name);
        },
        "<字符>": badRule,
        "<数字>": badRule
    };

    return {interpreter: interpreter, printer: printer};
})();
