# vns - VNScript

A visual novel engine, scripting language and player for creating interactive stories on the web.

## Table of Contents
- [Project Structure](#project-structure)
  - [VN Engine](#vn-engine)
  - [.vns Parser](#vns-parser)
  - [VN Editor](#vn-editor)
- [.vns File Format](#vns-file-format)
- [Contributing](#contributing)
- [License](#license)

## Project Structure

### VN Engine
  The VN Engine is the core module of the project. It executes JSON-formatted instructions to change the state of the game; changing the scene environment, setting the speaker(s), displaying text, playing audio, etc. This currently has the most functionality, and if you would like to know more about how it works, please skip to [VN Engine](./src/engine/README.md).
  

### .vns Parser
  The engine does not understand the .vns file format by default. The parser takes a string and converts it to a JSON object that the engine can understand. Since I haven't decided on the syntax yet, this is still a work in progress.

### VN Editor
  A graphical user interface alternative to writing scripts by hand. Not currently a priority, but it would be nice to have in the future.


## .vns File Format

The .vns file format aims to be human-readable and easy to write, while allowing for interoperability with whatever environment that the engine is running in. I haven't decided on a final syntax yet and I'm looking for help in designing it, so if you have any suggestions, please let me know! Here's an example of what I have so far:

```

## This is a comment. Comments are ignored by the parser.

--- project ---

  name = Example Project
  description = An example project to demonstrate the VNS format.
  version = 1.0.0
  license = MIT
  author = Anonymous
  url = https://example.com

--- script ---

## The scene is one persistent environment that has layers and characters,
## Which may be changed at any time by a script.

create layer bg
  | z = -1

create layer fg
  | z = 1

@start

  ## Selecting an object and setting multiple properties at once.
  with layer bg:
    - image = "./assets/bg.png"
    - position = (0, 0)
    - scale = (1, 1)

  alice
    How are you today?

  you (choice)
    What should I say?
    - I've been better. [answer.bad]
    - I'm good. [answer.good]

@answer
  @good
    You gesture enthusiastically.

    you
      I'm good.

    alice
      That's great!
      <-

  @bad
    you
      I've been better.

    alice
      I'm sorry to hear that. Is there anything I can do to help?

    you
      It's okay. I'll be fine. Thanks for asking.
      <-
```

## Contributing
  If you would like to contribute to the project, please feel free to fork the repository and submit a pull request. I'm open to suggestions and would love to hear your feedback!

## License
  This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.