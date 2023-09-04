const { spawn } = require('child_process');
const process = require('process');

function spawnProxy(command, options = { cwd: process.cwd(), env: { FORCE_COLOR: '2', ...process.env, } }) {
    return spawn(command.split(' ')[0], command.split(' ').slice(1), options);
}

const scriptsList = [
    {
        command: 'npm run vite',
        prefix: `\x1B[42m [vite] \x1B[49m`
    },
    {
        command: 'npm run t2j',
        prefix: `\x1B[43m [t2j] \x1B[49m`
    }
]

const rawArgv = process.argv.slice(2);
function runConcurrently(...scripts) {
    return new Promise((resolve, reject) => {
        const children = scripts.map((script, index) => {
            // script.command = script.command + ' ' + rawArgv[0]

            const child = spawnProxy(script.command)
            child.stdout.on('data', (data) => {
                console.log(script.prefix, data.toString('utf8'))
            })
            child.stderr.on('data', (data) => {
                console.log(script.prefix, data.toString('utf8'))
            })

            child.on('error', (err) => {
                console.error('err', err)
            })

            child.on('exit', (code, signal) => {
                console.log(`Child ${script.command} exited with code ${code} and signal ${signal}`);
                children.forEach((c, i) => {
                    if (i !== index) {
                        c.kill('SIGTERM');
                    }
                });
                if (code === 0) {
                    resolve(void 0);
                } else {
                    reject(new Error(`Child ${script.command} failed with code ${code}`));
                }
            });

            return child;
        });

        process.on('SIGINT', () => {
            console.log('Received SIGINT, terminating children');
            children.forEach(child => child.kill('SIGTERM'));
            reject(new Error('Interrupted by user'));
        });
    });
}

runConcurrently(...scriptsList)
    .then(() => {
        console.log('Both scripts finished successfully');
    })
    .catch(error => {
        console.error(error.message);
    });