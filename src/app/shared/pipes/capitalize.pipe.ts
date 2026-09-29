import { Pipe, PipeTransform } from '@angular/core';

const ROMAN_NUMERAL_REGEX = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

function capitalizeRomanNumerals(word: string): string | null {
  const upper = word.toUpperCase();
  if (upper.length === 0) return null;
  if (ROMAN_NUMERAL_REGEX.test(upper)) return upper;
  return null;
}

@Pipe({ name: 'pokeName', standalone: true })
export class PokeNamePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value.split('-').map(w => {
      return capitalizeRomanNumerals(w) ?? w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');
  }
}
