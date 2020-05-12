# Contributing

**Glue42 Core** is an open-source project and we welcome everyone who wants to contribute to the codebase or simply to clone, build and run it locally.

## Repo Structure

The repo is organized as a Mono Repo using Lerna. Using a mono repo design allowes us to more easily work on the entire **Glue42 Core** project without the hassles of having multiple repos. What's more, this is immensely helpful to our community, as all the code is in one place, rather than scattered in multiple repositories.

Organization:

- `/docs` - all markdown files used to generate the official documentation;
- `/packages` - all `npm` modules, which make up **Glue42 Core**;
- `/scripts` - a common place for scripts used by multiple packages or the repo itself;
- `/tutorials` - all tutorials - text, start and end code for JavaScript and React;

## Getting Started with the Codebase

Requirements:

- `Node.JS` version 10.14.X or higher;
- `NPM` version 6.X.X or higher;

The first time you clone the repo, you will need to execute `npm install` at root level to fetch all the root dependencies. Next, you need to set up all packages. You can do that by running the following commands:

```cmd
npm run bootstrap
npm run build
```

Some other helpful root-level commands:

- `npm run clean` - removes all `node_modules` from all packages leaving only the root `node_modules` which you can manually delete or keep;
- `npm run test` - executes all tests - project-level and per-package;
- `npm run lint:fix` - lints the entire project and fixes easy errors like quotes or semicolons;
- `npm run bootstrap` - installs the dependencies for each package and creates symlinks between the internal dependencies;


Now you are ready to use and experiment with the code.

### Packages

The `npm` modules of **Glue42 Core** are organized as packages inside the `/packages` directory. Each package:
- must have a `build` script that builds the package for publishing and a `test` script that executes all tests;
- defines and contains all of its files - source, tests, build scripts, readme, etc.

## Submitting Changes

If you would like to submit a change, new feature, bugfix or any other improvement, you should open a pull request to the `master` branch. As soon as you open your PR, the CI build will trigger multiple checks. It will build and test all packages against a combination of OSs and `Node.js` versions. Make sure to also include the appropriate label to your pull request.

Keep in mind that we employ the Developer Certificate of Origin (DCO), so make sure to sign-off all your commits.

After your pull request has been approved, you will need to squash all of your commits into one for a clean merge into `master`. Note, that you can also squash your commits before the PR.