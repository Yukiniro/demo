import { group } from "radash";

const data = [
  { name: "John", age: 25 },
  { name: "Jane", age: 30 },
  { name: "Jim", age: 25 },
];

const grouped = group(data, item => item.age);

console.log(grouped);

// {
//   '25': [ { name: 'John', age: 25 }, { name: 'Jim', age: 25 } ],
//   '30': [ { name: 'Jane', age: 30 } ]
// }
