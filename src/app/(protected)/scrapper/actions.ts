'use server';

import { scrapper_runs } from '@prisma/client';
import { execFile } from 'child_process';
import path from 'path';
import { promisify } from 'util';

import createRun from '@/utils/db/queries/createRun';
import setRunError from '@/utils/db/queries/setRunError';

const execFileAsync = promisify(execFile);

enum RunPlaywrightScriptStatus {
  RUNNING = 'Running',
  FINISHED = 'Finished',
  ERROR = 'Error',
}

type RunPlaywrightScriptResponse = {
  status: RunPlaywrightScriptStatus;
  stdout?: string;
  stderr?: string;
  error?: string;
};

export async function runPlaywrightScript(): Promise<RunPlaywrightScriptResponse> {
  const projectRoot = process.cwd();
  const tsxPath = path.join(
    projectRoot,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'tsx.cmd' : 'tsx',
  );
  const scriptPath = path.join(projectRoot, 'src', 'scripts', 'scrap-web.ts');

  console.log({ tsxPath, scriptPath });

  let run: scrapper_runs | undefined;
  try {
    run = await createRun();
    const { stdout, stderr } = await execFileAsync(tsxPath, [scriptPath], {
      shell: true,
    });
    console.log('Script output:', stdout, stderr);
    return { status: RunPlaywrightScriptStatus.FINISHED, stdout, stderr };
  } catch (error) {
    console.log('Script error:', error);
    if (run) {
      await setRunError(run.id);
    }

    if (error instanceof Error) {
      return {
        status: RunPlaywrightScriptStatus.ERROR,
        error: error.message,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        stdout: (error as any).stdout,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        stderr: (error as any).stderr,
      };
    }
    return { status: RunPlaywrightScriptStatus.ERROR, error: 'Unknown error' };
  }
}
