const vnProject = createProject({
  name: "example",
  version: "1.0.0",
  description: "Example project",
  music: {
    cozy: "music/bedroom.ogg",
    sunny_day: "music/beach.ogg",
  },
});

createPlace("bedroom", {
  name: "Bedroom",
  description: "A cozy bedroom",
  background: "bedroom.jpg",
  theme: "music/bedroom.ogg",
});

createPlace("beach", {
  name: "Beach",
  description: "A sunny beach",
  background: "beach.jpg",
  theme: "music/beach.ogg",
});

createActor("you", {
  name: "You",
  description: "You are a person who is reading this text right now",
  color: "white",
  aliases: ["@", "me"],
});

createActor("john", {
  name: "John",
  description:
    "John is a boy from elementary school who was really mean to me. I hate him.",
  body: {
    pose: {
      standing: "images/john-standing.png",
    },
  },
  default: {
    body: {
      pose: "standing",
    },
  },
  color: "red",
});

createActor("mom", {
  name: "Mom",
  description:
    "My mom is the best mom in the world. She always knows how to make me feel better.",
  body: {
    pose: {
      standing: "images/mom-standing.png",
    },
  },
  default: {
    body: {
      pose: "standing",
    },
  },
  color: "blue",
});

function start() {
  playAudio(`cozy`);
  narrate(`You are in your bedroom. You can see your bed, your desk, and your closet. You can also see a picture of your family on the wall. You can hear the sound of the wind outside.`);
  focusActor("you");
  dialogue(`Another day gooning out in my room. I'm boutta- I'm boutta... c-c-cuuuummmmmm~`);
  focusActor("mom");
  dialogue(`Hi, honey. How are you feeling today?`);
  choice([
    { goto: "1", text: "Mom!! What are you doing in my room?!" },
    { goto: "2", text: "I'm fine, mom. Just tired." },
    { goto: "3", text: "I'm feeling great, mom. Thanks for asking." },
  ], mom_question);
}

function mom_question() {
  function _1() {
    focusActor("you");
    dialogue(`Mom!! What are you doing in my room?!`);
    focusActor("mom");
    dialogue(`I just wanted to check up on you. You've been in here all day.`);
  }

  function _2() {
    focusActor("you");
    dialogue(`I'm fine, mom. Just tired.`);
    focusActor("mom");
    dialogue(`You should get some fresh air. It'll make you feel better.`);
  }

  function _3() {
    focusActor("you");
    dialogue(`I'm feeling great, mom. Thanks for asking.`);
    focusActor("mom");
    dialogue(`That's good to hear. I'm glad you're feeling better.`);
  }
}
