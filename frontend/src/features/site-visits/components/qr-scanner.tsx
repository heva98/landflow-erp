import jsQR from 'jsqr'
import { useEffect, useRef, useState } from 'react'

/**
 * Reads a QR code from the device camera and reports its raw decoded text.
 * The booking's QR encodes a bare token (no URL — the check-in endpoint
 * looks bookings up by token), so whatever this detects is passed straight
 * through unmodified.
 */
export function QrScanner({ onDetect, active }: { onDetect: (value: string) => void; active: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const onDetectRef = useRef(onDetect)
  onDetectRef.current = onDetect
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!active) return

    let cancelled = false
    let frameId = 0
    let stream: MediaStream | null = null

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        const video = videoRef.current
        if (video) {
          video.srcObject = stream
          await video.play()
        }
        tick()
      } catch {
        setError('Could not access the camera. Enter the code manually below instead.')
      }
    }

    function tick() {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const context = canvas.getContext('2d')
        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height)
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(imageData.data, imageData.width, imageData.height)
          if (code?.data) {
            onDetectRef.current(code.data)
            return
          }
        }
      }
      frameId = requestAnimationFrame(tick)
    }

    start()

    return () => {
      cancelled = true
      cancelAnimationFrame(frameId)
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [active])

  if (!active) return null

  return (
    <div className="relative overflow-hidden rounded-lg bg-black">
      <video ref={videoRef} className="aspect-video w-full object-cover" muted playsInline />
      <canvas ref={canvasRef} className="hidden" />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-4 text-center text-sm text-white">
          {error}
        </div>
      )}
    </div>
  )
}
