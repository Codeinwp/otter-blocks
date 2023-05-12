# Handbook

> Things to take in consideration when developing.

### Working with React hooks

Hooks can be tricky to work with, especially with the `useEffect` hook or `useSelect/useDispatch` hooks from Gutenberg.

- Infinite loops. To detect infinite loops, you can use `console.count` function and check the console. If you see a number that does not stop from increasing, you have an infinite loop.
- Throttle. Sometimes the hooks can activate more times that you anticipate. If you initially think that the hook should be triggered only once per change, but you see in console that it is triggered multiple times, you need to investigate other factors that may trigger the hooks.
- Conditions. If you have a condition that should trigger the hook, make sure that the condition is correct. This is usually the most common way to create infinite loops or throttle hooks.
- Dependencies. If you have a hook that should be triggered only when a specific dependency changes, make sure that the dependency is correct.
- When you split a big `useEffect` in smaller ones, make sure to monitor the activation call when developing. You can have some surprises on the activation chain.
- Prefer batch changes. Instead of having function calls split ( like `setAttributes({ color: newColor })` and `setAttributes({ fontSize: newFontSize})` ), try to have them in the same function call (`setAttributes({ color: newColor, fontSize: newFontSize })`). Newer version on React will batch the changes automatically and will trigger only one render. But we working in Gutenberg, the people might not always have latest version of Gutenberg.
- Pay attention when working with `refs`, sometime you have some external libs that are not made with React in mind (like Lottie player), and you want to update the state, pay attention to undefined values.

Tips: Always put a `console.log/console.count` in the hook to see when it is triggered. This will help you to understand the flow. And always check for undefined values.

### Adding components in Inspector

Most of your time when developing a block will go in the Inspector. You will need to add new components, new options, new controls, etc. Here are some tips:
- If you need to add a new reusable component, make sure to add it in the `./src/blocks/components` folder. This will help you to keep the code clean and organized.
- Looks on how other blocks are made. You can even check the Gutenberg core blocks to see how they are made or tackle a specific issue. [Link to repo](https://github.com/WordPress/gutenberg/tree/trunk/packages/block-library/src).
- Consult the Gutenberg Story website to see available controls and components. [Link to website](https://wordpress.github.io/gutenberg/?path=%2Fstory%2Fdocs-introduction--page).
- Try to keep the code as tidy as possible. Ideally you will not want to do a lot of have work in the `inspector.js` file. The main objective is to set new data to `attributes`.

### Making the Save function

The `save` function is the one that will render the block on the front-end. The pain point of a `save` function is that when you need to change it, you need to make sure it does not break the block by emitting an incompatible HTML code. This is why we make the CSS values as dynamic with PHP. This way, if you change the CSS, the block will still work on the front-end without breaking the HTML.
- Only put the essential. Anything else should be done with PHP or JS (with frontend script).
- If you think that the structure will not be stable (many things can be re-structured for future features -- like a Form field) consider making the rendering with PHP. 

### CSS pain points.

Most of the bugs are related to CSS and 50% of the dev pain come from them. Here are some tips:
- SCOPING. Scoping your CSS is essential to avoid conflicts with other blocks / theme related CSS or Core Components/Blocks. Sometime `>`, `:not()`, `has:()`, `:is()` can be a saviors or villains depending on how you use them.
- CSS Variables. CSS Variables are a great way to make your CSS dynamic. But they can be tricky to use. Make sure to use them in the right way. You can check the [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) documentation to see how to use them.
- CHECK THE NAMES. Is very easy to make typos and get frustrated when you don't see the changes.
- Check their values. You will sometime see values like `undefinedpx` (undefined value used as `px` value) or `Object [object]` (you have a structure and forget to transform it). Check for undefined values and their type.
- Explore the possibilities. As time goes, CSS is getting more functionality which can save you from implementing complex JS code and reducing the size. You check those sources: [CSS Tricks](https://css-tricks.com/), [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS), [Can I Use](https://caniuse.com/), [Kevin Powell - CSS Wizard](https://www.youtube.com/@KevinPowell/videos).

### JS pain points.

JS is life and blood of the blocks. JS mistakes are more easily to spot but still a source of pain.

- Use Typescript where you can. It will help you to spot errors more rapidly.
- Use `// @ts-check` to active Typescript checking in your JS files. This usually does not work great with files that have relays on Gutenberg libs, but very good to check for mistakes in simple function.
- Use `debugger;`. Most of the time you will use `console.log`, but some times more power is needed. [Read more about debugger](https://developer.chrome.com/docs/devtools/javascript/).
- When you update a state, make sure to create a new object. If you update the same object, React will not trigger a re-render. `setAttributes( attributes ) vs setAttributes({ ...attributes })`. [Read more about this](https://reactjs.org/docs/hooks-reference.html#bailing-out-of-a-state-update).

### PHP pain points.

At the end of day, you need to load your JS and CSS files to see your work. PHP might look boring, but there a lot of thing going on when you take in consideration WordPress ecosystem.

- Best friend when is come exploring the WordPress ecosystem is the [WP Codex](https://codex.wordpress.org/Main_Page). It is a great source of information.
- Best search engine: [phind](https://www.phind.com)
- DEBUGGER. If it is possible, use a debugger. It will help you to understand what is going on in a much better way.
- Careful when using or adding hooks. It might break other plugins or functionality. Great attention to their priority.

### PHP REST API pain points.

When you create a new rest point, have in consideration:
- The name of the endpoint. Make sure that the name is not already used by another plugin or core. You can check the [WP REST API Handbook](https://developer.wordpress.org/rest-api/extending-the-rest-api/adding-custom-endpoints/) to see how to create a new endpoint.
- Sanitize the data. Make sure that the data is sanitized before usage. You can use the `sanitize_text_field` function to sanitize text data. [Read more about sanitization](https://developer.wordpress.org/themes/theme-security/data-sanitization-escaping/).
- Error handling. Make sure that you handle the errors and report back to the client (the script that made the request). You need to tell the client what is the problem so it can display the issue and might offer guidance to the user on how to fix it.



