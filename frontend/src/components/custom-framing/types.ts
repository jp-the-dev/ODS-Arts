// Shared types for the Custom Framing Configurator wizard.
// Kept separate from CustomFramingWizard.tsx to avoid circular imports.

export interface FramingConfig {
  artwork: {
    file: File | null
    previewUrl: string | null
    provided: boolean
  }
  size: {
    preset: string | null
    widthCm: number | null
    heightCm: number | null
    unit: 'cm' | 'in'
  }
  mat: {
    style: 'none' | 'single' | 'double' | 'museum'
    colour: string
    colourHex: string
    colourLabel: string
    width: 'narrow' | 'standard' | 'wide'
  }
  frame: {
    material: 'walnut' | 'oak' | 'brass' | 'black' | null
    finish: string | null
    profile: 'classic' | 'slim' | 'box' | 'ledge' | null
  }
}

export const INITIAL_FRAMING_CONFIG: FramingConfig = {
  artwork: { file: null, previewUrl: null, provided: false },
  size: { preset: null, widthCm: null, heightCm: null, unit: 'in' },
  mat: { style: 'single', colour: 'ivory', colourHex: '#F5F0E8', colourLabel: 'Ivory', width: 'standard' },
  frame: { material: null, finish: null, profile: null },
}
