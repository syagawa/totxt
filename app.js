const fs  = require("node:fs/promises");
const  htmlParser  = require("node-html-parser");
const path = require("path");

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
    await fs.writeFile(filename, content);
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



const parseHtmlToTextContent = (html) => {
  const root = htmlParser.parse(html);
  // const str = root.textContent;
  const str = root.structuredText;
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

  newStr = newStr
    .replace(reg1, rep1)
    .replace(reg2, rep2)
    .replace(reg3, rep3);

  return newStr;
};

const main = async () => {

  const dir = argv.dir;

  const files = await getFiles(dir);

  console.log(files);
  

  for(let i = 0; i < files.length; i++){
    const filename = path.join(dir, files[i]);
    const d = await getData(filename);
    const s1 = parseHtmlToTextContent(d);
    const s2 = parseText(s1);
    console.log(s2);
    const newname = path.join("results", files[i].replace(".html", ".txt"));
    await writeFile(newname, s2);
  }



};


main();


