---
title: Distribution Protection Schemes
description: Protection approaches for distribution feeders including overcurrent, recloser, and fuse coordination
category: conceptual
tags: ["distribution", "overcurrent", "recloser", "fuse", "coordination", "feeder-protection"]
last_updated: 2026-03-22
author: P&C Engineering Team
---

# Distribution Protection Schemes

## Overview

Distribution systems (4kV to 35kV) prioritize reliability and selective fault isolation over speed. Unlike transmission, where stability requires sub-cycle clearing, distribution protection focuses on minimizing customer outages through coordination between fuses, reclosers, and substation breakers.

## Key Concepts

### Overcurrent Protection

The foundation of distribution protection — simple, cost-effective, and well-understood:

| Device | Typical Settings | Coordination Principle |
|--------|------------------|------------------------|
| Substation breaker | 51: 2-5x tap, 0.3-0.5s delay | Fastest clearing, backs up downstream |
| Recloser | 2-3x tap, 0.1-0.3s delay | Faster than breaker, slower than fuse |
| Sectionalizer | Counts operations, no trip | Opens after fault is cleared upstream |
| Lateral fuse | 1.5-2x load, T or K speed | Fastest, protects smallest section |

**Time-Current Characteristics:**
- **Moderately Inverse** — Standard for feeders (IEEE curves)
- **Very Inverse** — Better for high-impedance faults
- **Extremely Inverse** — Used for transformer protection

### Fuse Coordination

Fuse-saving philosophy vs. fuse-blowing philosophy:

| Philosophy | Operation | Use Case |
|------------|-----------|----------|
| Fuse-saving | Recloser fast trip (A-phase) operates before fuse melts | Rural areas, long laterals |
| Fuse-blowing | Fuse melts on all faults, recloser provides backup | Urban areas, short laterals |

**Coordination Rules:**
- Minimum 0.3s margin between device curves at maximum fault current
- Fuse must clear temporary faults before recloser locks out
- Cold load pickup must not trip protection

### Recloser Applications

Hydraulic vs. electronic reclosers:

| Feature | Hydraulic | Electronic |
|---------|-----------|------------|
| Sequences | Fixed (1A, 2B, 3C typical) | Programmable |
| Sensing | Phase/ground minimum | Multiple curves, directional |
| Communication | None | SCADA, FLISR capable |
| Cost | Lower | Higher |

**Standard Reclosing Sequence:**
1. **First trip** — Instantaneous (A-phase), 0.5s reclose
2. **Second trip** — Time delay (B-phase), 2-5s reclose  
3. **Third trip** — Time delay (C-phase), 2-5s reclose
4. **Lockout** — Permanent fault, manual reset required

## Procedures

### Feeder Coordination Study

1. **Gather data** — Feeder one-line, conductor sizes, lateral lengths, fuse sizes
2. **Calculate fault currents** — Maximum and minimum at each device location
3. **Plot TCC curves** — Use software (ETAP, CYME, or manual log-log paper)
4. **Verify margins** — 0.3s minimum between curves at max fault
5. **Check loadability** — Cold load pickup < 50% of phase trip setting
6. **Document settings** — Create coordination diagram for field reference

### Recloser Setting Verification

1. **Minimum pickup test** — Verify trip at 1.1x setting
2. **Timing test** — Verify curve follows published characteristic
3. **Sequence test** — Program and verify A-B-C operations
4. **Reclose interval** — Verify dead times (0.5s, 2-5s typical)
5. **Lockout verification** — Confirm lockout after programmed operations
6. **SCADA check** — Verify status and alarms report correctly

## References

- IEEE Std C37.112 — Inverse-Time Characteristic Equations for Overcurrent Relays
- IEEE Std 242 — Recommended Practice for Protection and Coordination of Industrial and Commercial Power Systems (Buff Book)
- Glover, Sarma, Overbye, *Power System Analysis and Design*, Chapter 7
- Cooper Power Systems — Distribution Protection Handbook
- S&C Electric — IntelliRupter PulseCloser Technical Manual

### Related Pages

- [[Transmission Line Protection Schemes]] — Higher voltage protection approaches
- [[Relay Testing Procedure Checklist]] — Field testing procedures
