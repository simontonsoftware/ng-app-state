import { Directive, forwardRef } from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  SelectMultipleControlValueAccessor,
} from '@angular/forms';

@Directive({
  selector: 'select[multiple][nasModel]',
  host: { '(change)': 'onChange($event.target)', '(blur)': 'onTouched()' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NasSelectMultipleAdapterDirective),
      multi: true,
    },
    {
      provide: SelectMultipleControlValueAccessor,
      useExisting: forwardRef(() => NasSelectMultipleAdapterDirective),
    },
  ],
})
export class NasSelectMultipleAdapterDirective extends SelectMultipleControlValueAccessor {}
