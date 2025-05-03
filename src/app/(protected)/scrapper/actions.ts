'use server';

import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export async function runPlaywrightScript(
  scriptPath: string,
  args: string[] = [],
) {
  console.log('Running script:', scriptPath);
  try {
    const { stdout, stderr } = await execFileAsync('npx', [
      'tsx',
      scriptPath,
      ...args,
    ]);
    console.log('Script output:', stdout, stderr);
    return { stdout, stderr };
  } catch (error) {
    console.log('Script error:', error);
    if (error instanceof Error) {
      return {
        error: error.message,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        stdout: (error as any).stdout,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        stderr: (error as any).stderr,
      };
    }
    return { error: 'Unknown error' };
  }
}
