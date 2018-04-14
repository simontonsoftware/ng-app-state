import { browser, element, by, ElementFinder, Key } from 'protractor';

describe('ng-app-state E2E Tests', () => {
  beforeEach(() => browser.get(''));

  afterEach(() => {
    browser
      .manage()
      .logs()
      .get('browser')
      .then((browserLog: any[]) => {
        const errors = browserLog.filter((entry) => entry.level === 'ERROR');
        expect(errors).toEqual([]);
      });
  });

  function getInput(type: string) {
    let css = 'input';
    if (type) {
      css += `[type="${type}"]`;
    }
    return element(by.css(css));
  }

  describe('free text inputs', () => {
    function textarea() {
      return element(by.css('textarea'));
    }

    interface ExpectFreeTextOptions {
      isColor?: boolean;
    }

    async function enterAndExpect(
      control: string | ElementFinder,
      value: string,
      options?: ExpectFreeTextOptions,
    ) {
      if (typeof control === 'string') {
        control = getInput(control);
      }

      // https://github.com/angular/protractor/issues/4343#issuecomment-350106755
      await control.sendKeys(Key.chord(Key.CONTROL, 'a'));
      await control.sendKeys(Key.BACK_SPACE);
      await control.clear();
      await expectValues('');

      await control.sendKeys(value);
      await expectValues(value, options);
    }

    async function expectValues(
      value: string,
      { isColor = false }: ExpectFreeTextOptions = {},
    ) {
      const stripped = value.replace(/[\r\n]/g, '');
      expect(await getInput('').getAttribute('value')).toEqual(stripped);
      expect(await getInput('text').getAttribute('value')).toEqual(stripped);
      expect(await getInput('search').getAttribute('value')).toEqual(stripped);
      expect(await getInput('tel').getAttribute('value')).toEqual(stripped);
      expect(await getInput('password').getAttribute('value')).toEqual(
        stripped,
      );
      expect(await getInput('email').getAttribute('value')).toEqual(stripped);
      expect(await getInput('url').getAttribute('value')).toEqual(stripped);
      expect(await getInput('color').getAttribute('value')).toEqual(
        isColor ? value : '#000000',
      );
      expect(await textarea().getAttribute('value')).toEqual(value);
    }

    it('works', async () => {
      await expectValues('initial text');
      await enterAndExpect('', 'default input');
      await enterAndExpect('text', 'text input');
      await enterAndExpect('search', 'search input');
      await enterAndExpect('tel', 'tel input');
      await enterAndExpect('password', 'password input');
      await enterAndExpect('email', 'email@input.com');
      await enterAndExpect('url', 'http://www.input.com/url');
      await enterAndExpect('', '#123456', { isColor: true });

      // https://stackoverflow.com/q/36402624/1836506
      browser.executeScript(`
        input = document.querySelector('input[type="color"]');
        input.value = '#654321';
        input.dispatchEvent(new Event('input'));
      `);
      await expectValues('#654321', { isColor: true });

      await enterAndExpect(textarea(), 'textarea\nvalue');
    });
  });
});
