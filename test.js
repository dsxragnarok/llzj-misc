const CJK_COMMON_LOWER_BOUND = '\u4E00';
const CJK_COMMON_UPPER_BOUND = '\u9FFF';
const CJK_RARE_LOWER_BOUND = '\u3400';
const CJK_RARE_UPPER_BOUND = '\u4DBF';

const sizeInByte = str => new Blob([str]).size;
const print = (label, str) => console.log(`${label} [${str}] : ${sizeInByte(str)} bytes`);

let t = '我';

const wo = '\u6211';

const inRange = (incLower, value, incUpper) => value >= incLower && value <= incUpper;

// console.log(`cclower [${CJK_COMMON_LOWER_BOUND}] ${CJK_COMMON_LOWER_BOUND.charCodeAt(0)}`);
// console.log(`ccupper [${CJK_COMMON_UPPER_BOUND}] ${CJK_COMMON_UPPER_BOUND.charCodeAt(0)}`);
// let testIt = inRange(CJK_COMMON_LOWER_BOUND, wo, CJK_COMMON_UPPER_BOUND);
// console.log(`${CJK_COMMON_LOWER_BOUND} >= ${wo} <= ${CJK_COMMON_UPPER_BOUND} ? ${testIt}`);

print('t', t);
print('wo', wo);

const what = '\u001c';
print('what', what);

const nine = '\u00009';
print('nine', nine);

const zero = '\u0000';
print('zero', zero);

const tab = '\t';
print('tab', tab);

const back = '\b';
print('back', back);

const ff = '\f';
print('form feed', ff);

const cr = '\r';
print('return', cr);

const vr = '\v';
print('vertical return', vr);

const four = '\u0004';
print('four?', four);

const twelve = '\u0012';
print('twelve?', twelve);

const one = '\u0001';
print('one', one);

const dollar = '$';
print('dollar', dollar);

const testkey = '#\u0006\u0000\u0000';
print('testkey', testkey);


const cnText = "在薩曼莎的斡旋下\n王女伊南娜出人意料地同意重新開啟和談\n和談以秘密會議的形式在晨曦堡進行\n並很快得到一個令所有人大吃一驚的結果|隱居多年的法里斯王將正式宣布退位\n將王位移交給舊伊利亞邦國的塔埃爾王子\n並將由伊南娜王女親自主持儀式|這將意味著伊利亞邦國的成功復辟\n意味著伊利亞重新置於法皇國的傀儡統治之下\n突如其來的勝利讓卡麗絲樞機卿都難以置信\n伊利亞朝野上下更是難以接受|在一片質疑聲中\n舊王退位新王登基的儀式\n仍在伊南娜王女的強硬推進下完成了籌備……";
print('cnText', cnText);

const enText = "Under the mediation of Samantha\nPrince Inanna unexpectedly agreed to reopen the peace talks\nThe peace talks were held in the Castle of Dawn in the form of a secret meeting\nAnd soon got a result that surprised everyone|King General Faris, who had been living in seclusion for many years Officially announced the abdication\nThe throne will be handed over to Prince Tael of the old Ilia State\nThe ceremony will be presided over by Princess Inanna herself|This will mean the successful restoration of the Ilia State\nIt means Ilia's return to the throne Under the puppet rule of the French Empire\nThe sudden victory made Cardinal Karis unbelievable\nIt was even more difficult for the Ilya government and the public to accept it|Amidst the voices of doubt\nThe ceremony of the abdication of the old king and the enthronement of the new king\nstill The preparations were completed under the strong promotion of Princess Inanna...";
print('enText', enText);

console.log("---", '\u0002' === '\u{2}');

const cnShield = "擁有[<style=C4>格擋</style>]，受到傷害降低<style=red>20%</style>。行動結束時，強制選中場上生命值最低的<style=red>2</style>名己方，進行治療，回復<style=red>20%</style>已損失生命值。";
print('cnShield', cnShield);

const enShield = "With [<style=C4>Block</style>], dmg taken reduced by <style=red>20%</style>. At end of action, <style=red>2</style> select friends with lowest health on field for treatment, restoring <style=red>20%</style> of their lost health.";
print('enShield', enShield);

const anniversary = "special anniversary  elysium_placement_furniture_type";
print('anniversary', anniversary);

console.log(anniversary.codePointAt(19));

const src = "Samantha Ambrosio of France";
print('src', src);

const target = "Samantha Ambrose of Rodinia";
print('target', target);
