import * as path from 'path'
import * as chokidar from 'chokidar'
import execa from 'execa'

const root = path.join(process.cwd())

function watch() {
    const watcher = chokidar.watch(['./src/blog', './script/blog.ts'], {
        ignored: ['**/node_modules/**', '**/.git/**'],
        // ignoreInitial: true,
        ignorePermissionErrors: true,
        disableGlobbing: true,
        cwd: root
    })

    watcher.on('change', async (file: string) => {
        console.log(file, ' changed, running "npm run blog"')

        execa('npm', ['run', 'blog'], { stdio: 'inherit' })
    })

}

watch()
