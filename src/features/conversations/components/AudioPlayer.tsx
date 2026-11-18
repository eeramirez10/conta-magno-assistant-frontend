import { useEffect, useRef, useState } from 'react'
import { Box, Button, CircularProgress, IconButton, Slider, ThemeProvider, Typography } from '@mui/material'
import PlayArrow from '@mui/icons-material/PlayArrow'
import Pause from '@mui/icons-material/Pause'
import { chatTheme } from '../../../shared/notifications/chatTheme'
import { useToast } from '../../../shared/notifications/toastContext'
const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
export function AudioPlayer({ src }: { src: string }) {
  const audio = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [time, setTime] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [waiting, setWaiting] = useState(false)
  const notify = useToast()
  useEffect(() => { const element = audio.current; return () => { element?.pause() } }, [src])
  return <ThemeProvider theme={chatTheme}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', minWidth: 0, py: 1 }}>
    <audio ref={audio} src={src} preload="metadata" onLoadedMetadata={e => { const value=e.currentTarget.duration; setDuration(Number.isFinite(value)?value:0);setTime(0) }} onTimeUpdate={e => setTime(e.currentTarget.currentTime)} onPlay={() => setPlaying(true)} onPause={() => {setPlaying(false);setWaiting(false)}} onEnded={() => {setPlaying(false);setTime(0);if(audio.current)audio.current.currentTime=0}} onWaiting={() => setWaiting(true)} onCanPlay={() => setWaiting(false)} onError={() => {setWaiting(false);notify('No se pudo reproducir el audio. Reintenta la descarga.')}} />
    <IconButton aria-label={playing ? 'Pausar audio' : 'Reproducir audio'} color="primary" onClick={() => { const element=audio.current;if(!element)return;if(playing)element.pause();else void element.play().catch((error: unknown)=>{if(!(error instanceof DOMException && error.name==='AbortError'))notify('No se pudo reproducir el audio. Intenta nuevamente.')}) }}>{waiting ? <CircularProgress size={24} /> : playing ? <Pause /> : <PlayArrow />}</IconButton>
    <Box sx={{ flex: 1, minWidth: 60 }}><Slider aria-label="Posición del audio" size="small" min={0} max={duration || 1} value={Math.min(time,duration || 1)} disabled={!duration} getAriaValueText={clock} onChange={(_, value) => { const next=Number(value);if(audio.current)audio.current.currentTime=next;setTime(next) }} /><Typography variant="caption" color="text.secondary">{clock(time)} / {clock(duration)}</Typography></Box>
    <Button size="small" aria-label={`Velocidad ${speed}, cambiar velocidad`} sx={{ minWidth: 42 }} onClick={() => {const next=speed===1?1.5:speed===1.5?2:1;setSpeed(next);if(audio.current)audio.current.playbackRate=next}}>{speed}×</Button>
  </Box></ThemeProvider>
}
