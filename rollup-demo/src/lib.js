class Person {
  constructor(name) {
    this.name = name;
  }

  sayHello() {
    console.log(`Hello, my name is ${this.name}`);
  }
}

const A = Person;

Array.prototype.hello = function () {
  console.log("hello world");
};

export function hello() {
  console.log("hello world");
}

export function goodbye() {
  console.log("goodbye world");
}
