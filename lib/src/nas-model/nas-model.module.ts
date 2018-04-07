import { NgModule } from '@angular/core';
import { NasCheckboxAdapterDirective } from './nas-checkbox-adapter.directive';
import { NasInputAdapterDirective } from './nas-input-adapter.directive';
import { NasModelDirective } from './nas-model.directive';
import { NasRadioAdapterDirective } from './nas-radio-adapter.directive';
import { NasRangeAdapterDirective } from './nas-range-adapter.directive';
import { NasSelectAdapterDirective } from './nas-select-adapter.directive';
import { NasSelectMultipleAdapterDirective } from './nas-select-multiple-adapter.directive';

const exportedDirectives = [
  NasCheckboxAdapterDirective,
  NasInputAdapterDirective,
  NasModelDirective,
  NasRadioAdapterDirective,
  NasRangeAdapterDirective,
  NasSelectAdapterDirective,
  NasSelectMultipleAdapterDirective,
];

@NgModule({
  declarations: exportedDirectives,
  exports: exportedDirectives,
})
export class NasModelModule {}
