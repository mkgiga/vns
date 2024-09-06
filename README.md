# .vns - Visual Novel Script

## About
Visual Novel Script is an easy-to-read, easy-to-write scripting language for interactive visual experiences.

```
project:
   name: Untitled Visual Novel
   description: This is an example visual novel script.
   version: 1.0.0

# This is a comment. Comments automatically get removed when your script is fed into the player.
# Comments can be used as a way to leave notes for yourself or your co-authors and friends.

# A variable can be thought of as a little box that can hold a value, ie. a number, a series of characters, or a switch that can be turned on or off (true or false).
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

      Alice
         I'm calling the police.

      Bob
         Oh no, I'm so scared. Please don't call the police on me, I don't want to go to jail... NOT, ROFLMAO!
         Isn't it cool how I'm coming over to your house right now? I'm going to bring my gun and shoot you and your husband
         who is currently cheating on you by the way.

      Bob sends a picture of what appears to be a man and a woman in bed together.
      Although the image is a little blurry, it has just enough detail for Alice to recognize her husband and her sister.

      Alice
         What the hell is this?
         No... Nononono... this isn't happening. This all has to be some kind of weird, fucked up joke.

      Bob
         But it is happening, Alice -- and it's freaking hilarious! I can't wait to see the look on your face when I show up at your door.

      Alice has logged off.
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
  
