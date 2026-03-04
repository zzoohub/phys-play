export async function detectWebGPU(): Promise<boolean> {
  if (typeof navigator === 'undefined') return false
  if (!('gpu' in navigator)) return false
  try {
    const adapter = await (navigator as Navigator & { gpu: GPU }).gpu.requestAdapter()
    return adapter !== null
  } catch {
    return false
  }
}
