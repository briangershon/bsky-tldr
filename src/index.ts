interface Person {
  name: string;
}

export function hello(person: Person): string {
  return `Hello from ${person.name}!`;
}
