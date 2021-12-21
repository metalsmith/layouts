### Before opening this issue

- [ ] I have checked [Stackoverflow](https://stackoverflow.com/questions/tagged/metalsmith) and the current [issue list](https://github.com/metalsmith/layouts/issues?q=is%3Aissue) to avoid posting a duplicate
- My issue is not a support request, but:
  - [ ] a bug report
  - [ ] a feature request
  - [ ] a documentation request

### Bug report

A clear and concise description of what the bug is, what you would expect and what actually happens. If you have any significant (npm, metalsmith) debug logs, please add them in a code block:

```
<debug log here>
```

**Environment**

- OS (run `node -e "console.log(process.platform)"`): ?
- Node|npm version (run `node -v && npm -v`): ?
- Metalsmith version: (run `npm view metalsmith version`): ?

**Reproducing the bug**
Describe the steps to reproduce the bug (your `Metalsmith.build`)

```js
// your build here
Metalsmith(__dirname)
  .use(...)
```

If the bug is somewhat complex to reproduce, we appreciate a link to your repository/ gist,
or a minimally reproducible test case on [repl.it](https://replit.com)

### Feature request

A clear and concise description of the proposed feature (e.g. adding an option), the problem the feature would solve, and a sample implementation:

Example:

```js
// example implementation
```
