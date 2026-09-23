import { isAxiosError } from 'axios'
import { Camera, CheckCircle2, ScanLine, XCircle } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { QrScanner } from '../components/qr-scanner'
import { useCheckInMutation } from '../hooks/use-site-visits'
import type { SiteVisitBooking } from '../types'

export function CheckInPage() {
  const [cameraActive, setCameraActive] = useState(false)
  const [manualToken, setManualToken] = useState('')
  const [result, setResult] = useState<SiteVisitBooking | null>(null)
  const [error, setError] = useState<string | null>(null)
  const checkIn = useCheckInMutation()

  async function submitToken(token: string) {
    if (!token.trim()) return
    setError(null)
    setResult(null)
    try {
      const booking = await checkIn.mutateAsync(token.trim())
      setResult(booking)
      setCameraActive(false)
      setManualToken('')
    } catch (err) {
      const detail = isAxiosError(err) ? (err.response?.data?.detail ?? err.response?.data?.token) : null
      setError(typeof detail === 'string' ? detail : 'Check-in failed. Please try again.')
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Site visit check-in</h1>
        <p className="text-sm text-muted-foreground">Scan an attendee's QR code, or enter the code by hand.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scan QR code</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {cameraActive ? (
            <>
              <QrScanner active={cameraActive} onDetect={submitToken} />
              <Button variant="outline" onClick={() => setCameraActive(false)}>
                Stop camera
              </Button>
            </>
          ) : (
            <Button onClick={() => setCameraActive(true)}>
              <Camera /> Start camera
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Or enter the code</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              submitToken(manualToken)
            }}
          >
            <div className="flex-1">
              <Label htmlFor="manual-token" className="sr-only">
                QR token
              </Label>
              <Input
                id="manual-token"
                placeholder="Paste or type the check-in code"
                value={manualToken}
                onChange={(event) => setManualToken(event.target.value)}
              />
            </div>
            <Button type="submit" disabled={checkIn.isPending || !manualToken.trim()}>
              <ScanLine /> Check in
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="flex items-start gap-3 py-4">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent" />
            <div className="text-sm">
              <p className="font-medium text-foreground">{result.lead_name} checked in</p>
              <p className="text-muted-foreground">
                {result.guest_count > 1 ? `${result.guest_count} guests · ` : ''}
                {new Date(result.checked_in_at as string).toLocaleTimeString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="flex items-start gap-3 py-4">
            <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
            <p className="text-sm text-foreground">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
