import React from 'react'
import { UploadedFile } from '../types'
import { useWebRTC } from './WebRTCProvider'
import QRCode from 'react-qr-code'
import Loading from './Loading'
import { useUploaderChannelRenewal } from '../hooks/useUploaderChannelRenewal'
import StopButton from './StopButton'
import { useUploaderChannel } from '../hooks/useUploaderChannel'
import { useUploaderConnections } from '../hooks/useUploaderConnections'
import { CopyableInput } from './CopyableInput'
import { ConnectionListItem } from './ConnectionListItem'

const QR_CODE_SIZE = 128

export default function Uploader({
  files,
  password,
  renewInterval = 5000,
  onStop,
}: {
  files: UploadedFile[]
  password: string
  renewInterval?: number
  onStop: () => void
}): JSX.Element {
  const peer = useWebRTC()
  const { longSlug, shortSlug, longURL, shortURL } = useUploaderChannel(peer.id)
  useUploaderChannelRenewal(shortSlug, renewInterval)
  const connections = useUploaderConnections(peer, files, password)

  if (!longSlug || !shortSlug) {
    return <Loading text="Creating channel" />
  }

  return (
    <>
      <div className="flex w-full items-center">
        <div className="flex-none mr-4">
          <QRCode value={shortURL ?? ''} size={QR_CODE_SIZE} />
        </div>
        <div className="flex-auto flex flex-col justify-center space-y-2">
          <CopyableInput label="Long URL" value={longURL ?? ''} />
          <CopyableInput label="Short URL" value={shortURL ?? ''} />
        </div>
      </div>
      <div className="mt-6 pt-4 border-t border-gray-200 w-full">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-stone-400">
            {connections.length}{' '}
            {connections.length === 1 ? 'Downloader' : 'Downloaders'}
          </h2>
          <StopButton onClick={onStop} />
        </div>
        {connections.map((conn, i) => (
          <ConnectionListItem key={i} conn={conn} />
        ))}
      </div>
    </>
  )
}