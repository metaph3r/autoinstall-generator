# Spezifikation: Webanwendung zur formularbasierten Erstellung einer `autoinstall.yaml`

## Ziel der Anwendung
Die Webanwendung ermöglicht die formularbasierte Erstellung einer vollständigen `autoinstall.yaml` für Ubuntu‑Installationen.  
Alle Felder der offiziellen Autoinstall‑Referenz werden über UI‑Komponenten abgebildet.  
Die YAML‑Datei wird live generiert und kann exportiert oder kopiert werden.

Weitere Informationen:

[Autoinstall configuration reference manual](https://canonical-subiquity.readthedocs-hosted.com/en/latest/reference/autoinstall-reference.html)
[Autoinstall schema](https://canonical-subiquity.readthedocs-hosted.com/en/latest/reference/autoinstall-schema.html)
[Autoinstall Validation](https://canonical-subiquity.readthedocs-hosted.com/en/latest/howto/autoinstall-validation.html)

---

## Technische Basis
- **Framework:** React 18+
- **Sprache:** TypeScript
- **UI‑Bibliothek:** MUI 6
- **State Management:** React Context + Reducer
- **Formularhandling:** React Hook Form
- **Validierung:** Zod
- **YAML‑Serialisierung:** `yaml` npm‑Package
- **Syntax‑Highlighting:** PrismJS oder Highlight.js

---

## Seiten & Navigation

### Startseite
- Kurze Einführung
- Button „Neues Projekt starten“

### Formular‑Editor
- Mehrseitiges Formular (Tabs oder Stepper)
- YAML‑Preview rechts (Desktop) oder unten (Mobile)
- Buttons:
  - Exportieren (Download)
  - In Zwischenablage kopieren
  - Reset

### Optional: Exportseite
- Download‑Optionen
- Hinweise zur Nutzung der Datei

### Navigation
- MUI AppBar mit Titel
- Optional: GitHub‑Link, Spracheinstellung, Dark‑Mode‑Toggle

---

## Formularstruktur (entspricht der Autoinstall‑Spezifikation)

### Top-Level: `autoinstall`
- version (integer, required)
- interactive-sections (string[])
- early-commands (string[])
- late-commands (string[])
- error-commands (string[])

### Locale & Keyboard
- locale (string)
- keyboard.layout
- keyboard.variant
- keyboard.toggle

### Refresh Installer
- refresh-installer.update (boolean)
- refresh-installer.channel (string)

### Source
- source.search_drivers (boolean)
- source.id (string)

### Network (Netplan)
- YAML‑Editor oder Formular für:
  - version
  - ethernets
  - bridges
  - wifis

### Proxy
- proxy (string)

### APT
- preserve_sources_list (boolean)
- mirror-selection.primary (list)
- fallback (enum: abort | continue-anyway | offline-install)
- geoip (boolean)
- sources (mapping)

### Storage
Zwei Modi:
1. **Layout‑Modus** (strukturiertes Formular)
   - layout.name: Radio-Group oder Select mit drei Optionen (lvm [Standard], direct, zfs)
     - Nur eines der drei offiziell unterstützten Layouts kann gewählt werden
     - Erzeugt: `autoinstall.storage.layout.name: lvm|direct|zfs`
   - Hinweis: Für komplexere Konfigurationen wechselt der Nutzer in den Action‑Modus

2. **Action‑Modus** (YAML‑Editor Escape Hatch)
   - Liste von Aktionen (disk, partition, lvm, raid …)
   - YAML‑Editor (MUI Dialog) empfohlen

### Identity
- realname
- username
- hostname
- password (encrypted)
- groups

### Active Directory
- admin-name
- domain-name

### Ubuntu Pro
- token

### SSH
- install-server (boolean)
- authorized-keys (string[])
- allow-pw (boolean)

### Codecs
- install (boolean)

### Drivers
- install (boolean)

### OEM
- install (boolean | "auto", **required**)

### Snaps
Liste von Objekten:
- name
- channel
- classic (boolean)

### Debconf Selections
- Multiline‑Textfeld

### Packages
- packages (string[])

### Kernel
- package **oder** flavor (genau eines, gegenseitig ausschließend)

### Kernel Crash Dumps
- enabled (boolean | null)

### Timezone
- timezone (string)

### Updates
- updates (enum: security | all)

### Shutdown
- shutdown (enum: reboot | poweroff)

### Reporting
Map von benannten Handlern (beliebige Schlüsselnamen), jeder Handler:
- type (string, **required**)
- weitere Felder abhängig vom Typ (z. B. endpoint für webhook)

Beispiel:
```yaml
reporting:
  my-handler:
    type: webhook
    endpoint: https://example.com/hook
```

### User-Data
- YAML‑Editor (cloud-init)

### Zdevs
Liste von Objekten:
- id
- enabled

---

## UI‑Design

### Layout
- Zweispaltig (Formular links, YAML‑Preview rechts)
- Responsive: YAML‑Preview unterhalb auf mobilen Geräten

### Komponenten
- TextField
- Select
- Switch
- Checkbox
- Tabs oder Stepper
- Accordion für komplexe Abschnitte
- Table für Listen (Snaps, Packages)
- Dialog für YAML‑Editor

### YAML‑Preview
- Live‑Update bei jeder Eingabe
- Syntax‑Highlighting
- Buttons:
  - Kopieren
  - Download

---

## Datenmodell (TypeScript)

```ts
interface AutoinstallConfig {
  version: number;
  interactiveSections: string[];
  earlyCommands: string[];
  lateCommands: string[];
  errorCommands: string[];
  locale?: string;
  keyboard?: KeyboardConfig;
  refreshInstaller?: RefreshInstallerConfig;
  source?: SourceConfig;
  network?: any;
  proxy?: string;
  apt?: AptConfig;
  storage?: StorageConfig;
  identity?: IdentityConfig;
  activeDirectory?: ActiveDirectoryConfig;
  ubuntuPro?: UbuntuProConfig;
  ssh?: SSHConfig;
  codecs?: { install: boolean };
  drivers?: { install: boolean };
  oem?: { install: boolean | "auto" };
  snaps?: SnapConfig[];
  debconfSelections?: string;
  packages?: string[];
  kernel?: KernelConfig;
  kernelCrashDumps?: { enabled: boolean | null };
  timezone?: string;
  updates?: "security" | "all";
  shutdown?: "reboot" | "poweroff";
  reporting?: ReportingConfig;
  userData?: any;
  zdevs?: ZDevConfig[];
}
```

---

## JSON Schema

```json
{
    "type": "object",
    "properties": {
        "version": {
            "type": "integer",
            "minimum": 1,
            "maximum": 1
        },
        "interactive-sections": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        "early-commands": {
            "type": "array",
            "items": {
                "type": [
                    "string",
                    "array"
                ],
                "items": {
                    "type": "string"
                }
            }
        },
        "reporting": {
            "type": "object",
            "additionalProperties": {
                "type": "object",
                "properties": {
                    "type": {
                        "type": "string"
                    }
                },
                "required": [
                    "type"
                ],
                "additionalProperties": true
            }
        },
        "error-commands": {
            "type": "array",
            "items": {
                "type": [
                    "string",
                    "array"
                ],
                "items": {
                    "type": "string"
                }
            }
        },
        "user-data": {
            "type": "object"
        },
        "packages": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        "debconf-selections": {
            "type": "string"
        },
        "locale": {
            "type": "string"
        },
        "refresh-installer": {
            "type": "object",
            "properties": {
                "update": {
                    "type": "boolean"
                },
                "channel": {
                    "type": "string"
                }
            },
            "additionalProperties": false
        },
        "kernel": {
            "type": "object",
            "properties": {
                "package": {
                    "type": "string"
                },
                "flavor": {
                    "type": "string"
                }
            },
            "oneOf": [
                {
                    "type": "object",
                    "required": [
                        "package"
                    ]
                },
                {
                    "type": "object",
                    "required": [
                        "flavor"
                    ]
                }
            ]
        },
        "kernel-crash-dumps": {
            "type": "object",
            "properties": {
                "enabled": {
                    "type": [
                        "boolean",
                        "null"
                    ]
                }
            },
            "required": [
                "enabled"
            ],
            "additionalProperties": false
        },
        "keyboard": {
            "type": "object",
            "properties": {
                "layout": {
                    "type": "string"
                },
                "variant": {
                    "type": "string"
                },
                "toggle": {
                    "type": [
                        "string",
                        "null"
                    ]
                }
            },
            "required": [
                "layout"
            ],
            "additionalProperties": false
        },
        "zdevs": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "string"
                    },
                    "enabled": {
                        "type": "boolean"
                    }
                }
            }
        },
        "source": {
            "type": "object",
            "properties": {
                "search_drivers": {
                    "type": "boolean"
                },
                "id": {
                    "type": "string"
                }
            }
        },
        "network": {
            "oneOf": [
                {
                    "type": "object",
                    "properties": {
                        "version": {
                            "type": "integer",
                            "minimum": 2,
                            "maximum": 2
                        },
                        "ethernets": {
                            "type": "object",
                            "properties": {
                                "match": {
                                    "type": "object",
                                    "properties": {
                                        "name": {
                                            "type": "string"
                                        },
                                        "macaddress": {
                                            "type": "string"
                                        },
                                        "driver": {
                                            "type": "string"
                                        }
                                    },
                                    "additionalProperties": false
                                }
                            }
                        },
                        "wifis": {
                            "type": "object",
                            "properties": {
                                "match": {
                                    "type": "object",
                                    "properties": {
                                        "name": {
                                            "type": "string"
                                        },
                                        "macaddress": {
                                            "type": "string"
                                        },
                                        "driver": {
                                            "type": "string"
                                        }
                                    },
                                    "additionalProperties": false
                                }
                            }
                        },
                        "bridges": {
                            "type": "object"
                        },
                        "bonds": {
                            "type": "object"
                        },
                        "tunnels": {
                            "type": "object"
                        },
                        "vlans": {
                            "type": "object"
                        }
                    },
                    "required": [
                        "version"
                    ]
                },
                {
                    "type": "object",
                    "properties": {
                        "network": {
                            "type": "object",
                            "properties": {
                                "version": {
                                    "type": "integer",
                                    "minimum": 2,
                                    "maximum": 2
                                },
                                "ethernets": {
                                    "type": "object",
                                    "properties": {
                                        "match": {
                                            "type": "object",
                                            "properties": {
                                                "name": {
                                                    "type": "string"
                                                },
                                                "macaddress": {
                                                    "type": "string"
                                                },
                                                "driver": {
                                                    "type": "string"
                                                }
                                            },
                                            "additionalProperties": false
                                        }
                                    }
                                },
                                "wifis": {
                                    "type": "object",
                                    "properties": {
                                        "match": {
                                            "type": "object",
                                            "properties": {
                                                "name": {
                                                    "type": "string"
                                                },
                                                "macaddress": {
                                                    "type": "string"
                                                },
                                                "driver": {
                                                    "type": "string"
                                                }
                                            },
                                            "additionalProperties": false
                                        }
                                    }
                                },
                                "bridges": {
                                    "type": "object"
                                },
                                "bonds": {
                                    "type": "object"
                                },
                                "tunnels": {
                                    "type": "object"
                                },
                                "vlans": {
                                    "type": "object"
                                }
                            },
                            "required": [
                                "version"
                            ]
                        }
                    },
                    "required": [
                        "network"
                    ]
                }
            ]
        },
        "ubuntu-pro": {
            "type": "object",
            "properties": {
                "token": {
                    "type": "string",
                    "minLength": 24,
                    "maxLength": 30,
                    "pattern": "^C[1-9A-HJ-NP-Za-km-z]+$",
                    "description": "A valid token starts with a C and is followed by 23 to 29 Base58 characters.\nSee https://pkg.go.dev/github.com/btcsuite/btcutil/base58#CheckEncode"
                }
            }
        },
        "ubuntu-advantage": {
            "type": "object",
            "properties": {
                "token": {
                    "type": "string",
                    "minLength": 24,
                    "maxLength": 30,
                    "pattern": "^C[1-9A-HJ-NP-Za-km-z]+$",
                    "description": "A valid token starts with a C and is followed by 23 to 29 Base58 characters.\nSee https://pkg.go.dev/github.com/btcsuite/btcutil/base58#CheckEncode"
                }
            },
            "deprecated": true,
            "description": "Compatibility only - use ubuntu-pro instead"
        },
        "proxy": {
            "type": [
                "string",
                "null"
            ],
            "format": "uri"
        },
        "apt": {
            "type": "object",
            "properties": {
                "preserve_sources_list": {
                    "type": "boolean"
                },
                "primary": {
                    "type": "array"
                },
                "mirror-selection": {
                    "type": "object",
                    "properties": {
                        "primary": {
                            "type": "array",
                            "items": {
                                "anyOf": [
                                    {
                                        "type": "string",
                                        "const": "country-mirror"
                                    },
                                    {
                                        "type": "object",
                                        "properties": {
                                            "uri": {
                                                "type": "string"
                                            },
                                            "arches": {
                                                "type": "array",
                                                "items": {
                                                    "type": "string"
                                                }
                                            }
                                        },
                                        "required": [
                                            "uri"
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                },
                "geoip": {
                    "type": "boolean"
                },
                "sources": {
                    "type": "object"
                },
                "disable_components": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "enum": [
                            "universe",
                            "multiverse",
                            "restricted",
                            "contrib",
                            "non-free"
                        ]
                    }
                },
                "preferences": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "package": {
                                "type": "string"
                            },
                            "pin": {
                                "type": "string"
                            },
                            "pin-priority": {
                                "type": "integer"
                            }
                        },
                        "required": [
                            "package",
                            "pin",
                            "pin-priority"
                        ]
                    }
                },
                "fallback": {
                    "type": "string",
                    "enum": [
                        "abort",
                        "continue-anyway",
                        "offline-install"
                    ]
                }
            }
        },
        "storage": {
            "type": "object"
        },
        "identity": {
            "type": "object",
            "properties": {
                "realname": {
                    "type": "string"
                },
                "username": {
                    "type": "string"
                },
                "hostname": {
                    "type": "string"
                },
                "password": {
                    "type": "string"
                },
                "groups": {
                    "oneOf": [
                        {
                            "type": "array",
                            "items": {
                                "type": "string"
                            }
                        },
                        {
                            "type": "object",
                            "properties": {
                                "override": {
                                    "type": "array",
                                    "items": {
                                        "type": "string"
                                    }
                                },
                                "append": {
                                    "type": "array",
                                    "items": {
                                        "type": "string"
                                    }
                                }
                            }
                        }
                    ]
                }
            },
            "required": [
                "username",
                "hostname",
                "password"
            ],
            "additionalProperties": false
        },
        "ssh": {
            "type": "object",
            "properties": {
                "install-server": {
                    "type": "boolean"
                },
                "authorized-keys": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "allow-pw": {
                    "type": "boolean"
                }
            }
        },
        "snaps": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string"
                    },
                    "channel": {
                        "type": "string"
                    },
                    "classic": {
                        "type": "boolean"
                    }
                },
                "required": [
                    "name"
                ],
                "additionalProperties": false
            }
        },
        "active-directory": {
            "type": "object",
            "properties": {
                "admin-name": {
                    "type": "string"
                },
                "domain-name": {
                    "type": "string"
                }
            },
            "additionalProperties": false
        },
        "codecs": {
            "type": "object",
            "properties": {
                "install": {
                    "type": "boolean"
                }
            }
        },
        "drivers": {
            "type": "object",
            "properties": {
                "install": {
                    "type": "boolean"
                }
            }
        },
        "oem": {
            "type": "object",
            "properties": {
                "install": {
                    "oneOf": [
                        {
                            "type": "boolean"
                        },
                        {
                            "type": "string",
                            "const": "auto"
                        }
                    ]
                }
            },
            "required": [
                "install"
            ]
        },
        "timezone": {
            "type": "string"
        },
        "updates": {
            "type": "string",
            "enum": [
                "security",
                "all"
            ]
        },
        "late-commands": {
            "type": "array",
            "items": {
                "type": [
                    "string",
                    "array"
                ],
                "items": {
                    "type": "string"
                }
            }
        },
        "shutdown": {
            "type": "string",
            "enum": [
                "reboot",
                "poweroff"
            ]
        }
    },
    "required": [
        "version"
    ],
    "additionalProperties": true
}
```

---

## YAML‑Generierung
- YAML wird aus dem globalen State erzeugt
- Leere Felder werden nicht serialisiert

Struktur:

```yaml
autoinstall:
  version: 1
  identity:
    username: ubuntu
    password: "$6$..."
```

---

## Validierung
- Pflichtfelder
 - version
 - identity.username
 - identity.hostname
 - identity.password (wenn keine user-data)
- Zod‑Schemas pro Abschnitt
- Fehleranzeige im Formular

---

## Exportfunktionen
- Download als `autoinstall.yaml`
- Kopieren in Zwischenablage
- Optional: QR‑Code‑Export

---

## Erweiterbarkeit
- Mehrsprachigkeit (i18n)
- Import bestehender YAML‑Dateien
- Dark Mode

