'use server';

import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

import { SourceFormValues, StringField } from '../components/source-form.types';

export async function upsertSource(
  values: SourceFormValues,
  sourceId?: bigint | number | string,
) {
  console.log('========== [upsertSource]', values);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  // Keywords: znajdź istniejące lub utwórz nowe
  const keywordRecords = await Promise.all(
    values.keywords.map(async (name) => {
      let keyword = await prisma.keyword.findFirst({ where: { name } });
      if (!keyword) {
        keyword = await prisma.keyword.create({
          data: {
            name,
            slug: name.toLowerCase().replace(/\s+/g, '-'),
            is_active: true,
          },
        });
      }
      return keyword;
    }),
  );

  function fromStringFields(arr?: StringField[]): string[] {
    return arr?.map((v) => v.value) || [];
  }

  function filterArray(arr?: (string | undefined | null)[]): string[] {
    return (arr ?? []).filter((v): v is string => !!v && v.trim() !== '');
  }

  // Konwersja dynamicznych pól na string[] i filtracja undefined/pustych
  const mappedValues = {
    ...values,
    dateStrings: filterArray(fromStringFields(values.dateStrings)),
    containerSelectors: filterArray(
      fromStringFields(values.containerSelectors),
    ),
    titleSelectors: filterArray(fromStringFields(values.titleSelectors)),
    dateSelectors: filterArray(fromStringFields(values.dateSelectors)),
    leadSelectors: filterArray(fromStringFields(values.leadSelectors)),
  };

  let source;
  if (sourceId) {
    // Edycja
    source = await prisma.source.update({
      where: { id: BigInt(sourceId) },
      data: {
        name: mappedValues.name,
        url: mappedValues.url,
        is_active: mappedValues.is_active,
        dateStrings: mappedValues.dateStrings,
        containerSelectors: mappedValues.containerSelectors,
        titleSelectors: mappedValues.titleSelectors,
        dateSelectors: mappedValues.dateSelectors,
        leadSelectors: mappedValues.leadSelectors,
        // Najpierw usuwamy stare powiązania, potem dodajemy nowe
        sourceKeywords: {
          deleteMany: {},
          create: keywordRecords.map((k) => ({ keywordId: k.id })),
        },
      },
    });
  } else {
    // Dodawanie
    source = await prisma.source.create({
      data: {
        name: mappedValues.name,
        url: mappedValues.url,
        is_active: mappedValues.is_active,
        dateStrings: mappedValues.dateStrings,
        containerSelectors: mappedValues.containerSelectors,
        titleSelectors: mappedValues.titleSelectors,
        dateSelectors: mappedValues.dateSelectors,
        leadSelectors: mappedValues.leadSelectors,
        sourceKeywords: {
          create: keywordRecords.map((k) => ({ keywordId: k.id })),
        },
      },
    });
  }

  return { success: true, source };
}
