const getPackagesAllPaths = (fs) => {
    return new Promise((resolve, reject) => {
        fs.readdir(packagesDirectory, (err, paths) => {
            if (err) {
                return reject(err);
            }

            const packagesPaths = paths
                .map((file) => path.join(packagesDirectory, file))
                .filter((filePath) => fs.lstatSync(filePath).isDirectory());

            resolve(packagesPaths);
        });
    });
};

const getPackageJson = (packagePath) => {
    return new Promise((resolve, reject) => {
        const packageJsonPath = path.join(packagePath, 'package.json')
        fs.readFile(packageJsonPath, 'UTF-8', (err, data) => {
            if (err) {
                return reject(err);
            }

            resolve({
                path: packageJsonPath,
                contents: JSON.parse(data)
            });
        })
    });
};

const getAllPackageJsons = async (updatedNames, fs) => {
    // we get all because the name of the package and the name of the package dir might be different
    const paths = await getPackagesAllPaths(fs);

    const packages = await Promise.all(paths.map((p) => getPackageJson(p)));

    return packages.filter((pkg) => updatedNames.includes(pkg.contents.name));
}

const overwritePackageJson = (package, fs) => {
    return new Promise((resolve, reject) => {
        if (!package.changed) {
            console.log(`Package ${package.contents.name} is not changed, skipping overwriting`);
            return;
        }

        console.log(`Overwriting ${package.contents.name} version to ${package.contents.version}`);
        fs.writeFile(package.path, JSON.stringify(package.contents, null, 2), (err) => {
            if (err) {
                return reject(err);
            }

            resolve();
        });
    });
};

const setLatestTagPerPackage = async (allTags, packagesJsons, fs) => {
    packagesJsons.forEach((pkgJson) => {
        const name = pkgJson.contents.name;
        const matchingTag = allTags.find((tag) => tag.includes(name));
        const tagVersion = matchingTag.slice(matchingTag.lastIndexOf('@') + 1);

        if (tagVersion !== pkgJson.contents.version) {
            console.log(`Fixing version discrepancy for ${name} | Package version: ${pkgJson.contents.version} | tag version: ${tagVersion}`);
            pkgJson.contents.version = tagVersion;
            pkgJson.changed = true;
            return;
        }

        console.log(`Package ${name} has consistent version, no changes needed`);
    });

    await Promise.all(packagesJsons.map((pkgJson) => overwritePackageJson(pkgJson, fs)));
};

module.exports.synchronizeVersions = async (updatedNames, git, fs) => {

    const allTags = (await git.tags()).all;

    if (!allTags || !allTags.length) {
        // this is possible when only for the initial release
        console.log(`No git tags were found, skipping version synchronizing`);
        return;
    }

    const packagesJsons = await getAllPackageJsons(updatedNames, fs);

    // necessary because by default git tags all are arranged in ascending order
    const reversedTags = allTags.reverse();

    await setLatestTagPerPackage(reversedTags, packagesJsons, fs);
};