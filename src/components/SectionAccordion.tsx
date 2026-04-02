import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import type { ReactNode } from 'react'

interface SectionAccordionProps {
  title: string
  children: ReactNode
  defaultExpanded?: boolean
}

export function SectionAccordion({
  title,
  children,
  defaultExpanded = false,
}: SectionAccordionProps): JSX.Element {
  return (
    <Accordion defaultExpanded={defaultExpanded}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`section-${title.toLowerCase().replace(/\s+/g, '-')}-content`}
        id={`section-${title.toLowerCase().replace(/\s+/g, '-')}-header`}
      >
        <Typography variant="subtitle1" component="span">
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  )
}
