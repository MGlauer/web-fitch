# Web-Fitch

## Development

You can run Web-Fitch locally via

```
npm run dev
```

Node.js will then start a for-development-only webserver and show the port under which it can be accessed. You can then access it via your browser.

## Generate parser

We use [Peggy](http://peggyjs.org) to generate a parser for FOL sentences. The grammar is defined in [src/fitch/grammar.peggy](src/fitch/grammar.peggy).
To (re-)generate the parser use 
```
npm run parser
```

## Tests

We use [Vitest](https://vitest.dev/) test our application. You can run the tests via
```
npm run test
```