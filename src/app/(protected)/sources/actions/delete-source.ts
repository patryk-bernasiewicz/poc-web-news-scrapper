'use server';

import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

export async function deleteSource(sourceId: bigint | number | string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  try {
    // Najpierw usuń powiązania SourceKeyword
    await prisma.sourceKeyword.deleteMany({
      where: { sourceId: BigInt(sourceId) },
    });
    // Usuń źródło
    await prisma.source.delete({ where: { id: BigInt(sourceId) } });
    return { success: true };
  } catch {
    return { error: 'Błąd podczas usuwania' };
  }
}
