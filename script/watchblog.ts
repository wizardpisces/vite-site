import path from 'path'
import chokidar from 'chokidar'
import execa from 'execa'

const root = path.join(process.cwd())

function watch() {
    const watcher = chokidar.watch(['**/*.md', './blog.ts'], {
        ignored: ['**/node_modules/**', '**/.git/**'],
        // ignoreInitial: true,
        ignorePermissionErrors: true,
        disableGlobbing: true,
        cwd: root
    })

    watcher.on('change', async (file: string) => {
        console.log(file, ' changed')
        execa('npm', ['blog'])
    })

}

watch()
