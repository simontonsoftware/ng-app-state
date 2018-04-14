import { browser, element, by, ElementFinder, Key } from 'protractor';

const cities = ['San Francisco', 'Nairobi', 'Gulu'];

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

  describe('free text controls (and color)', () => {
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
      expect(await textarea().getAttribute('value')).toEqual(value);

      expect(await getInput('color').getAttribute('value')).toEqual(
        isColor ? value : '#000000',
      );
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
      await testControl(textarea(), 'textarea\nvalue');

      // https://stackoverflow.com/q/36402624/1836506
      browser.executeScript(`
        input = document.querySelector('input[type="color"]');
        input.value = '#654321';
        input.dispatchEvent(new Event('input'));
      `);
      await expectValue('#654321', { isColor: true });
    });
  });

  describe('number controls', () => {
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

  describe('choose one controls', () => {
    function getDropdown() {
      return element(by.css('select:not([multiple])'));
    }

    function getRadio(value: string) {
      return element(by.css(`input[type="radio"][value="${value}"]`));
    }

    async function expectValue(value: string) {
      expect(await getDropdown().getAttribute('value')).toEqual(value);
      for (const city of cities) {
        expect(await getRadio(city).getAttribute('checked')).toEqual(
          city === value ? 'true' : null!,
        );
      }
    }

    it('work', async () => {
      await expectValue('Nairobi');

      await element(by.cssContainingText('option', 'San Francisco')).click();
      await expectValue('San Francisco');

      await getRadio('Gulu').click();
      await expectValue('Gulu');
    });
  });

  describe('choose many controls', () => {
    function getOption(value: string) {
      return element(by.cssContainingText('select[multiple] option', value));
    }

    function getCheck(value: string) {
      return element(by.css(`input[type="checkbox"][value="${value}"]`));
    }

    async function expectValues(values: string[]) {
      for (const city of cities) {
        const expected = values.includes(city) ? 'true' : null!;
        expect(await getOption(city).getAttribute('checked')).toEqual(expected);
        expect(await getCheck(city).getAttribute('checked')).toEqual(expected);
      }
    }

    fit('work', async () => {
      await expectValues(['Nairobi', 'Gulu']);

      await getOption('Gulu').click();
      await element(by.cssContainingText('button', 'v')).click();
      await expectValues(['Nairobi']);

      await getCheck('Nairobi').click();
      await element(by.cssContainingText('button', '^')).click();
      await expectValues([]);
    });
  });
});
