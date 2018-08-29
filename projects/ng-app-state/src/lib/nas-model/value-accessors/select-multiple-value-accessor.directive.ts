import { Directive, forwardRef } from "@angular/core";
import {
  NG_VALUE_ACCESSOR,
  SelectMultipleControlValueAccessor,
} from "@angular/forms";

@Directive({
  selector: "select[multiple][nasModel]",
  // tslint:disable-next-line:use-host-property-decorator
  host: { "(change)": "onChange($event.target)", "(blur)": "onTouched()" },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectMultipleValueAccessorDirective),
      multi: true,
    },
    {
      provide: SelectMultipleControlValueAccessor,
      useExisting: forwardRef(() => SelectMultipleValueAccessorDirective),
    },
  ],
})
export class SelectMultipleValueAccessorDirective extends SelectMultipleControlValueAccessor {}
