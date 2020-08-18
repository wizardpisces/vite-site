const fs = require('fs');
const path = require('path');

let sourcePath = path.join(__dirname,'../docs/index.html')

let content = fs.readFileSync(sourcePath, 'utf8')

content = content.replace(/_assets/gi, 'assets');

fs.writeFile(sourcePath, content,(err)=>{
    if(err){
        throw err;
    }
    console.log('change _assets to asset success')
})