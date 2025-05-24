use std::env;
use std::fs;
// use unicode_segmentation::UnicodeSegmentation;
// use std::process;
use std::fs::File;
use std::io;
use std::io::Write;
// use std::error::Error;


// [data element][data element]...[data element]
// Data Element
// ------------
// [main category][sub category][key][text]
// main: 2 bytes + utf8 string
// sub: 2 bytes + utf8 string
// key: 4 bytes + integer
// text: 2 bytes + utf8 string [3 bytes] [23..26][26..29][29..31]
// ------------
// NOTE: valid Chinese text is 3 bytes utf8 [23..26][26..29][29..31][31..34]

static SENTINELS: u8 = 31;
static H_TAB: u8 = 9;
static LINE_FEED: u8 = 10;
static CARRIAGE_RETURN: u8 = 13;
static UPPERCASE_LOWERBOUND: u8 = 65;
static UPPERCASE_UPPERBOUND: u8 = 90;
static LOWERCASE_LOWERBOUND: u8 = 97;
static LOWERCASE_UPPERBOUND: u8 = 122;
static UNDERSCORE: u8 = 95;
static SPACE: u8 = 32;
static HASH: u8 = 35;
static PERCENT: u8 = 37;
static VALID_SUB_CAT_NAMES: &[&str] = &[
    "active_tip",
    "buy_condition_desc",
    "cv_actor",
    "desc",
    "condition",
    "content",
    "condition1_name",
    "condition2_name",
    "condition_desc",
    "desc_tips",
    "desc_unlocked",
    "display_name",
    "enemy_info",
    "failed_desc",
    "hard",
    "hard1_text",
    "hard2_text",
    "info",
    "line",
    "log_content",
    "lose_text",
    "manifest_content",
    "name",
    "next_level_detail",
    "next_page_btn_desc",
    "node_name",
    "note_text",
    "original",
    "param",
    "purchase_desc",
    "purchase_name",
    "require_reputation_level_desc",
    "result_desc",
    "sandbox_result_desc",
    "scenario_text",
    "score_name",
    "second_confirm",
    "short_name",
    "simplified_desc",
    "single_desc",
    "source_desc",
    "stage_name",
    "tab_name",
    "tag",
    "text",
    "tier",
    "tier1_name",
    "tier2_name",
    "tip",
    "title",
    "treasure_desc",
    "win_text",
];

static CH_MAISHA: &str = "麥莎";
static EN_MAISHA: &str = "Maitha";

fn is_latin_alphabet(val: u8, include_underscore: bool) -> bool {
    (include_underscore && val == UNDERSCORE) ||
    (UPPERCASE_LOWERBOUND <= val && val <= UPPERCASE_UPPERBOUND) ||
    (LOWERCASE_LOWERBOUND <= val && val <= LOWERCASE_UPPERBOUND)
}

fn main () {
    let args: Vec<_> = env::args().collect();
    if args.len() < 2 {
        println!("No input file");
    }

    let file = &args[1];
    let mut out: Option<&String> = None;
    if args.len() >= 3 {
        out = Some(&args[2]);
    }

    println!("Input File --> {}", file);
    println!("Output File --> {}", out.unwrap_or(&String::from("NONE")));

    let contents = fs::read(file)
        .expect("Should have been able to read the file");

    let mut structured_data: Vec<Data> = vec![];
    let mut idx = 0;
    while idx < contents.len() {
        let main = build_main_category(idx, &contents[..]);
        // println!("main: {main:?}");
        let Category { end_idx: next_idx, .. } = main;

        let sub = build_sub_category(next_idx, &contents[..]);
        // println!("sub: {sub:?}");
        let Category { end_idx: next_idx, .. } = sub;

        let key = build_key(next_idx, &contents[..]);
        // println!("key: {key:?}");
        let Key { idx: cur_idx, ..} = key;

        let text = build_text(cur_idx + 1, &contents[..]);
        // println!("text: {text:?}");
        let Text { end_idx, .. } = text;

        idx = end_idx;
        structured_data.push(Data { main, sub, key, text });
        // println!("{:?}", structured_data.last());
    }

    println!("--- END ---");
    println!("first data: {:?}", structured_data.first());
    println!("last data: {:?}", structured_data.last());

    // println!("--- injecting Maitha ---");
    // for data in &mut structured_data {
    //     if data.text.value.contains(CH_MAISHA) {
    //         data.text.value = data.text.value.replace(CH_MAISHA, EN_MAISHA).as_str();
    //     }
    // }

    println!("--- Preparing binary data ---");
    let mut bytes = Vec::<u8>::new();
    for data in structured_data.iter() {
        bytes.extend_from_slice(data.main.prefix);
        bytes.extend_from_slice(data.main.value.as_bytes());

        bytes.extend_from_slice(data.sub.prefix);
        bytes.extend_from_slice(data.sub.value.as_bytes());

        bytes.extend_from_slice(data.key.prefix);
        bytes.push(data.key.value);

        bytes.extend_from_slice(data.text.prefix);
        bytes.extend_from_slice(data.text.value.as_bytes());
    }

    if out.is_some() {
        println!("--- Begin Write ---");
        let out = out.unwrap();
        let mut outfile = File::create(out).expect("Failed to open file {out}");
        outfile.write_all(&bytes);
        println!("\tWrite to {out} complete");
    }

    let all_texts: Vec<String> = structured_data.iter().map(|data| {
        data.text.value.clone()
    }).collect();
    let all_texts: String = all_texts.join("");
    fs::write("full_text", all_texts);
    // let mut textfile = File::create("fulltext").expect("Failed to create text file [fulltext]");
    // textfile.write_all(all_texts);
}

fn build_main_category(start: usize, data: &[u8]) -> Category {
    let prefix = &data[start..(start + 2)];
    let lo = start + 2;
    let mut idx = lo;
    let mut ch = data[idx];

    // println!("start[{start}] | lo[{lo}] | idx[{idx}]");

    // let p0 = &[data[start]];
    // let p0 = std::str::from_utf8(p0).unwrap();
    // println!("idx[0] : [{}] : [{p0}] : [{p0:x?}]", data[0]);

    // let p1 = &[data[start + 1]];
    // let p1 = std::str::from_utf8(p1).unwrap();
    // println!("idx[1] : [{}] : [{p1}] : [{p1:x?}]", data[1]);

    while ch > SENTINELS {
        let sss = &[ch];
        let sss = std::str::from_utf8(sss).expect("Invalid utf8 character");
        // println!("idx[{idx}] : [{ch}] : [{sss}] : {sss:x?}");
        idx += 1;
        ch = data[idx];
    }

    let hi = idx;
    let text = &data[lo..hi];
    let value = std::str::from_utf8(text).expect("Invalid utf8 string").to_string();

    // println!("hi[{hi}] : text -> [{text}]");

    Category {
        prefix,
        value,
        start_idx: lo,
        end_idx: hi,
    }
}

fn build_sub_category(start: usize, data: &[u8]) -> Category {
    let prefix = &data[start..(start + 2)];
    let lo = start + 2;
    let mut idx = lo;
    let mut ch = data[idx];

    // println!("start[{start}] | lo[{lo}] | idx[{idx}]");

    // let p0 = &[data[start]];
    // let p0 = std::str::from_utf8(p0).unwrap();
    // println!("idx[0] : [{}] : [{p0}] : [{p0:x?}]", data[0]);

    // let p1 = &[data[start + 1]];
    // let p1 = std::str::from_utf8(p1).unwrap();
    // println!("idx[1] : [{}] : [{p1}] : [{p1:x?}]", data[1]);

    // let mut text = "";
    let mut done = false;

    while ch > SENTINELS {
        // let sss = &[ch];
        // let sss = std::str::from_utf8(sss);
        // let sss = sss.unwrap();
        // println!("idx[{idx}] : [{ch}] : [{sss}] : {sss:x?}");

        idx += 1;
        ch = data[idx];

        // let word = &data[lo..idx];
        // text = std::str::from_utf8(word).expect("Invalid utf8 string");
        // println!("idx[{idx}] : word: [{text}]");
        // done = VALID_SUB_CAT_NAMES.contains(&text);
    }
    // println!("subcat --> lo[{lo}] | idx[{idx}]");
    let mut word = &data[lo..idx];
    let mut text = std::str::from_utf8(word);
    if !text.is_err() {
        let tt = text.unwrap();
        done = VALID_SUB_CAT_NAMES.contains(&tt);
    }

    while !done {
        idx -= 1;
        word = &data[lo..idx];
        text = std::str::from_utf8(word);
        if text.is_err() {
            continue;
        }
        let tt = text.unwrap();
        // println!("-- [{lo}..{idx}] : [{tt}]");
        done = VALID_SUB_CAT_NAMES.contains(&tt);
    }
    let value = text.unwrap().to_string();

    let hi = idx;
    // let text = &data[lo..hi];
    // let text = std::str::from_utf8(text).expect("Invalid utf8 string");

    // println!("hi[{hi}] : text -> [{text}]");

    Category {
        prefix,
        value,
        start_idx: lo,
        end_idx: hi,
    }
}

fn build_key(start: usize, data: &[u8]) -> Key {
    let idx = start + 4;
    let prefix = &data[start..idx];
    let value = data[idx];

    Key { prefix, value, idx }
}

fn build_text(start: usize, data: &[u8]) -> Text {
    let lo = start + 1;
    let prefix = &data[start..lo];
    let mut idx = lo;

    let mut done = false;
    while !done && idx < data.len() {
        idx += 1;
        done = idx + 1 < data.len() && idx + 2 < data.len() &&
            data[idx] <= PERCENT && data[idx + 1] <= SENTINELS &&
            is_latin_alphabet(data[idx + 2], true);
    }

    // if idx + 1 < data.len() {
    //     let e1 = data[idx];
    //     let e2 = data[idx + 1];
    //     let e1prime = &[e1];
    //     let e2prime = &[e2];
    //     let e1prime = std::str::from_utf8(e1prime).unwrap();
    //     let e2prime = std::str::from_utf8(e2prime).unwrap();
    //     println!("e1[{e1}] | {e1prime} | {e1prime:x?}");
    //     println!("e2[{e2}] | {e2prime} | {e2prime:x?}");
    // }

    let hi = idx;
    let value = &data[lo..hi];

    // println!("{prefix:?} | {value:?}");
    let mut value = std::str::from_utf8(value).unwrap().to_string();
    if value.contains(CH_MAISHA) {
        value = value.replace(CH_MAISHA, EN_MAISHA);
    }

    // println!("idx[{idx}] : [{lo}..{hi}] : [{value}]");

    Text {
        prefix,
        value,
        start_idx: lo,
        end_idx: hi,
    }
}


fn find_valid_utf8(start: usize, data: &[u8]) -> (&str, &[u8], usize) {
    let lo = start;
    let mut hi = start + 2;

    println!("enter fnc -> [{lo}..{hi}]");

    let mut ch: &[u8] = &data[lo..=hi];
    let mut utf8 = std::str::from_utf8(ch);
    while utf8.is_err() && hi < start + 4 {
        hi += 1;
        ch = &data[lo..=hi];
        utf8 = std::str::from_utf8(ch);
    }

    if utf8.is_err() {
        // There is still an error
        eprintln!("Persistent utf8 error -> {:?}", utf8.unwrap_err());
        println!("ch: [{ch:?}], range [{lo}..{hi}]");
        // process::exit(1);
        return ("", ch, hi);
    }

    (utf8.unwrap(), ch, hi)
}

#[derive(Debug)]
struct Data<'a> {
    pub main: Category<'a>,
    pub sub: Category<'a>,
    pub key: Key<'a>,
    pub text: Text<'a>,
}

#[derive(Debug)]
struct Category<'a> {
    pub prefix: &'a [u8],
    pub value: String,
    pub start_idx: usize,
    pub end_idx: usize,
}

#[derive(Debug)]
struct Key<'a> {
    pub prefix: &'a [u8],
    pub value: u8,
    pub idx: usize,
}

#[derive(Debug)]
struct Text<'a> {
    pub prefix: &'a [u8],
    pub value: String,
    pub start_idx: usize,
    pub end_idx: usize,
}

#[allow(unused)]
fn playground () {
    let args: Vec<_> = env::args().collect();
    if args.len() < 2 {
        println!("No input file");
    }

    let file = &args[1];

    println!("Input File --> {}", file);

    let contents = fs::read(file)
        .expect("Should have been able to read the file");

    let mut idx = 23;
    while idx < contents.len() && idx < 100 {
        let (utf8, ch, hi) = find_valid_utf8(idx, &contents[..]);
        println!("{utf8} ~ {ch:x?} --- range:[{idx}..{hi}]");
        idx = hi + 1;
    }

    let s = std::str::from_utf8(&contents[26..29]);
    if s.is_err() {
        eprintln!("{}", s.unwrap_err().to_string());
        return;
    }

    let s = s.unwrap();
    println!("\n{s}");
    println!("{s:x?}");
}
