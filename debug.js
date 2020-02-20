let str = '500 erro 82ue555jihf902 524 je09djwaposd kao koad 0w 500'
let str2 = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
let regex = /\b(5)(\d{2})\b/i

console.log(str2.match(regex))

if(str2.match(regex) == null) {console.log('tudo certo')}

if(str.match(regex) != null) {console.log('erro')}