export const foo = "foo";
export const bar = "bar";

console.log("lib");

function hello() {
  console.log("hello world");
  return;
  console.log("hello world after return");
}

function world() {
  console.log("world");
}

hello();

window.hello = hello;

if (false) {
  console.log("hello world in if");
}
