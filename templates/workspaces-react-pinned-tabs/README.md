# Workspaces in React with pinned tabs
This project provides a starter for Workspaces applications in Glue42Desktop and Glue42Core.

## Project structure
- **CustomWorkspaces.tsx** - Component which adds custom buttons and pinned workspace logic to `<Workspaces/>`
- **CustomWorkspaceContents.tsx** - Component which replaces the workspaces contents to showcase how you can conditionally render the workspace.

## Prerequisites
### Glue42Enterprise
- Glue42Desktop 3.11 or newer

### Glue42Core 
- Glue42Core V2

## Setup
### Glue42Enterprise
To run the template in Glue42Desktop follow the following steps

- npm i 
- npm run start
- copy the workspaces app config from `"./app-config/workspaces.json"` in the configuration folder of your running Glue42Desktop (`%LocalAppData%/GlueDesktop/config/apps/workspaces.json`)
- start Glue42Desktop
- start the Workspaces UI application

### Glue42Core
- npm i
- npm run start
- update the workspaces location to `http://localhost:3000` in the web platform configuration
- start the web platform
- open a workspace (can be done by invoking `glue.workspaces.createWorkspace({children:[]})`)

## What does it do
The template initializes `<Workspaces/>` and adds two buttons with icons whose styles are located in `./src/App.css`, then uses the useGlue hook provided by `@glue42/react-hooks` to open two workspaces with predifined configs located in `./src/workspaceDefinitions.ts` and then assigns them to their corresponding buttons. In useGlue the component subsrcibes for workspaces selection changed to change the color of the icon when the selected workspace changes. Before starting the application please make sure that you have passed valid application names to the `getDocsWorkspace` and `getClientWorkspace` methods in `./CustomWorkspaces.tsx`.

Also the component adds a ToggleWorkspaceContents button which demonstrates how you can mount and unmount the workspace contents and show your own component in its place through conditional rendering.

## How to customize the example to fit your use case
- **Using layouts** - To use layouts you can invoke the .restoreWorkspace method just make sure to pass the `"noTabHeader":true` flag to hide the worksapce tab header element.
- **Adding buttons on demand** - to add buttons dynamically you can load more buttons as components in the desired zone and then invoke either `.createWorkspace` or `.restoreWorkspace` just make sure to pass the `"noTabHeader":true` flag.
- **Changing the icons** - the icons are located in `./src/App.css` and can be changed from there.
- **Marking workspaces** - depending on your use case you can either identify the workspaces by their `.layoutName` property or by adding a flag in their context.