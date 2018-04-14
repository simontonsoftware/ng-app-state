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

  async function clearAndEnterValue(
    control: string | ElementFinder,
    value: string,
  ) {
    control = getControl(control);
    await clearValue(control);
    await control.sendKeys(value);
  }

  async function clearValue(control: string | ElementFinder) {
    control = getControl(control);

    // https://github.com/angular/protractor/issues/4343#issuecomment-350106755
    await control.sendKeys(Key.chord(Key.CONTROL, 'a'));
    await control.sendKeys(Key.BACK_SPACE);
    await control.clear();
  }

  function getControl(control: string | ElementFinder) {
    if (typeof control === 'string') {
      return getInput(control);
    } else {
      return control;
    }
  }

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

    async function testControl(
      control: string | ElementFinder,
      value: string,
      options?: ExpectFreeTextOptions,
    ) {
      await clearValue(control);
      await expectValue('');
      await clearAndEnterValue(control, value);
      await expectValue(value, options);
    }

    async function expectValue(
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

    it('work', async () => {
      await expectValue('initial text');

      await testControl('', 'default input');
      await testControl('text', 'text input');
      await testControl('search', 'search input');
      await testControl('tel', 'tel input');
      await testControl('password', 'password input');
      await testControl('email', 'email@input.com');
      await testControl('url', 'http://www.input.com/url');
      await testControl('', '#123456', { isColor: true });

      // https://stackoverflow.com/q/36402624/1836506
      browser.executeScript(`
        input = document.querySelector('input[type="color"]');
        input.value = '#654321';
        input.dispatchEvent(new Event('input'));
      `);
      await expectValue('#654321', { isColor: true });

      await testControl(textarea(), 'textarea\nvalue');
    });
  });

  describe('number inputs', () => {
    async function expectValue(value: string) {
      expect(await getInput('number').getAttribute('value')).toEqual(value);
      expect(await getInput('range').getAttribute('value')).toEqual(
        value || '50',
      );
    }

    it('work', async () => {
      await expectValue('42');

      await clearValue('number');
      await expectValue('');
      await getInput('number').sendKeys('75');
      await expectValue('75');

      await browser
        .actions()
        .dragAndDrop(await getInput('range'), { x: -99, y: 0 })
        .perform();
      await expectValue('0');
    });
  });
});
