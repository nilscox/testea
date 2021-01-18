# Testea

_Warning: this is a work in progress!_ (well, when I have time...)

Run end-to-end tests in the browser.

As we build amazing web applications, we must be able to test them corretly. This tool provides a simple framework to write end-to-end tests, that run directly in the browser. It uses selenium and mocha to run the tests in an automated browser, and can easily be interfaced with other libraries.

The idea is simple: testea provides an iframe to open and navigate an app, where we can check that the app is rendering as it should and that is responds correctly. This can be achieved by querying the iframe directly or using a library like `@testing-library/dom`.

## Introduction

What Testea gives you is an `IFrame` class instance that will be accessible inside your tests. It provides useful methods to navigate and access the iframe's body, local storage, cookies... But it also gives you a command line script to start a browser, run the tests inside it and forward the results to the console.

Writing tests is fairly simple, you need to:

- install testea
- serve a frontend app containing the tests
- run `yarn test-runner` to launch the browser

Testea can be added to an already existing frontend package, or to a dedicated package containing the tests. Both senarios are possible.

### Installation

```
yarn add -D <this repository's url>
```

> Note: testea is not available on the npm package registry

### Writing the tests

For the sake of simplicity, all the tests in this example will be written in a single `index.html` file. But in a real-world project, tests will most likely be transpiled and served using a build tool like webpack (have a look at this repository's demo folder, which uses snowpack to build the tests).

Here is the full frontend containing one test:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <link type="text/css" rel="stylesheet" href="https://unpkg.com/mocha/mocha.css" />
    <link type="text/css" rel="stylesheet" href="/style.css" />
  </head>
  <body>
    <div class="container">
      <div id="mocha"></div>
      <iframe src="" width="100%" height="100%" frameborder="0"></iframe>
    </div>

    <script src="https://unpkg.com/mocha/mocha.js"></script>

    <script type="module">
      import { setup } from 'https://cdn.jsdelivr.net/gh/nilscox/test-runner/dist/index.js';

      mocha.setup('bdd');

      describe('hello testea', () => {
        it('query the iframe', async function () {
          await iframe.navigate('http://localhost:8000');

          const searchInput = iframe.body.querySelector('[name="search"]');
          // ...
        });
      });

      const runner = mocha.run();

      setup(runner);
    </script>
  </body>
</html>
```

So, this basic HTML file imports the necessary assets, such as some styles from mocha and testea, the code from mocha browser and the `setup` function from teastea.
Then it declares a piece of javascrit code to setup mocha, define a test case, and call `mocha.run()`.

Using @testing-library/dom, a test could look like:

```ts
it('should login', async function () {
  const iframe = this.iframe;

  await iframe.navigate('http://localhost:8000/login');
  const { getByPlaceholderText, getByRole, findByText } = getQueriesForElement(iframe.body);

  const emailField = getByPlaceholderText('Adresse email');
  const passwordField = getByPlaceholderText('Mot de passe');
  const loginButton = getByRole('button', { name: 'Connexion' });

  expect(loginButton).to.have.attr('disabled');

  await type(emailField, 'user6@domain.tld');
  await type(passwordField, 'invalid');

  expect(loginButton).not.to.have.attr('disabled');

  click(loginButton);

  findByText('Combinaison email / mot de passe non valide');

  await clear(passwordField);
  await type(passwordField, 'password');

  click(loginButton);

  await waitFor(() => expect(iframe.location?.pathname).to.eql('/welcome'));

  expect(iframe.getLocalStorageItem('userId')).to.eql(6);
});
```

In this example, we use `@testing-library/dom`'s `getQueriesForElement` function to get the standard query functions inside the iframe. Using them makes it very easy to query and manipulate the DOM (through `user-event`'s functions).

> Tip: for easier debugging, the iframe instance is also exposed to the console

### Launching the browser

Now that the tests are ready, the browser can be started using `yarn testea <url>`. It will open a headed chrome instance, wait for the tests to finish and exit. The tests results will be automatically forwarded from the browser to the terminal's standard output, so we still have a feedback even when the browser is started in an headless environment (like in a CI).

`testea` can be launched with:

```plain
--headless            : do not start the browser's graphical interface
--screenshots <dir>   : specify the screenshot directory
--keep-open           : do not exit the browser when the tests are finished
--devtool             : open the browser's devtool
```

> Note: you can also run the tests in your browser, but you may need to teak it a little, like using chrome's `--disable-web-security` flag

## API

The `IFrame` class exposes the following properties and methods:

```
get element(): HTMLIFrameElement
get contentWindow(): Window | null
get document(): Document | undefined
get body(): HTMLElement | undefined
get location(): Location | undefined
```

The actual iframe element and some of it's most common properties.

```
async navigate(url: string): Promise<HTMLIFrameElement>;
```

Navigate to the given URL. This method resolves when the iframe's onload function is called.

```
reload(): Promise<HTMLIFrameElement>;
```

Reload the current page.

```
getCookie(name: string): string | undefined;
setCookie(name: string, value: string, expires: Date, path?: string): void;
clearCookies(): void;
```

Access the iframe's cookies.

```
getLocalStorageItem(key: string): string | null;
setLocalStorageItem(key: string, value: string): void;
clearLocalStorage(): void;
```

Access the iframe's local storage.
