import { Directive, forwardRef } from "@angular/core";
import { DefaultValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

/** @private */
@Directive({
  selector:
    "input:not([type=checkbox]):not([type=number]):not([type=radio]):not([type=range])[nasModel],textarea[nasModel]",
  // tslint:disable-next-line:use-host-property-decorator
  host: {
    "(input)": "$any(this)._handleInput($event.target.value)",
    "(blur)": "onTouched()",
    "(compositionstart)": "$any(this)._compositionStart()",
    "(compositionend)": "$any(this)._compositionEnd($event.target.value)",
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputValueAccessorDirective),
      multi: true,
    },
  ],
})
export class InputValueAccessorDirective extends DefaultValueAccessor {}
