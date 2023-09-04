const fs = require('fs');
const path = require('path');

function correctFileContent(filePath) {
    let content = fs.readFileSync(filePath, 'utf8')
    content = content.replace(/_assets/gi, 'assets');
    fs.writeFile(filePath, content, (err) => {
        if (err) {
            throw err;
        }
    })
}

function walkDir(dir) {
    fs.readdir(dir, (err, results) => {
        results.forEach((filename) => {
            let filePath = path.join(dir, filename),
                stat = fs.lstatSync(filePath)

            if (stat.isFile()) {
               correctFileContent(filePath)
            }else if (stat.isDirectory()) {
                walkDir(filePath, (err, res) => {
                    if (err) {
                        done(err);
                    }
                })
            }
        })
    })
}

let sourcePath = path.join(__dirname, '../docs')

walkDir(sourcePath)