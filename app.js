const fs  = require("node:fs/promises");
const htmlParser  = require("node-html-parser");
const path = require("path");
const parseRTF = require('@extensionengine/rtf-parser');


const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const argv = yargs(hideBin(process.argv)).argv;


const getFiles = async (dir) => {
  const files = [];
  try {
    const files_ = await fs.readdir(dir);
    files.push(...files_);
  } catch (err) {
    console.error(err);
  } 
  return files;
};

const writeFile = async (filename, content) => {
  try{
    await fs.writeFile(filename, content, { encoding: "utf-8"});
  }catch(err){
    console.error(err);
  }
};

const getData = async (pathtofile, encoding) => {
  if(!encoding){
    encoding = "utf8";
  }

  let data = "";
  try{
    data = await fs.readFile(pathtofile, {  encoding });
  }catch(err){
    console.error(err);
  }
  return data;
};



const parseHtmlToTextContent = (data) => {
  const root = htmlParser.parse(data);
  // const str = root.textContent;
  const str = root.structuredText;
  return str;
};

const parseRtfToTextContent = async (data) => {
  const doc = await parseRTF(data)
    .then(rtfdoc => {
      return rtfdoc; 
    });
  const str =  doc.content
    .map(paragraph => {
      return paragraph.content
        .map(span => span.value).join('');
    })
    .join('\n');

  return str;
};

const parseText = (str) => {

  let newStr = str;
  const reg1 = /。/g;
  const rep1 = "。\n";

  const reg2 = /●/g;
  const rep2 = "\n●";
  const reg3 = /◇.+\n/g;
  const rep3 = "$&\n";

  const reg4 = /\<\!DOCTYPE.+\n/g;
  const rep4 = "";

  newStr = newStr
    .replace(reg1, rep1)
    .replace(reg2, rep2)
    .replace(reg3, rep3)
    .replace(reg4, rep4);

  return newStr;
};

const main = async () => {

  const dir = argv.dir;

  const files = await getFiles(dir);

  console.log(files);
  

  for(let i = 0; i < files.length; i++){
    const filename = files[i];
    const pathname = path.join(dir, filename);
    const d = await getData(pathname);

    let s1 = "";
    let s2 = "";
    if(filename.includes(".html")){
      s1 = parseHtmlToTextContent(d);
      s2 = parseText(s1);
    }else if(filename.includes(".rtf")){
      s1 = await parseRtfToTextContent(d);
      s2 = s1;
    }

    
    if(!s2){
      return;
    }
    let newfilename = filename;
    try{

      if(filename.includes(".rtf")){
        const year = filename.match(/[0-9]{4}/)[0];
        const month = filename.match(/([0-9]{1,2})月/)[1];
        newfilename = `${year}${month.padStart(2, "0")}01.html`
      }
    }catch(err){
      console.error(err);
      console.log(filename);
    }

    const newname = path.join("results", newfilename.replace(".html", ".txt"));
    await writeFile(newname, s2);
  }



};


main();


