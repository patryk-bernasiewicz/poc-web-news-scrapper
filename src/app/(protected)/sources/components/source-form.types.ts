// Typy i helpery do formularza źródła

export interface StringField {
  value: string;
}

export interface SourceFormValues {
  name: string;
  url: string;
  is_active: boolean;
  keywords: string[];
  dateStrings: StringField[];
  containerSelectors: StringField[];
  titleSelectors: StringField[];
  dateSelectors: StringField[];
  leadSelectors: StringField[];
}

export interface SourceFormValuesInput {
  name: string;
  url: string;
  is_active: boolean;
  keywords: string[];
  dateStrings: string[];
  containerSelectors: string[];
  titleSelectors: string[];
  dateSelectors: string[];
  leadSelectors: string[];
  id?: string | number | bigint;
}

export function toStringFields(arr: string[] = []): StringField[] {
  return arr.map((v) => ({ value: v }));
}

export function fromStringFields(arr?: StringField[]): string[] {
  return arr?.map((v) => v.value) || [];
}

export function isValidCssSelector(selector: string) {
  try {
    document.createDocumentFragment().querySelector(selector);
    return true;
  } catch {
    return false;
  }
}
