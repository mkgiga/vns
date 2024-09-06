# .vns - Visual Novel Script

## About
Visual Novel Script is an easy-to-read, easy-to-write scripting language for interactive visual experiences.

```
$score = 0

=> start

   fade in
   play comfy-music.mp3

   Bob
      Hello Alice, how are you doing today?

   Alice
      If you don't respond to this message, your mom will die at 3 AM tonight.

   Bob
      Oh no. Are you serious?

   What does bob do?
      (1) Respond
      (2) Ignore her and turn off your computer.
      (3) Respond with her IP-address, an image of her house and an image of a handgun.
      -> choice

=> choice
   => 1
      Bob
         I'm not taking any chances. Are you happy now?

      Alice has logged off.

      Bob
         What?!

   => 2
      Bob ignores the message, but can't help but a lingering albeit fading sense of a paranoia for a while.

   => 3
      $score += 1
      
      A mischievous little jokester, maybe even a bit of a silly prankster, if you will; 
      Bob sends Alice a picture of a handgun, her IP-address and an image of her house. That little
      checkmark next to the message indicates that she has seen it, but she doen't respond for a while.
      
      "Alice is typing..." appears below the message box.
      
      Bob
        Well, what do you have to say for yourself?
```

## Status
This project is not finished; I just published the work-in-progress to this repository after refactoring and cleaning up the files.
Currently, I'm taking a somewhat rigid, not-so-elegant approach to parsing the context tree. If anyone knows how to define an AST that does not make you want to rip your eyes 
out (where every node contains its own callback function) you can send me a message or make a PR.

## Goals
### Core goals
- Create a web component `<visual-novel>` that can be embedded on in any web page which accepts a `src` attribute to a .vns text file.
- Standardize and implement the .vns language format in a way that streamlines visual novel script writing.
### Stretch goals
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
  
