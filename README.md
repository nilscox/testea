# Testea

**Warning: this is a work in progress!** _(well, when I have time...)_

As we build amazing web applications, we must be able to test them correctly. This tool provides a simple framework to write end-to-end tests that run directly inside a browser. It uses [selenium](https://www.selenium.dev/) to launch an automated browser and [mocha](https://mochajs.org/) as the test runner, and can easily be interfaced with other libraries.

Testea provides an iframe to open and navigate an app, where we can check that it is rendering and responding as expected. This can be achieved by querying the iframe directly or using a library like [testing-library](https://testing-library.com/).

## How to

The idea is simple: Testea exposes an `IFrame` class instance which provides useful methods to navigate inside the iframe and access its body, local storage, cookies...

Writing tests is fairly simple. All you need is to serve a frontend which contains the tests. This repository's `demo` folder shows an example project with tests written in typescript and transpiled / served using snowpack.

When writing tests using [mocha in the browser](https://mochajs.org/#running-mocha-in-the-browser), the iframe instance will be accessible through mocha's context (e.g. `this.iframe`). All the methods available in the iframe instance are described in the [API](#API) section.

About the project architecture, testea can be installed inside an already existing project, or in a dedicated project for the tests. Both senarios make sense.

**Installation**

```
yarn add -D <this repository's url>
```

> Note: testea is not available on the npm package registry

**Writing the tests**

For the sake of simplicity, this example is contained inside a single `index.html` file. Of course, in a real-world project tests will most likely be transpiled and served using a build tool.

Here is a basic structure to run tests using testea. The most relevant parts are:

- calling `testea.setup()` before `mocha.setup()`
- accessing the iframe using mocha's context (`this.iframe`)
- calling `testea.run()` instead of `mocha.run()`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <link type="text/css" rel="stylesheet" href="https://unpkg.com/mocha/mocha.css" />
    <link type="text/css" rel="stylesheet" href="https://cdn.jsdelivr.net/gh/nilscox/testea/testea.css" />
  </head>
  <body>
    <script src="https://unpkg.com/mocha/mocha.js"></script>
    <script type="module">
      import testea from 'https://cdn.jsdelivr.net/gh/nilscox/testea';

      testea.setup();
      mocha.setup('bdd');

      describe('hello testea', () => {
        it('query the iframe', async function () {
          await this.iframe.navigate('http://localhost:8000');

          const searchInput = this.iframe.body.querySelector('[name="search"]');
          // ...
        });
      });

      testea.run();
    </script>
  </body>
</html>
```

A more realistic example using `testing-library` could look like the following snippet. We use `@testing-library/dom`'s `getQueriesForElement` function to query elements inside the iframe, and `@testing-library/user-event`'s type function to manipulate them.

```ts
it('should login', async function () {
  const iframe = this.iframe;

  await iframe.navigate('http://localhost:8000/login');
  const { getByPlaceholderText, getByRole, findByText } = getQueriesForElement(iframe.body);

  await userEvent.type(getByPlaceholderText('Adresse email'), 'user6@domain.tld');
  await userEvent.type(getByPlaceholderText('Mot de passe'), 'password');

  userEvent.click(getByRole('button', { name: 'Connexion' }));

  await waitFor(() => expect(iframe.location?.pathname).to.eql('/welcome'));

  expect(iframe.getLocalStorageItem('userId')).to.eql(6);
});
```

> Tip: for easier debugging, the iframe instance is also exposed to the console

**Launching the browser**

The browser can be started using `yarn testea <url>`. It will open a headed chrome instance, wait for the tests to finish and exit. The tests results will automatically be forwarded from the browser to the terminal's standard output, in order to have a feedback even when the browser runs in an headless environment.

`testea` can be launched with:

```plain
--headless            : do not start the browser's graphical interface
--screenshots <dir>   : specify the screenshot directory
--keep-open           : do not exit the browser when the tests are finished
--devtool             : open the browser's devtool
```

> Note: you can also run the tests in your own browser, but you may need to teak it a little, like using chrome's `--disable-web-security` flag

## API

The `IFrame` class exposes the following properties and methods:

```ts
get element(): HTMLIFrameElement
get contentWindow(): Window | null
get document(): Document | undefined
get body(): HTMLElement | undefined
get location(): Location | undefined
```

The actual iframe element and some of its most common properties.

```ts
navigate(url: string): Promise<HTMLIFrameElement>;
```

Navigate to the given URL. This method resolves when the iframe's onload function is called.

```ts
reload(): Promise<HTMLIFrameElement>;
```

Reload the current page.

```ts
getCookie(name: string): string | undefined;
setCookie(name: string, value: string, expires: Date, path?: string): void;
clearCookies(): void;
```

Access the iframe's cookies.

```ts
getLocalStorageItem(key: string): string | null;
setLocalStorageItem(key: string, value: string): void;
clearLocalStorage(): void;
```

Access the iframe's local storage.
