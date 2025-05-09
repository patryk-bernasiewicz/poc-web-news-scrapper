'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Input } from '@/components/ui/Input';
import { Separator } from '@/components/ui/Separator';

import { sourceFormSchema } from './source-form.schema';
import {
  SourceFormValues,
  SourceFormValuesInput,
  fromStringFields,
  toStringFields,
} from './source-form.types';

interface SourceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: SourceFormValuesInput;
  onSubmit: (values: SourceFormValuesInput) => Promise<void>;
  isEdit?: boolean;
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

export function SourceFormModal({
  open,
  onOpenChange,
  initialValues,
  onSubmit,
  isEdit,
}: SourceFormModalProps) {
  const [originalValues] = useState<SourceFormValuesInput | undefined>(
    initialValues,
  );
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting, errors },
    getValues,
  } = useForm<SourceFormValues>({
    resolver: zodResolver(sourceFormSchema),
    mode: 'onChange',
    reValidateMode: 'onBlur',
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

  // Keywords as tags (prosty input z przecinkiem)
  const keywords = watch('keywords');
  const [keywordInput, setKeywordInput] = useState('');

  function handleAddKeyword(e: KeyboardEvent<HTMLInputElement>) {
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

  // Nowe inputy tagów dla pozostałych pól
  const dateStrings = watch('dateStrings');
  const [dateStringInput, setDateStringInput] = useState('');
  function handleAddDateString(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === ',' && dateStringInput.trim()) {
      setValue('dateStrings', [
        ...dateStrings,
        { value: dateStringInput.trim() },
      ]);
      setDateStringInput('');
      e.preventDefault();
    }
  }
  function handleRemoveDateString(idx: number) {
    setValue(
      'dateStrings',
      dateStrings.filter((_, i) => i !== idx),
    );
  }

  const containerSelectors = watch('containerSelectors');
  const [containerSelectorInput, setContainerSelectorInput] = useState('');
  function handleAddContainerSelector(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === ',' && containerSelectorInput.trim()) {
      setValue('containerSelectors', [
        ...containerSelectors,
        { value: containerSelectorInput.trim() },
      ]);
      setContainerSelectorInput('');
      e.preventDefault();
    }
  }
  function handleRemoveContainerSelector(idx: number) {
    setValue(
      'containerSelectors',
      containerSelectors.filter((_, i) => i !== idx),
    );
  }

  const titleSelectors = watch('titleSelectors');
  const [titleSelectorInput, setTitleSelectorInput] = useState('');
  function handleAddTitleSelector(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === ',' && titleSelectorInput.trim()) {
      setValue('titleSelectors', [
        ...titleSelectors,
        { value: titleSelectorInput.trim() },
      ]);
      setTitleSelectorInput('');
      e.preventDefault();
    }
  }
  function handleRemoveTitleSelector(idx: number) {
    setValue(
      'titleSelectors',
      titleSelectors.filter((_, i) => i !== idx),
    );
  }

  const dateSelectors = watch('dateSelectors');
  const [dateSelectorInput, setDateSelectorInput] = useState('');
  function handleAddDateSelector(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === ',' && dateSelectorInput.trim()) {
      setValue('dateSelectors', [
        ...dateSelectors,
        { value: dateSelectorInput.trim() },
      ]);
      setDateSelectorInput('');
      e.preventDefault();
    }
  }
  function handleRemoveDateSelector(idx: number) {
    setValue(
      'dateSelectors',
      dateSelectors.filter((_, i) => i !== idx),
    );
  }

  const leadSelectors = watch('leadSelectors');
  const [leadSelectorInput, setLeadSelectorInput] = useState('');
  function handleAddLeadSelector(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === ',' && leadSelectorInput.trim()) {
      setValue('leadSelectors', [
        ...leadSelectors,
        { value: leadSelectorInput.trim() },
      ]);
      setLeadSelectorInput('');
      e.preventDefault();
    }
  }
  function handleRemoveLeadSelector(idx: number) {
    setValue(
      'leadSelectors',
      leadSelectors.filter((_, i) => i !== idx),
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

  const [showConfirmClose, setShowConfirmClose] = useState(false);

  // Funkcja porównująca aktualne wartości z initialValues
  function isDirty() {
    const current = getValues();
    const initial: SourceFormValuesInput = initialValues ?? {
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
    // Porównaj wszystkie pola formularza
    return (
      current.name !== initial.name ||
      current.url !== initial.url ||
      current.is_active !== initial.is_active ||
      JSON.stringify(current.keywords) !== JSON.stringify(initial.keywords) ||
      JSON.stringify(current.dateStrings) !==
        JSON.stringify(toStringFields(initial.dateStrings)) ||
      JSON.stringify(current.containerSelectors) !==
        JSON.stringify(toStringFields(initial.containerSelectors)) ||
      JSON.stringify(current.titleSelectors) !==
        JSON.stringify(toStringFields(initial.titleSelectors)) ||
      JSON.stringify(current.dateSelectors) !==
        JSON.stringify(toStringFields(initial.dateSelectors)) ||
      JSON.stringify(current.leadSelectors) !==
        JSON.stringify(toStringFields(initial.leadSelectors))
    );
  }

  // Przechwytuj próbę zamknięcia modala
  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isDirty()) {
      setShowConfirmClose(true);
    } else {
      onOpenChange(nextOpen);
    }
  }

  function handleConfirmClose() {
    setShowConfirmClose(false);
    reset({
      ...initialValues,
      dateStrings: toStringFields(initialValues?.dateStrings),
      containerSelectors: toStringFields(initialValues?.containerSelectors),
      titleSelectors: toStringFields(initialValues?.titleSelectors),
      dateSelectors: toStringFields(initialValues?.dateSelectors),
      leadSelectors: toStringFields(initialValues?.leadSelectors),
    });
    onOpenChange(false);
  }

  function handleCancelClose() {
    setShowConfirmClose(false);
  }

  return (
    <>
      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Dialog.Content className="border border-border fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background shadow-lg max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-muted-foreground/40 pb-0">
            <Dialog.Title className="text-lg font-bold mb-4 px-6 pt-6">
              {isEdit ? 'Edytuj źródło' : 'Dodaj źródło'}
            </Dialog.Title>
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-4 px-6 pb-6 pt-2"
            >
              <div>
                <label className="block font-medium">Nazwa</label>
                <Input
                  {...register('name', { required: true })}
                  description="Nazwa źródła. Nie wpływa na wydobywanie informacji."
                  error={errors.name?.message as string}
                />
              </div>
              <div>
                <label className="block font-medium">URL</label>
                <Input
                  {...register('url', { required: true })}
                  description="Wymagane. Podaj adres strony internetowej, z której mają być wydobywane linki do artykułów. Powinna ona wyświetlać np. listę newsów."
                  error={errors.url?.message as string}
                />
              </div>
              <Separator />
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
                  error={errors.keywords?.message as string}
                />
              </div>
              <div>
                <label className="block font-medium">
                  Ciągi znaków do rozpoznania daty publikacji (opcjonalnie)
                </label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {dateStrings.map((ds, idx) => (
                    <Badge
                      key={ds.value + idx}
                      className="flex items-center gap-1"
                    >
                      {ds.value}
                      <button
                        type="button"
                        onClick={() => handleRemoveDateString(idx)}
                        className="ml-1 text-xs"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  value={dateStringInput}
                  onChange={(e) => setDateStringInput(e.target.value)}
                  onKeyDown={handleAddDateString}
                  placeholder="Dodaj selektor, oddziel przecinkiem"
                  description="Po tych ciągach znaków rozpoznamy na tej stronie, że ten artykuł należy wydobyć. Użyj, jeśli na stronie data publikacji jest w niestandardowym formacie, np. zamiast daty wyświetlone jest słowo 'dzisiaj' albo zwrot 'X minut temu'."
                />
              </div>
              <Separator />
              <div>
                <label className="block font-medium">
                  Selektor kontenera artykułu
                </label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {containerSelectors.map((cs, idx) => (
                    <Badge
                      key={cs.value + idx}
                      className="flex items-center gap-1"
                    >
                      {cs.value}
                      <button
                        type="button"
                        onClick={() => handleRemoveContainerSelector(idx)}
                        className="ml-1 text-xs cursor-pointer"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  value={containerSelectorInput}
                  onChange={(e) => setContainerSelectorInput(e.target.value)}
                  onKeyDown={handleAddContainerSelector}
                  placeholder="Dodaj selektor, oddziel przecinkiem"
                  description="Po tych ciągach znaków scrapper rozpozna kontener (element HTML), w treści którego znajduje się artykuł (nagłówek, data publikacji, treść leadu)."
                  error={errors.containerSelectors?.message as string}
                />
              </div>
              <div>
                <label className="block font-medium">
                  Selektory kontenera tytułu
                </label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {titleSelectors.map((ts, idx) => (
                    <Badge
                      key={ts.value + idx}
                      className="flex items-center gap-1"
                    >
                      {ts.value}
                      <button
                        type="button"
                        onClick={() => handleRemoveTitleSelector(idx)}
                        className="ml-1 text-xs cursor-pointer"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  value={titleSelectorInput}
                  onChange={(e) => setTitleSelectorInput(e.target.value)}
                  onKeyDown={handleAddTitleSelector}
                  placeholder="Dodaj selektor, oddziel przecinkiem"
                  error={errors.titleSelectors?.message as string}
                />
              </div>
              <div>
                <label className="block font-medium">
                  Selektory kontenera daty publikacji
                </label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {dateSelectors.map((ds, idx) => (
                    <Badge
                      key={ds.value + idx}
                      className="flex items-center gap-1"
                    >
                      {ds.value}
                      <button
                        type="button"
                        onClick={() => handleRemoveDateSelector(idx)}
                        className="ml-1 text-xs cursor-pointer"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  value={dateSelectorInput}
                  onChange={(e) => setDateSelectorInput(e.target.value)}
                  onKeyDown={handleAddDateSelector}
                  placeholder="Dodaj selektor, oddziel przecinkiem"
                  error={errors.dateSelectors?.message as string}
                />
              </div>
              <div>
                <label className="block font-medium">
                  Selektory kontenera leadu
                </label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {leadSelectors.map((ls, idx) => (
                    <Badge
                      key={ls.value + idx}
                      className="flex items-center gap-1"
                    >
                      {ls.value}
                      <button
                        type="button"
                        onClick={() => handleRemoveLeadSelector(idx)}
                        className="ml-1 text-xs cursor-pointer"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  value={leadSelectorInput}
                  onChange={(e) => setLeadSelectorInput(e.target.value)}
                  onKeyDown={handleAddLeadSelector}
                  placeholder="Dodaj selektor, oddziel przecinkiem"
                  error={errors.leadSelectors?.message as string}
                />
              </div>
            </form>
            <div className="flex gap-2 justify-end mt-4 sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border py-4 px-6 w-full z-10 mx-0">
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
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <ConfirmDialog
        open={showConfirmClose}
        onOpenChange={(open) => !open && handleCancelClose()}
        onConfirm={handleConfirmClose}
        title="Masz niezapisane zmiany"
        description="Czy na pewno chcesz zamknąć formularz? Wszystkie niezapisane zmiany zostaną utracone."
        confirmLabel="Zamknij bez zapisu"
        cancelLabel="Anuluj"
        confirmVariant="destructive"
      />
    </>
  );
}
