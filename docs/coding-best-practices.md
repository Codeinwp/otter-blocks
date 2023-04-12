# Coding Best Practices

<img src="https://imgs.xkcd.com/comics/standards_2x.png" width="400" alt="Coding practices meme from xkcd">

## Introduction

Best practices are a set of guidelines that help you write code that is easy to read, understand, and maintain. They are a set of rules that you should follow when writing code. They are not rules that you must follow, but they are recommended.

We follow the [WordPress Coding Standards](https://make.wordpress.org/core/handbook/best-practices/coding-standards/).

But this is not enough...

## Code for the Team

> When you write code, you are not writing it for yourself. You are writing it for the team. You are writing it for the future you. You are writing it for the future team members. You are writing it for the future clients. -- Copilot, April 2023

The sign of code quality are:
- Easy to read and understand.
- Easy to maintain.
- Easy to extend.
- Easy to debug.

To general, let's make an example for it:

Suppose you have this task: `Given a list of numbers, sum only the even numbers.`

A simple book-like solution would be:

```javascript
const numbers = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];

let sum = 0;

for ( let i = 0; i < numbers.length; i++ ) {
    if ( numbers[ i ] % 2 === 0 ) {
        sum += numbers[ i ];
    }
}

console.log( sum );
```

This is a simple solution. But it can be better. Let's refactor it:

```javascript
const numbers = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];

const sum = numbers
    .filter( ( number ) => number % 2 === 0 )
    .reduce( ( sum, number ) => sum + number, 0 );

console.log( sum );
```

Why is this better?

- It is easier to read and understand. When you have a classic `for` loop, you need to read the whole loop to understand what it does. With the `filter` and `reduce` functions, you can understand what it does by reading only the first line. `filter` and `reduce` are specialized loops, they have a specific purpose.
- Easy to maintain. It it easier to spot where to make a change.
- Easy to extend. If the numbers are send as `string` instead of `number`, you can easily change the code to convert them to `number` before filtering and reducing. Example: Add `.map( ( number ) => parseInt( number, 10 ) )` before filter.
- Easy to debug. The functionality is modular, so you can remove things one at the time and check them. One neat trick you can do is to create an inspection function like this:

```javascript
const inspect = ( value ) => {
    console.log( value );
    return value;
};
```

Then, you can add it in the chain like this:

```javascript
const sum = numbers
    .filter( ( number ) => number % 2 === 0 )
    .map( inspect )
    .reduce( ( sum, number ) => sum + number, 0 );
```

This will out the result at each step of the chain. This is very useful when you need to debug a chain of functions.

The first version might me more faster, but if the code is running only at a press of a button or an event, it is not a big deal.

## Elegant Code

In era of generated code, we still need to have elegant code. At the end of the day, we are still writing code for humans (this might be obsolete in feature). We need to write code that is easy to read and understand.

Since the beginning of coding, people made a lot of articles and principles about how to write elegant code. Here are some of them:

- DRY (Don't Repeat Yourself) - [Wikipedia](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)
- KISS (Keep It Simple, Stupid) - [Wikipedia](https://en.wikipedia.org/wiki/KISS_principle)
- YAGNI (You Ain't Gonna Need It) - [Wikipedia](https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it)
- SOLID - [Wikipedia](https://en.wikipedia.org/wiki/SOLID)
- Design Patterns - [Wikipedia](https://en.wikipedia.org/wiki/Software_design_pattern)

## Performance

If you come from a background where performance is a big deal, you might be tempted to write code that is optimized for performance. Example: game development, HPC, etc.

In this project, we do not have cases when the code must do a lot of things at a high rate (like rendering a scene in a game). So, we can write code that is easy to read and understand, and we can optimize it later if needed.

> Early optimization is the root of all evil. -- Donald Knuth

The challenge in this project is to extend the code to support more features. The more we have, the harder it will be to maintain the code. Fancy tricks without a good reason are not good.

A piece code that is performant, easy to read and understand, and easy to maintain is the best. [But sometime you can not have it all](https://www.youtube.com/watch?v=hFDcoX7s6rE). So, you need to choose what is more important for your case.