import { AbstractControl, FormGroup } from '@angular/forms';

export function isInvalid(control: AbstractControl | null): boolean {
  return Boolean(control?.invalid && (control.dirty || control.touched));
}

export function markFormTouched(form: FormGroup): void {
  form.markAllAsTouched();
  form.updateValueAndValidity();
}
