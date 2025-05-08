import { execFile } from 'child_process';
import path from 'path';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

export default async function execScrapper(
  runId: bigint,
): Promise<{ stdout: string; stderr: string }> {
  try {
    const projectRoot = process.cwd();
    const tsxPath = path.join(
      projectRoot,
      'node_modules',
      '.bin',
      process.platform === 'win32' ? 'tsx.cmd' : 'tsx',
    );
    const scriptPath = path.join(
      projectRoot,
      'src',
      'scrapper',
      'scrap-web.ts',
    );

    const { stdout, stderr } = await execFileAsync(
      tsxPath,
      [scriptPath, `--runId ${runId.toString()}`],
      { shell: true },
    );
    return { stdout, stderr };
  } catch (error: unknown) {
    type ExecError = { stdout?: string; stderr?: string; message?: string };
    if (error instanceof Error) {
      throw new Error(`Error executing scrapper 1: ${error.message}`);
    }
    if (
      typeof error === 'object' &&
      error !== null &&
      'stderr' in error &&
      typeof (error as ExecError).stderr === 'string' &&
      (error as ExecError).stderr
    ) {
      throw new Error(
        `Error executing scrapper 2: ${(error as ExecError).stderr}`,
      );
    }
    if (
      typeof error === 'object' &&
      error !== null &&
      'stdout' in error &&
      typeof (error as ExecError).stdout === 'string' &&
      (error as ExecError).stdout
    ) {
      throw new Error(
        `Error executing scrapper 3: ${(error as ExecError).stdout}`,
      );
    }
    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as ExecError).message === 'string'
    ) {
      throw new Error(
        `Error executing scrapper 4: ${(error as ExecError).message}`,
      );
    }
    throw new Error(`Error executing scrapper 5: ${JSON.stringify(error)}`);
  }
}
