---
title: Transmission Line Protection Schemes
description: Common protection schemes for transmission lines including distance, pilot, and directional comparison
category: conceptual
tags: ["transmission", "distance-relay", "pilot-protection", "directional-comparison", "line-protection"]
last_updated: 2026-03-22
author: P&C Engineering Team
---

# Transmission Line Protection Schemes

## Overview

Transmission lines operate at voltages from 69kV to 765kV and require fast, selective protection to maintain system stability and minimize equipment damage. Unlike distribution feeders, transmission protection must account for high fault currents, stability limits, and complex network interconnections.

## Key Concepts

### Distance Protection (Impedance Relaying)

Distance relays measure impedance (Z = V/I) to determine fault location:

| Zone | Reach Setting | Time Delay | Purpose |
|------|---------------|------------|---------|
| Zone 1 | 80-90% of line | Instantaneous | Primary protection for most of line |
| Zone 2 | 120-150% of line | 15-30 cycles | Backup for remote end, covers 100% of line |
| Zone 3 | 120% of longest adjacent line | 30-60 cycles | Remote backup protection |

**Characteristics:**
- **Mho elements** — Most common, inherently directional, resistive coverage varies with reach
- **Quadrilateral elements** — Better resistive fault coverage, commonly used on short lines
- **Load encroachment** — Prevents tripping on heavy load conditions near Zone 3 reach

### Pilot Protection Schemes

Pilot schemes use communications between line terminals for high-speed clearing of 100% of the line:

| Scheme | Operating Principle | Channel Requirement |
|--------|---------------------|---------------------|
| DUTT (Direct Underreach Transfer Trip) | Zone 1 trip + transfer trip | One-way channel |
| POTT (Permissive Overreach Transfer Trip) | Zone 2 + permissive from remote | Two-way channel |
| PUTT (Permissive Underreach Transfer Trip) | Zone 1 + permissive from remote | Two-way channel |
| DCB (Directional Comparison Blocking) | Zone 2 + no blocking from remote | Two-way channel |

### Directional Comparison

Compares fault direction at both terminals:

- **Blocking schemes** — Terminal sends block signal if fault is behind it (external)
- **Permissive schemes** — Terminal sends permit signal if fault is forward (internal)
- **Unblocking** — Allows trip if channel fails (security vs. dependability trade-off)

## Procedures

### Distance Relay Coordination Study

1. **Collect system data** — Line impedances, source impedances, fault contributions
2. **Calculate Zone 1 reach** — 85% of protected line impedance typical
3. **Set Zone 2 reach** — Minimum of 120% of line or 50% of shortest adjacent line minus 10%
4. **Verify coordination** — Zone 2 must not overreach into adjacent Zone 1
5. **Check loadability** — Maximum load impedance must be outside Zone 3 with 150% margin
6. **Document settings** — Create relay setting sheet with calculations

### Pilot Scheme Commissioning

1. **Channel verification** — Test fiber, microwave, or power line carrier end-to-end
2. **Keying test** — Verify local relay keys transmitter on forward faults
3. **Trip test** — Confirm receipt of permissive/blocking signal causes correct action
4. **Channel failure test** — Simulate channel loss, verify unblocking or fallback logic
5. **Timing verification** — Total clearing time < 6 cycles for 100% of line

## References

- IEEE Std C37.113 — Guide for Protective Relay Applications to Transmission Lines
- IEEE Std C37.90 — Relays and Relay Systems Associated with Electric Power Apparatus
- Blackburn & Domin, *Protective Relaying: Principles and Applications*, Chapter 12
- GE Multilin L90 Line Differential Relay Manual
- SEL-421 Distance Relay Manual

### Related Pages

- [[Digital Substation Fundamentals]] — GOOSE-based pilot schemes
- [[Distribution Protection Schemes]] — Comparison with distribution approaches
