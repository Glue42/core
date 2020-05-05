var fs = require('fs')
var resolve = require('path').resolve
var join = require('path').join
var cp = require('child_process')
var os = require('os')

function installPackages(subDir) {
  const dir = resolve(__dirname, subDir);

  fs.readdirSync(dir).forEach((mod) => {
    var packagePath = join(dir, mod)
    if (!fs.existsSync(join(packagePath, 'package.json'))) {
      return;
    }

    var npmCmd = os.platform().startsWith('win') ? 'npm.cmd' : 'npm'
    cp.spawn(npmCmd, ['install'], { env: process.env, cwd: packagePath, stdio: 'inherit' })
  })

}

['./interop', './windows', './contexts'].forEach(installPackages);
