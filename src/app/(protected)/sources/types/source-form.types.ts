// Types and helpers for the source form

type StringField = { value: string };

type SourceFormValues = {
  name: string;
  url: string;
  is_active: boolean;
  keywords: string[];
  dateStrings: StringField[];
  containerSelectors: StringField[];
  titleSelectors: StringField[];
  dateSelectors: StringField[];
  leadSelectors: StringField[];
};

type SourceFormValuesInput = {
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
};

function toStringFields(arr: string[] = []): StringField[] {
  return arr.map((v) => ({ value: v }));
}

function fromStringFields(arr?: StringField[]): string[] {
  return arr?.map((v) => v.value) || [];
}

function isValidCssSelector(selector: string) {
  try {
    document.createDocumentFragment().querySelector(selector);
    return true;
  } catch {
    return false;
  }
}

export type { StringField, SourceFormValues, SourceFormValuesInput };
export { toStringFields, fromStringFields, isValidCssSelector };
