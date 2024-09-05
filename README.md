# .vns - Visual Novel Script

## About
Visual Novel Script is an easy-to-read, easy-to-write scripting language for interactive visual experiences.

## Status
This project is not finished; I just published the work-in-progress to this repository after refactoring and cleaning up the files.
Currently, I'm taking a somewhat rigid, not-so-elegant approach to parsing the context tree. If anyone knows how to define an AST that does not make you want to rip your eyes 
out (where every node contains its own callback function) you can send me a message or make a PR.

## Goals
- Create a web component `<visual-novel>` that can be embedded on in any web page which accepts a `src` attribute to a .vns text file.
- Standardize and implement the .vns language format in a way that streamlines visual novel script writing.

## Stretch goals
- Implement a lightweight visual novel editor for the web that allows for management of projects and visualization of its flow.

## Building
#### 1. Clone the project
   
   ```
   git clone "https://github.com/mkgiga/vns/"
   ```
#### 2. Enter the directory and install the dependencies.
   
   ```
   cd ./vns && npm install;
   ```
#### 3. Build the project -- the output will be inside *`./dist`*
   
   ```
   npm run build
   ```
  
