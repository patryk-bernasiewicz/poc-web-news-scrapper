import { z } from 'zod';

import { isValidCssSelector } from './source-form.types';

const keywordRegex = /^[\p{L}\d ]+$/u;

export const sourceFormSchema = z.object({
  name: z.string().min(3, 'Nazwa musi mieć co najmniej 3 znaki'),
  url: z
    .string()
    .url('Podaj poprawny adres URL')
    .refine(
      (val) => val.startsWith('http://') || val.startsWith('https://'),
      'Adres URL musi zaczynać się od http:// lub https://',
    ),
  is_active: z.boolean(),
  keywords: z
    .array(
      z
        .string()
        .min(1)
        .regex(
          keywordRegex,
          'Słowa kluczowe mogą zawierać tylko litery, cyfry i spacje',
        ),
    )
    .min(1, 'Dodaj co najmniej jedno słowo kluczowe'),
  dateStrings: z.array(z.object({ value: z.string() })),
  containerSelectors: z
    .array(
      z.object({
        value: z
          .string()
          .refine(isValidCssSelector, 'Nieprawidłowy selektor CSS'),
      }),
    )
    .min(1, 'Dodaj co najmniej jeden selektor kontenera'),
  titleSelectors: z
    .array(
      z.object({
        value: z
          .string()
          .refine(isValidCssSelector, 'Nieprawidłowy selektor CSS'),
      }),
    )
    .min(1, 'Dodaj co najmniej jeden selektor tytułu'),
  dateSelectors: z
    .array(
      z.object({
        value: z
          .string()
          .refine(isValidCssSelector, 'Nieprawidłowy selektor CSS'),
      }),
    )
    .min(1, 'Dodaj co najmniej jeden selektor daty'),
  leadSelectors: z
    .array(
      z.object({
        value: z
          .string()
          .refine(isValidCssSelector, 'Nieprawidłowy selektor CSS'),
      }),
    )
    .min(1, 'Dodaj co najmniej jeden selektor leadu'),
});
