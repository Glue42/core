# Contributing

Glue42 Core is an open-source project and we welcome everyone who wants to contribute to the codebase or simply to close, build and run it locally.

## Repo Structure

The repo is organized as a Mono Repo using Lerna. Why did we decide to go down this road? Transitioning to a mono repo design allowed us to more easily work on the entire Glue42 Core project, without the hassles of multiple repos. What's more, this is immensely helpful to our community, as all the code is in one place, rather than scattered in multiple repositories.

Organization:
- `/docs` - all the markdowns used to generate the official documentation
- `/packages` - all the npm modules, which make up Glue42 Core
- `/scripts` - a common place for scripts used by multiple packages or the repo itself
- `/tutorials` - all the tutorials, together with text, start and end code for Vanilla JS and React

## Getting started with the codebase

Requirements:
- Node.JS version 10.14.X or higher
- Globally installed `yarn` - the repo is set up using Lerna and Yarn workspaces

The first time you close the repo, you will need to execute `yarn` to fetch all the dependencies. Every other time, you can use:
- `npm run clean` - to delete `node_modules` from all packages
- `npm run bootstrap` - to set up the dependencies in all packages
- `npm run build` and `npm run test` will execute the `build` and `test` commands in all packages

Now you are ready to play round with the code.

### Packages

The npm modules of Glue42 Core are organized as packages inside `/packages`. Each package:
- must have `build` and `test` scripts, which build the package ready for publishing and executes all tests 
- defines and contains all of it's files - source, tests, build scripts, readme, etc.

## Submitting changes

If you would like to submit a change, new feature, bugfix or any other improvement, you should open a Pull Request to `master` branch. As soon as you open your PR, the CI build will trigger multiple checks, basically it will build and test all packages against a combination of OSs and Node.js versions. Make sure to also include the appropriate label to your pull request.

After your pull request was approved, you will need to squash all of your commits into one for clean merge into `master`. Note, that you can squash your commits before the PR also.