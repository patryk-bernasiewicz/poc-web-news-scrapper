'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface SourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: SourceFormValuesInput;
  onSubmit: (values: SourceFormValuesInput) => Promise<void>;
  isEdit?: boolean;
}

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

// Typ wejściowy do modala (z bazy): dynamiczne pola jako string[]
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

const defaultValues: SourceFormValues = {
  name: '',
  url: '',
  is_active: true,
  keywords: [],
  dateStrings: [],
  containerSelectors: [],
  titleSelectors: [],
  dateSelectors: [],
  leadSelectors: [],
};

function toStringFields(arr: string[] = []): StringField[] {
  return arr.map((v) => ({ value: v }));
}
function fromStringFields(arr?: StringField[]): string[] {
  return arr?.map((v) => v.value) || [];
}

export function SourceModal({
  open,
  onOpenChange,
  initialValues,
  onSubmit,
  isEdit,
}: SourceModalProps) {
  const [originalValues] = useState<SourceFormValuesInput | undefined>(
    initialValues,
  );
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<SourceFormValues>({
    defaultValues: initialValues
      ? {
          ...initialValues,
          dateStrings: toStringFields(initialValues.dateStrings),
          containerSelectors: toStringFields(initialValues.containerSelectors),
          titleSelectors: toStringFields(initialValues.titleSelectors),
          dateSelectors: toStringFields(initialValues.dateSelectors),
          leadSelectors: toStringFields(initialValues.leadSelectors),
        }
      : defaultValues,
  });

  // Dynamic fields
  const containerSelectors = useFieldArray({
    control,
    name: 'containerSelectors',
  });
  const titleSelectors = useFieldArray({ control, name: 'titleSelectors' });
  const dateSelectors = useFieldArray({ control, name: 'dateSelectors' });
  const leadSelectors = useFieldArray({ control, name: 'leadSelectors' });

  // Keywords as tags (prosty input z przecinkiem)
  const keywords = watch('keywords');
  const [keywordInput, setKeywordInput] = useState('');

  function handleAddKeyword(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === ',' && keywordInput.trim()) {
      setValue('keywords', [...keywords, keywordInput.trim()]);
      setKeywordInput('');
      e.preventDefault();
    }
  }

  function handleRemoveKeyword(idx: number) {
    setValue(
      'keywords',
      keywords.filter((_, i) => i !== idx),
    );
  }

  function handleRestoreOriginal() {
    if (originalValues)
      reset({
        ...originalValues,
        dateStrings: toStringFields(originalValues.dateStrings),
        containerSelectors: toStringFields(originalValues.containerSelectors),
        titleSelectors: toStringFields(originalValues.titleSelectors),
        dateSelectors: toStringFields(originalValues.dateSelectors),
        leadSelectors: toStringFields(originalValues.leadSelectors),
      });
  }

  async function handleFormSubmit(values: SourceFormValues) {
    // Konwertuj dynamiczne pola na string[] przed wysłaniem do onSubmit
    const mapped: SourceFormValuesInput = {
      ...values,
      dateStrings: fromStringFields(values.dateStrings),
      containerSelectors: fromStringFields(values.containerSelectors),
      titleSelectors: fromStringFields(values.titleSelectors),
      dateSelectors: fromStringFields(values.dateSelectors),
      leadSelectors: fromStringFields(values.leadSelectors),
    };
    await onSubmit(mapped);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background p-6 shadow-lg max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-muted-foreground/40">
          <Dialog.Title className="text-lg font-bold mb-4">
            {isEdit ? 'Edytuj źródło' : 'Dodaj źródło'}
          </Dialog.Title>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div>
              <label className="block font-medium">Nazwa</label>
              <Input
                {...register('name', { required: true })}
                description="Nazwa źródła. Nie wpływa na wydobywanie informacji."
              />
            </div>
            <div>
              <label className="block font-medium">URL</label>
              <Input
                {...register('url', { required: true })}
                description="Podaj adres strony internetowej, z której mają być wydobywane linki do artykułów. Powinna ona wyświetlać np. listę newsów."
              />
            </div>
            <div>
              <label className="block font-medium">Słowa kluczowe</label>
              <div className="flex flex-wrap gap-1 mb-2">
                {keywords.map((kw, idx) => (
                  <Badge key={kw} className="flex items-center gap-1">
                    {kw}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(idx)}
                      className="ml-1 text-xs"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleAddKeyword}
                placeholder="Dodaj słowo kluczowe, oddziel przecinkiem"
                description="Słowa kluczowe, po których podczas wydobywania rozpoznawane będą artykuły, które należy dodać do bazy danych."
              />
            </div>
            <div>
              <label className="block font-medium">
                Ciągi znaków do rozpoznania daty publikacji (opcjonalnie)
              </label>
              {dateSelectors.fields.map((field, idx) => (
                <div key={field.id} className="w-full flex gap-2 mb-1">
                  <Input
                    {...register(`dateSelectors.${idx}.value` as const)}
                    description={
                      idx === 0
                        ? 'Po tych ciągach znaków rozpoznamy na tej stronie, że ten artykuł należy wydobyć. Użyj, jeśli na stronie data publikacji jest w niestandardowym formacie, np. zamiast daty wyświetlone jest słowo "dzisiaj" albo zwrot "X minut temu".'
                        : undefined
                    }
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => dateSelectors.remove(idx)}
                  >
                    Usuń
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                onClick={() => dateSelectors.append({ value: '' })}
              >
                Dodaj dateString
              </Button>
            </div>
            {/* Dynamiczne selektory */}
            <div>
              <label className="block font-medium">containerSelectors</label>
              {containerSelectors.fields.map((field, idx) => (
                <div key={field.id} className="flex gap-2 mb-1">
                  <Input
                    {...register(`containerSelectors.${idx}.value` as const)}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => containerSelectors.remove(idx)}
                  >
                    Usuń
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                onClick={() => containerSelectors.append({ value: '' })}
              >
                Dodaj selektor
              </Button>
            </div>
            <div>
              <label className="block font-medium">titleSelectors</label>
              {titleSelectors.fields.map((field, idx) => (
                <div key={field.id} className="flex gap-2 mb-1">
                  <Input
                    {...register(`titleSelectors.${idx}.value` as const)}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => titleSelectors.remove(idx)}
                  >
                    Usuń
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                onClick={() => titleSelectors.append({ value: '' })}
              >
                Dodaj selektor
              </Button>
            </div>
            <div>
              <label className="block font-medium">dateSelectors</label>
              {dateSelectors.fields.map((field, idx) => (
                <div key={field.id} className="flex gap-2 mb-1">
                  <Input {...register(`dateSelectors.${idx}.value` as const)} />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => dateSelectors.remove(idx)}
                  >
                    Usuń
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                onClick={() => dateSelectors.append({ value: '' })}
              >
                Dodaj selektor
              </Button>
            </div>
            <div>
              <label className="block font-medium">leadSelectors</label>
              {leadSelectors.fields.map((field, idx) => (
                <div key={field.id} className="flex gap-2 mb-1">
                  <Input {...register(`leadSelectors.${idx}.value` as const)} />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => leadSelectors.remove(idx)}
                  >
                    Usuń
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                onClick={() => leadSelectors.append({ value: '' })}
              >
                Dodaj selektor
              </Button>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              {isEdit && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRestoreOriginal}
                >
                  Przywróć oryginalne wartości
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isEdit ? 'Zapisz zmiany' : 'Dodaj źródło'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
