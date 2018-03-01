var bnf = (function() {

/** Decode a string containing escaped symbols &lt; &gt; &pipe; &#124; and &amp; */
function ndecode(x) {
  return x.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&pipe;/g,"|").replace(/&x7C;/g,"|").replace(/&amp;/g,"&");
}

/** Encode a string containing special symbols to use the HTML-compliant, BNF-friendly escaped equivalents. */
function nencode(x) {
  return x.replace(/&/g, "&amp;").replace(/\|/g, "&#124;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Parses a single BNF rule string into an array of rule options, which are in turn
 * arrays of rule pieces. Thus, the first level of this 2D array uses the set OR operator,
 * while the second level uses the string concatenation operator, so to speak.
 * 
 * As an example, this string:
 * 
 *   <B> | <B> plus <A>
 * 
 * Becomes this object:
 * 
 *   [ [ "<B>" ], [ "<B>", " ", "plus", " ", "<A>" ] ]
 * 
 * Which is used later on during parse.
**/

function parse_rule(rule) {
  var res = [], resraw = rule.split(/\s*\|\s*/);
  for (var i = 0; i < resraw.length; ++i) {
    var psh = [], pshraw = resraw[i].split(/(<.*?>)/);
    for (var j = 0; j < pshraw.length; ++j) if (pshraw[j].length > 0) {
      if (pshraw[j][0] != '<') {
        isp = ndecode(pshraw[j]).split(/(\s+)/);
        for (var k = 0; k < isp.length; ++k) if (isp[k].length > 0)
          psh.push(isp[k].trim().length > 0? isp[k] : " ");
      }
      else
        psh.push(pshraw[j]);
    }
    res.push(psh);
  }
  return res;
}

/**
 * Breaks a string of BNF down to a workable set of rules.
 * @param  bnf  The BNF to parse for rules.
 * @return Returns an object containing a usable set of rules to the system.
**/

function parse_rules(bnf)
{
  rules_raw = bnf.split(/(<.*?>)\s*::=\s*(.*)\s*/);
  
  rules = {};
  for (var i = 0; i+2 < rules_raw.length; i += 3)
    rules[rules_raw[i+1]] = parse_rule(rules_raw[i+2]);
  
  return rules;
}

var sqwat = 0;

/**
 * Parse a string using a previously generated rule set.
 * @param string  The string to parse.
 * @param rules   The set of rules with which to parse it.
 * @return  Returns a tree of rule paths from the given rules which together account for the entire given string.
**/

function parse_string(string, rules) {
  var pos = 0;
  var max_streak = 0;
  var most_likely_error = {};
  
  function visit_rule_opt(rule, reject_ast, attempt)
  {
    // Keep track of what we've read; this is also what we'll return
    var ast = reject_ast;
    
    function backtrack(errtxt, heuristic) // Backtracking might happen. Oh noes.
    {
      if (pos >= max_streak && errtxt != undefined && errtxt) {
        if (pos > max_streak)
          most_likely_error = {};
        if (most_likely_error[errtxt] == undefined)
          most_likely_error[errtxt] = 0;
        most_likely_error[errtxt] = Math.max(most_likely_error[errtxt], heuristic);
        max_streak = pos;
      }
      
      // Start throwing away stuff we parsed until we're out of options.
      while (ast.length)
      {
        var olditem = ast[ast.length - 1];
        
        if (olditem == undefined)
          throw "a fit";
        
        // We can't do anything else to regular tokens. Drop them until we reach something that can be reinterpreted.
        if (olditem.type != "rule") {
          ast.pop();
          continue;
        }
        
        // Otherwise, we're at a rule. Try to re-read it.
        var different_ast = visit_rule(olditem.name, rules[olditem.name], olditem);
        
        // If that succeeded, yay! Read the rest of this rule.
        if (different_ast != null) {
          ast[ast.length - 1] = different_ast; // Keep the new interpretation
          return true; // Continue parsing from here
        }
        
        // Otherwise, if we couldn't do anything more from this token...
        ast.pop(); // Just throw it away and backtrack some more.
      }
      
      // The only way that loop terminated is if we threw out everything...
      return false; // Give up; retrying the whole rule from scratch won't help.
    }
    
    // If we have been down this road before, but yielded nothing useful
    if (ast.length) // This means we read an ast correctly, but it was junk, anyway. Backtrack.
      if (!backtrack("Extra symbols at end of input", 10)) // If we fail to backtrack
        return null; // Give up. Our caller will backtrack.
      
    
    // An item is either a "<rule>", a regular "token", or " " (meaning any amount of whitespace). 
    for (var i = ast.length; i < rule.length; ++i)
    {
      var item = rule[i];
      // Stash our position in case backtracking is required
      var spos = pos;
      // Check if our item is itself a rule.
      if (item in rules)
      {
        // Save ourselves some work, yeah?
        if (attempt) {
          if (i < attempt.length && attempt[i].pos == pos && attempt[i].type == "rule" && attempt[i].name == item) {
            ast[i] = attempt[i];
            pos = attempt[i].epos;
            continue;
          }
          // We couldn't use our previous attempt this time; get rid of it.
          attempt = null;
        }
        
        // Parse the rule.
        var stree = visit_rule(item, rules[item], (i < ast.length)? ast[i] : null);
        
        if (stree == null) { // We've hit a wall; backtrack.
          if (!backtrack("Expected " + item, i)) // If we couldn't backtrack, then abort; this rule is a dud.
            return null; // Our caller will take care of incrementing the rule option.
          i = ast.length - 1;
          continue;
        }
        // We successfully parsed our sub-rule. Add it to our AST, and hope we're where we're supposed to be.
        ast[i] = stree;
        continue;
      }
      else if (item == " ") {
        // Skip any and all whitespace, not just one space (\s*).
        var spos = pos;
        while (/\s/.test(string[pos])) ++pos;
        ast[i] = { type: "white", pos: spos, epos: pos, name: " " };
        continue; // Move on to the next item in this rule
      }
      else {
        if (string.substr(pos, item.length) != item) { // If the expected token isn't encountered, we've made a mistake.
          if (!backtrack("Expected `" + item + "'", i)) // If we couldn't backtrack, then abort; this rule is a dud.
            return null; // Our caller will take care of incrementing the rule option.
          i = ast.length - 1;
          continue;
        }
        
        // Keep valid with our previous attempt
        if (attempt) {
          if (i < attempt.length && attempt[i].pos == pos && attempt[i].type == "token" && attempt[i].name == item) {
            ast[i] = attempt[i];
            pos = attempt[i].epos;
            continue;
          }
          attempt = null;
        }
        
        // We successfully read a token! Skip it, push it.
        pos += item.length;
        ast[i] = { type: "token", name: item, pos: spos, epos: pos }
      }
    }
    return ast;
  }
  
  var tolerance = 64;
  var worthless_nests = 0;
  var last_position = 0;
  
  /**
   * Attempt to parse an entire compound rule.
   * @param rule_name   The name of the rule. This is used in error reporting and optimization.
   * @param whole_rule  The actual content of the rule; this is an array of different possible rule branches.
   *                    The branches are themselves arrays. An example would be [["<A>"], ["<A>", "+", "<A>"]].
   * @param reject_ast  An AST which was previously parsed but was incorrect, and so requires backtracking.
   * @return   Returns the most immediate AST after any backtracking from the given reject AST. If no further
   *           valid ASTs could be formed, the return value is null.
  **/
  function visit_rule(rule_name, whole_rule, reject_ast) {
    var ast = reject_ast;
    var nonnullsub = null;
    var offset = 0;
    
    if (pos > last_position) { last_position = pos; worthless_nests = 0; }
    if (++worthless_nests >= tolerance) { --worthless_nests; return null; }
    
    if (ast != null) {
      nonnullsub = ast.ast;
      pos = ast.pos;
      if (ast.type != "rule" || ast.ind == undefined) {
        if (worthless_nests > 0) --worthless_nests;
        return null;
      }
      // Attempt to get a new AST from the same rule we used last time.
      var different_ast = visit_rule_opt(whole_rule[ast.ind], ast.ast, null);
      // If we successfully obtained a new AST, use it.
      if (different_ast != null) {
        if (worthless_nests > 0) --worthless_nests;
        return { ind: ast.ind, type: "rule", name: rule_name, ast: different_ast, pos: ast.pos, epos: pos };
      }
      // At this point, we've failed to reinterpret this path of our rule. Continue on to new paths.
      offset = ast.ind + 1; // If we've exhausted this rule, the next loop will break and null will be returned.
    }
    
    // Loop through each option in this rule, attempting to parse by it.
    for (var i = offset; i < whole_rule.length; ++i) {
      var rule = whole_rule[i];
      var spos = pos;
      var ap = visit_rule_opt(rule, [], nonnullsub);
      if (ap != null) {
        if (worthless_nests > 0) --worthless_nests;
        return ({ ind: i, type: "rule", name: rule_name, ast: ap, pos: spos, epos: pos });
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
      res = { type: "error", error: the_most_likely_error, line: line, position: errpos }
      console.log(most_likely_error);
    }
  }
  
  return res;
}


/**
 * Traverse an AST, calling operations on each node.
 * @param ast  An AST previously obtained from calling parse_string.
 * @param ops  JSON of the operator functions to call on the AST.
**/
function operate_string(ast, ops) {
  p_ops = eval("operate = bnf.operate; ({ " + ops + " })");
  if (!p_ops) return "Failure";
  return operate(ast, p_ops);
}

/**
 * Traverse an AST, calling the appropriate operation on each node.
 * @param ast  An AST previously obtained from calling parse_string.
 * @param ops  Map of operator functions to call on AST subtrees of each rule.
 * 
 * @note  If a rule name is not contained in the mapping, the function for the
 *        rule named "generic" will be invoked on the AST instead.
**/
function operate(ast, ops) {
  if (ast.type == "rule" && ops[ast.name] != undefined)
    return (ops[ast.name])(ast, ops);
  return (ops['generic'])(ast, ops);
}

/* Ship everything back down through our pseudo-namespace.
 * JavaScript is funny, sometimes.
*/

return {
  parse_rules:     parse_rules,
  parse_string:    parse_string,
  operate_string:  operate_string,
  operate:         operate,
  nencode:         nencode,
  ndecode:         ndecode
};

})();
