import { Directive, forwardRef } from '@angular/core';
import { DefaultValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Allows the NasModel directive to
 */
@Directive({
  selector: 'input:not([type=checkbox])[nasModel],textarea[nasModel]',
  host: {
    '(input)': '$any(this)._handleInput($event.target.value)',
    '(blur)': 'onTouched()',
    '(compositionstart)': '$any(this)._compositionStart()',
    '(compositionend)': '$any(this)._compositionEnd($event.target.value)',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NasInputAdapterDirective),
      multi: true,
    },
  ],
})
export class NasInputAdapterDirective extends DefaultValueAccessor {}
