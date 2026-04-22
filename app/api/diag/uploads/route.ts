import { NextResponse } from 'next/server'
import { mkdir, writeFile, readFile, unlink, access } from 'fs/promises'
import { constants } from 'fs'
import { join } from 'path'
import { getUploadRootCandidates, getUploadsRootDir } from '@/lib/uploadsStorage'

export const dynamic = 'force-dynamic'

export async function GET() {
  const selectedRoot = getUploadsRootDir()
  const candidateRoots = getUploadRootCandidates()
  const probeFile = `diag-probe-${Date.now()}.txt`
  const probePath = join(selectedRoot, probeFile)

  try {
    await mkdir(selectedRoot, { recursive: true })
    await writeFile(probePath, `probe:${new Date().toISOString()}`, 'utf8')
    await access(probePath, constants.R_OK)
    const readBack = await readFile(probePath, 'utf8')
    await unlink(probePath).catch(() => {})

    return NextResponse.json({
      ok: true,
      uploads: {
        selectedRoot,
        candidateRoots,
        probeWriteReadOk: true,
        readBackSample: readBack.slice(0, 32),
      },
    })
  } catch (error: any) {
    await unlink(probePath).catch(() => {})
    return NextResponse.json(
      {
        ok: false,
        uploads: {
          selectedRoot,
          candidateRoots,
          probeWriteReadOk: false,
          error: error?.message || 'Uploads diagnostic failed',
        },
      },
      { status: 500 }
    )
  }
}
