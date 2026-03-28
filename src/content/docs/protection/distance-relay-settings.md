---
title: Distance Relay Settings Overview
description: Comprehensive guide to distance relay settings including zone reach calculations, time delays, and coordination principles for transmission line protection.
category: conceptual
tags:
  - distance-relay
  - transmission-lines
  - relay-settings
  - zone-protection
  - impedance-relay
  - mho-characteristic
last_updated: 2026-03-22
author: P&C Engineering Team
---

# Distance Relay Settings Overview

## Overview

Distance relays are fundamental protective devices used extensively in high-voltage transmission line protection. Unlike overcurrent relays that operate based on current magnitude alone, distance relays measure the impedance between the relay location and the fault, providing more selective and reliable protection for long transmission lines.

This guide covers the essential settings and configuration parameters for modern microprocessor-based distance relays. Understanding these settings is critical for ensuring proper coordination with adjacent protection zones, maintaining system stability during faults, and achieving the desired speed of operation for different fault types.

Proper distance relay settings require knowledge of line impedance parameters, system configuration, adjacent line data, and coordination requirements with other protective devices. This document assumes familiarity with basic relay operating principles and transmission line theory.

## Key Concepts

### Distance Relay Fundamentals

Distance relays operate on the principle that the impedance measured during a fault is proportional to the distance from the relay to the fault location. By comparing the measured impedance against predetermined reach settings, the relay can determine if a fault is within its protected zone.

- **Impedance Measurement**: The relay calculates Z = V/I using voltage and current inputs
- **Zone of Protection**: Predefined impedance regions that define the relay's operating characteristics
- **Directional Element**: Determines if the fault is in the forward or reverse direction

### Zone Definitions

Distance protection is typically organized into multiple zones to provide both high-speed clearing for close-in faults and backup protection for remote faults:

| Zone | Purpose | Typical Reach | Time Delay |
|------|---------|---------------|------------|
| Zone 1 | Instantaneous primary protection | 80-90% of line length | Instantaneous (0 cycles) |
| Zone 2 | Delayed primary + remote bus backup | 120-150% of line length | 15-30 cycles |
| Zone 3 | Remote line backup protection | 120-150% of next longest line | 30-60 cycles |

### Relay Characteristics

Modern distance relays support multiple characteristic shapes:

- **Mho Characteristic**: Circular characteristic that provides inherent directionality and is most commonly used for phase fault protection
- **Quadrilateral Characteristic**: Polygonal shape offering better resistive coverage for ground faults
- **Lens Characteristic**: Modified mho shape providing improved loadability

### Key Setting Parameters

**Zone Reach (Z)**: The impedance magnitude that defines the boundary of each protection zone. Calculated as:

```
Z_reach = k × Z_line

Where:
  k = reach multiplier (typically 0.8-0.9 for Zone 1)
  Z_line = positive sequence line impedance (ohms)
```

**Maximum Torque Angle (MTA)**: The angle at which the relay has maximum sensitivity, typically set equal to the line impedance angle (usually 75-85 degrees for overhead lines).

**Resistive Reach (R)**: For quadrilateral characteristics, defines the resistive coverage of the zone, important for fault resistance accommodation.

## Procedures

### Zone 1 Settings Calculation

Zone 1 provides instantaneous protection for the majority of the protected line. The underreach setting avoids operation for faults at the remote terminal.

#### Prerequisites

- Line positive sequence impedance (Z₁) from line data or construction records
- Line length in miles or kilometers
- System voltage level
- Relay current transformer (CT) and voltage transformer (VT) ratios

#### Steps

1. **Calculate Line Impedance in Secondary Ohms**:
   ```
   Z_sec = Z_primary × (CT_ratio / VT_ratio)
   
   Example:
   - Line impedance: 0.8 + j4.2 Ω (primary)
   - CT ratio: 1200:5 (240:1)
   - VT ratio: 138kV:115 (1200:1)
   - Z_sec = (0.8 + j4.2) × (240/1200) = 0.16 + j0.84 Ω
   ```

2. **Determine Zone 1 Reach Setting**:
   - Set Zone 1 reach to 80-90% of the line impedance
   - For the example above with 85% reach:
   ```
   Z1_reach = 0.85 × |0.16 + j0.84| = 0.85 × 0.855 = 0.727 Ω
   ```

3. **Set Maximum Torque Angle**:
   - Calculate line impedance angle: θ = arctan(X/R) = arctan(0.84/0.16) = 79.2°
   - Set MTA to 79° (round to nearest degree)

4. **Configure Zone 1 Time Delay**:
   - Set Zone 1 time to 0 cycles (instantaneous)
   - Some relays require a minimum 1-cycle delay for security

5. **Verification**:
   - Confirm Zone 1 does not overreach the remote bus
   - Verify adequate coverage for the protected line (typically >80%)

### Zone 2 Settings Calculation

Zone 2 provides backup protection for the remote bus and should coordinate with Zone 1 of the shortest adjacent line.

#### Steps

1. **Calculate Zone 2 Reach**:
   - Minimum reach: 120% of protected line (ensures remote bus coverage)
   - Maximum reach: Less than Zone 1 of shortest adjacent line
   ```
   Z2_min = 1.20 × Z_line
   Z2_max = 0.90 × (Z_line + Z_adjacent_zone1)
   ```

2. **Set Zone 2 Time Delay**:
   - Typical delay: 15-30 cycles (0.25-0.5 seconds at 60 Hz)
   - Must coordinate with breaker failure timing of remote terminal
   - Allow adequate margin for Zone 1 clearing time

3. **Coordinate with Adjacent Relays**:
   - Verify Zone 2 does not overlap with Zone 1 of adjacent line relays
   - Check coordination with transformer differential protection if applicable

### Ground Distance Settings

Ground distance elements require additional considerations for zero-sequence compensation.

#### Steps

1. **Calculate Zero-Sequence Compensation (k₀)**:
   ```
   k₀ = (Z₀ - Z₁) / (3 × Z₁)
   
   Where:
     Z₀ = zero-sequence line impedance
     Z₁ = positive-sequence line impedance
   ```

2. **Set Ground Distance Reach**:
   - Typically set equal to phase distance reach
   - Verify adequate coverage for high-resistance ground faults

3. **Configure Resistive Reach (Quadrilateral)**:
   - Set RGF (ground fault resistance coverage) based on expected fault resistance
   - Typical values: 10-40 Ω primary (scaled to secondary)

## References

### Standards

- [IEEE C37.113](https://standards.ieee.org/standard/C37.113-2015.html) — Guide for Protective Relay Applications to Transmission Lines
- [IEEE C37.90](https://standards.ieee.org/standard/C37.90-2005.html) — Standard for Relays and Relay Systems Associated with Electric Power Apparatus
- [IEEE 242](https://standards.ieee.org/standard/242-2001.html) — Recommended Practice for Protection and Coordination of Industrial and Commercial Power Systems (Buff Book)

### Manufacturer Documentation

- [SEL-421 Instruction Manual](https://selinc.com/products/421/) — Distance Relay with Synchrophasor and Communications
- [SEL-311C Instruction Manual](https://selinc.com/products/311c/) — Transmission Protection System
- [GE L90 Line Current Differential System](https://www.gegridsolutions.com/products/brochures/L90.pdf) — Distance Protection Functions
- [ABB REL 670 Technical Manual](https://new.abb.com/medium-voltage/apparatus/relion/rel-670) — Line Distance Protection

### Related Pages

- [Overcurrent Protection](./overcurrent-protection) — Coordination with time-overcurrent elements
- [Transmission Line Protection](./transmission-line-protection) — Comprehensive line protection schemes
- [Relay Coordination](./relay-coordination) — Principles of protective device coordination

### External Resources

- [SEL Distance Relay Settings Webinar](https://selinc.com/training/) — Training on modern distance relay applications
- [IEEE PSRC Working Group Reports](https://www.pes-psrc.org/) — Technical reports on protection practices
- [CIGRE Working Group B5.15](https://www.cigre.org/) — Protection and control of transmission networks

## Troubleshooting

### Zone 1 Overreach

**Symptom**: Zone 1 operates for faults on the adjacent line or remote bus.

**Cause**: 
- Reach setting too high (exceeds 90% of line)
- Inaccurate line impedance data
- Current transformer saturation during close-in faults

**Solution**:
1. Verify line impedance data against construction records
2. Reduce Zone 1 reach to 80-85% of line
3. Check CT performance for high-magnitude faults
4. Consider adding a small time delay (1-2 cycles) if transient overreach is suspected

### Failure to Trip for Line-End Faults

**Symptom**: Relay fails to operate for faults near the remote terminal.

**Cause**:
- Zone 1 underreach (set too conservatively)
- Weak infeed conditions affecting measured impedance
- Fault resistance causing apparent impedance to fall outside zone

**Solution**:
1. Increase Zone 1 reach toward 90% if coordination allows
2. Verify Zone 2 adequately covers remote bus (120% minimum)
3. For high-resistance faults, consider quadrilateral characteristic or ground directional overcurrent backup
4. Check for weak infeed compensation settings if applicable

### Coordination Failures

**Symptom**: Backup zones operate before primary protection, or multiple breakers trip unnecessarily.

**Cause**:
- Zone 2 time delay insufficient
- Reach settings overlap with adjacent line Zone 1
- Incorrect coordination with breaker failure protection

**Solution**:
1. Increase Zone 2 time delay to coordinate with remote breaker failure clearing
2. Reduce Zone 2 reach if it encroaches on adjacent line Zone 1
3. Verify timing coordination study includes all relevant devices

## Frequently Asked Questions

**Q: Why is Zone 1 typically set to only 80-90% of the line?**

A: Zone 1 is set to underreach (typically 80-90%) to avoid overreaching the remote terminal due to: (1) inaccuracies in line impedance data, (2) current transformer errors, (3) relay measurement errors, and (4) transient overreach during the DC offset period of fault current. This ensures Zone 1 only operates for faults actually on the protected line.

**Q: How do I calculate the secondary impedance for relay settings?**

A: Convert primary impedance to secondary using the instrument transformer ratios: Z_secondary = Z_primary × (CT_ratio / VT_ratio). Remember that CT ratio is the current transformation (e.g., 1200:5 = 240:1) and VT ratio is the voltage transformation (e.g., 138kV:115V = 1200:1).

**Q: What's the difference between mho and quadrilateral characteristics?**

A: Mho characteristics are circular, provide inherent directionality, and are simple to set, making them ideal for phase fault protection. Quadrilateral characteristics are polygonal, offer independent resistive and reactive reach settings, and provide better coverage for high-resistance ground faults, making them preferred for ground distance elements.

**Q: When should I use load encroachment blinder settings?**

A: Load encroachment blinders are needed when the line loading can approach the impedance setting of any zone. This is common on long lines, heavily loaded lines, or when using quadrilateral characteristics with large resistive reach settings. The blinder prevents relay operation during stable power swings and heavy load conditions.
