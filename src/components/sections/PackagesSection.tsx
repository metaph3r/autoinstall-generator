import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { useAutoinstallConfig } from '../../context/AutoinstallConfigContext'

const schema = z.object({
  packagesText: z.string(),
})

type FormValues = z.infer<typeof schema>

export function PackagesSection(): JSX.Element {
  const { state, dispatch } = useAutoinstallConfig()
  const announcerRef = useRef<HTMLDivElement>(null)
  const prevCountRef = useRef<number>((state.packages ?? []).length)

  const { register, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      packagesText: (state.packages ?? []).join('\n'),
    },
    mode: 'onChange',
  })

  const watched = watch()

  useEffect(() => {
    const packages = watched.packagesText
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean)

    dispatch({
      type: 'SET_PACKAGES',
      payload: packages.length > 0 ? packages : undefined,
    })

    const newCount = packages.length
    if (newCount !== prevCountRef.current) {
      if (announcerRef.current) {
        announcerRef.current.textContent = `${newCount} package${newCount !== 1 ? 's' : ''} listed`
      }
      prevCountRef.current = newCount
    }
  }, [watched.packagesText, dispatch])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div
        ref={announcerRef}
        aria-live="polite"
        aria-atomic="true"
        style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}
      />
      <TextField
        label="Packages (one per line)"
        multiline
        minRows={4}
        fullWidth
        helperText="Enter one package name per line"
        inputProps={{ 'data-testid': 'packages-field' }}
        {...register('packagesText')}
      />
    </Box>
  )
}
