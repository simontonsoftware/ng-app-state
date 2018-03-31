import { NgModule } from '@angular/core';
import { NasCheckboxAdapterDirective } from './nas-checkbox-adapter.directive';
import { NasInputAdapterDirective } from './nas-input-adapter.directive';
import { NasModelDirective } from './nas-model.directive';
import { NasSelectAdapterDirective } from './nas-select-adapter.directive';

const exportedDirectives = [
  NasCheckboxAdapterDirective,
  NasInputAdapterDirective,
  NasModelDirective,
  NasSelectAdapterDirective,
];

@NgModule({
  declarations: exportedDirectives,
  exports: exportedDirectives,
})
export class NasModelModule {}
