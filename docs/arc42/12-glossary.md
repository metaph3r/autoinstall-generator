# §12 Glossary

**Generated:** 2026-03-31
**Sources:** `architecture/questions/resolved-questions.md` (Q-12), `SPEC.md` §Formularstruktur

---

This glossary defines domain terms used throughout the arc42 documentation and the application
itself. Terms are listed alphabetically.

---

## Autoinstall

Canonical's framework for unattended Ubuntu installations, implemented in the Subiquity installer.
Autoinstall reads a YAML configuration file (`autoinstall.yaml`) that specifies all installation
parameters — disk layout, identity, network, packages, and more — and performs the installation
without user interaction.

Autoinstall replaces the older `preseed` mechanism used by the Debian installer.

(Source: Canonical Autoinstall reference, linked in `SPEC.md` §Ziel der Anwendung; Q-12, resolved)

---

## `autoinstall.yaml`

The YAML configuration file consumed by Ubuntu's Subiquity installer to perform an unattended
(hands-free) operating system installation. The file must be accessible to the installer at boot
time (typically via a cloud-init datasource, a USB drive, or a pre-seeded ISO).

This application generates `autoinstall.yaml` files. The generated file has the top-level
structure:

```yaml
autoinstall:
  version: 1
  identity:
    username: ubuntu
    password: "$6$..."
  # ... additional sections
```

(Source: `SPEC.md` §Ziel der Anwendung, §YAML-Generierung; Q-12, resolved)

---

## cloud-init

An industry-standard, multi-distribution method for cross-platform cloud instance initialization.
cloud-init runs on first boot and can configure users, install packages, write files, run commands,
and perform other provisioning tasks.

In Ubuntu Autoinstall, the `user-data` section accepts cloud-init configuration. In this
application, `user-data` is scoped to the cloud-init **`users` module**, which configures the
user accounts created during installation (`name`, `gecos`, `passwd`, `groups`, `shell`,
`lock_passwd`). Other cloud-init modules are out of scope for v1. (ADR-001)

(Source: `SPEC.md` §User-Data; Q-12, resolved; ADR-001 §Neutral consequences)

---

## Debconf

Debian's configuration database and pre-seeding mechanism for package configuration. Debconf
allows package maintainer scripts to ask the user configuration questions; pre-seeding answers
to these questions enables fully unattended package configuration.

In Autoinstall, the `debconf-selections` section accepts a multi-line string of debconf answers
in the format used by `debconf-set-selections`. The application exposes this as a `TextField`
with `multiline` enabled. (SPEC.md, §Debconf Selections)

(Source: `SPEC.md` §Formularstruktur — Debconf Selections; Q-12, resolved)

---

## LUKS

**Linux Unified Key Setup** — the standard disk encryption specification and reference
implementation on Linux. LUKS provides a platform-independent standard for passphrase-protected
disk encryption.

In the Autoinstall `storage` section, enabling LUKS for a partition encrypts the block device
with a user-supplied passphrase. In this application, LUKS configuration appears within the
Storage Action mode YAML editor escape hatch, since the storage action format is free-form.
(ADR-001)

(Source: `SPEC.md` §Storage; Q-12, resolved)

---

## Netplan

Ubuntu's declarative network configuration system. Netplan configuration is written as YAML; at
runtime, Netplan reads the YAML and generates the appropriate backend configuration for either
`systemd-networkd` or `NetworkManager`.

The `network` section of an `autoinstall.yaml` file is a Netplan YAML document. Because the
Netplan schema is deeply nested, open-ended, and supports dozens of device types (ethernets,
bridges, bonds, VLANs, Wi-Fi, tunnels), this application exposes the `network` section via a
YAML editor escape hatch rather than a structured form. (ADR-001)

(Source: `SPEC.md` §Network; Q-12, resolved; ADR-001 §Context)

---

## Snaps

Ubuntu's containerized application packaging format, developed by Canonical. Snaps are
self-contained application bundles that include all dependencies, distributed via the Snap Store.
Snaps are sandboxed at runtime using AppArmor and seccomp.

The `snaps` section of `autoinstall.yaml` specifies additional snaps to install after the base
system. Each snap entry specifies a `name`, an optional `channel` (e.g., `stable`, `edge`),
and an optional `classic` flag (boolean) for snaps that require unsandboxed access.

(Source: `SPEC.md` §Snaps, §Formularstruktur; Q-12, resolved)

---

## zdevs

IBM Z (s390x mainframe) device configuration for Ubuntu on IBM Z hardware. The `zdevs` section
of `autoinstall.yaml` enables specific mainframe I/O devices (identified by bus ID) that are
required for the installation to proceed on IBM Z infrastructure.

The `zdevs` section is irrelevant for x86/ARM deployments and is typically left empty in those
contexts. This application exposes it as a list-type form component (Table) where each row has
an `id` (string) and `enabled` (boolean) field.

(Source: `SPEC.md` §Zdevs, §Formularstruktur; Q-12, resolved)

---

## Additional Terms

| Term | Definition |
|------|-----------|
| LCP | Largest Contentful Paint — a Core Web Vitals metric that measures the render time of the largest image or text block visible in the viewport. A "Good" LCP score is < 2.5 seconds. This application targets < 2 s on a 4G connection. |
| SPA | Single-Page Application — a web application that loads a single HTML document and dynamically updates the view via JavaScript, without full-page reloads |
| WAI-ARIA | Web Accessibility Initiative – Accessible Rich Internet Applications. A W3C specification for making web applications accessible to users of assistive technologies |
| WCAG | Web Content Accessibility Guidelines — the W3C standard for web accessibility. This application targets WCAG 2.1 Level AA (Q-7, resolved) |
| HMR | Hot Module Replacement — a Vite development feature that updates modules in the browser without a full page reload, preserving application state during development (ADR-002) |
| SLO | Service Level Objective — a quantitative target for a quality attribute (e.g., YAML generation < 50 ms). See [§10 Quality Requirements](10-quality-requirements.md) |
| ESM | ECMAScript Modules — the standard JavaScript module system. Vite uses native ESM for development serving, enabling fast HMR (ADR-002) |
