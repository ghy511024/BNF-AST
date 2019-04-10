/**
 * Created by ghy on 2019/4/11.
 */

const pro = `8除(1加3)`
var str = pro.replace('除', '/').replace('加', '+');
var result = eval(str);

console.log(result);

