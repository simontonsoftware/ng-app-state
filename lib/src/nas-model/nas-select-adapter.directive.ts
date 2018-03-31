import { Directive, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, SelectControlValueAccessor } from '@angular/forms';

@Directive({
  selector: 'select:not([multiple])[nasModel]',
  host: {
    '(change)': 'onChange($event.target.value)',
    '(blur)': 'onTouched()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NasSelectAdapterDirective),
      multi: true,
    },
    {
      provide: SelectControlValueAccessor,
      useExisting: forwardRef(() => NasSelectAdapterDirective),
    },
  ],
})
export class NasSelectAdapterDirective extends SelectControlValueAccessor {}
