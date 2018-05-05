import { Directive, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, SelectControlValueAccessor } from '@angular/forms';

@Directive({
  selector: 'select:not([multiple])[nasModel]',
  // tslint:disable-next-line:use-host-property-decorator
  host: {
    '(change)': 'onChange($event.target.value)',
    '(blur)': 'onTouched()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectValueAccessorDirective),
      multi: true,
    },
    {
      provide: SelectControlValueAccessor,
      useExisting: forwardRef(() => SelectValueAccessorDirective),
    },
  ],
})
export class SelectValueAccessorDirective extends SelectControlValueAccessor {}
