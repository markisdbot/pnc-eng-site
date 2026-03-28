---
# ============================================================================
# FRONTMATTER SCHEMA
# ============================================================================
# Copy this entire block (including the --- lines) when creating new pages.
# Fill in the values below. Lines starting with # are comments and won't
# appear in the final page.
# ============================================================================

# title (required)
#   - The page title that appears in the browser tab and search results
#   - Keep it concise but descriptive (ideally under 60 characters)
title: Page Title Here

# description (required)
#   - A short summary of the page content (1-2 sentences)
#   - Used for SEO and appears in search results
#   - Keep under 160 characters
description: Brief description of what this page covers.

# category (optional)
#   - Content type classification. Choose one:
#   - "conceptual"  → Explanatory content, theory, principles
#   - "procedure"   → Step-by-step instructions, how-to guides
#   - "reference"   → Technical specs, lookup tables, standards
category: conceptual

# tags (optional)
#   - Keywords for search and filtering
#   - Use lowercase, hyphenated tags
#   - Add as many relevant tags as needed
tags:
  - relay-protection
  - transmission-lines
  - settings

# last_updated (optional)
#   - Date this page was last modified
#   - Format: YYYY-MM-DD
last_updated: 2026-03-22

# author (optional)
#   - Name of the content author or maintainer
author: Your Name
---

<!--
  TEMPLATE USAGE INSTRUCTIONS:
  
  1. Copy this file to a new .md file in the appropriate section folder
  2. Rename it to something descriptive (e.g., "distance-relay-settings.md")
  3. Replace all placeholder text (marked with ALL CAPS or "Here")
  4. Delete these instructions and any comments you don't need
  5. Remove any sections that don't apply to your content
  6. Save and the site will automatically include your page
  
  NOTE: This is a Markdown file. You can use standard Markdown formatting:
  - # for headings
  - * or - for bullet lists
  - 1. 2. 3. for numbered lists
  - **bold** and *italic* for emphasis
  - [link text](URL) for hyperlinks
  - `code` for inline code
  - ``` for code blocks
-->

# Page Title Here

<!-- Overview Section ======================================================= -->
## Overview

<!-- 
  PURPOSE: Explain what this page covers and why it matters.
  
  Include:
  - A brief introduction to the topic
  - Why this information is important for P&C engineers
  - When someone would use this information
  - Any prerequisites or assumed knowledge
  
  LENGTH: 2-4 paragraphs is usually sufficient
-->

Brief introduction to the topic. Explain what this page covers and why it's important for protection and control engineers. Mention the context in which this knowledge is applied.

Describe the practical importance. Why should someone care about this? What problems does understanding this topic help solve?

Mention any prerequisites. For example: "This guide assumes familiarity with basic relay operating principles."

<!-- Key Concepts Section =================================================== -->
## Key Concepts

<!--
  PURPOSE: Define terminology, explain principles, provide background.
  
  Include:
  - Important terms and definitions
  - Underlying principles or theory
  - Relevant formulas or calculations (if applicable)
  - Diagrams or visual aids (use Markdown image syntax)
  
  FORMAT: Use subheadings (###) to organize related concepts
-->

### Terminology

Define key terms that will be used throughout the page:

- **Term One**: Definition of the first important term.
- **Term Two**: Definition of the second important term.
- **Term Three**: Definition of the third important term.

### Fundamental Principles

Explain the core concepts and principles:

- Principle explanation with supporting details
- Relationship between different concepts
- How these principles apply in real-world scenarios

### Relevant Formulas

If applicable, include important formulas:

```
Formula: Z = V / I
Where:
  Z = Impedance (ohms)
  V = Voltage (volts)
  I = Current (amperes)
```

<!-- Procedures Section ===================================================== -->
## Procedures

<!--
  PURPOSE: Step-by-step instructions (for procedure-type content).
  
  Include:
  - Numbered steps in logical order
  - Clear, actionable instructions
  - Safety warnings or cautions where applicable
  - Expected outcomes or verification steps
  
  NOTE: If this is a conceptual or reference page, you can delete this section
  or replace it with "Examples" showing how to apply the concepts.
-->

### Procedure Title

Brief description of what this procedure accomplishes and when to use it.

#### Prerequisites

- Required tools or equipment
- Necessary access or permissions
- Previous steps that must be completed

#### Steps

1. **First Step**: Detailed instruction for the first step.
   - Sub-point with additional detail
   - Another sub-point if needed

2. **Second Step**: Detailed instruction for the second step.
   - Include any specific values, thresholds, or settings
   - Mention any safety considerations

3. **Third Step**: Detailed instruction for the third step.
   - Continue with clear, actionable language

4. **Verification**: How to confirm the procedure was successful.

### Alternative Procedure (if applicable)

If there are multiple ways to accomplish the same goal, document them separately.

<!-- References Section ===================================================== -->
## References

<!--
  PURPOSE: Provide links to related resources.
  
  Include:
  - Applicable standards (IEEE, IEC, NERC, etc.)
  - Equipment manuals or manufacturer documentation
  - Related pages within this knowledge base
  - External resources (articles, whitepapers, training materials)
  
  FORMAT: Group by type for easier navigation
-->

### Standards

- [IEEE C37.90](https://standards.ieee.org/standard/C37.90-2005.html) — Standard for Relays and Relay Systems
- [IEC 61850](https://webstore.iec.ch/publication/66912) — Communication networks and systems for power utility automation

### Manufacturer Documentation

- [SEL-421 Manual](https://selinc.com) — Distance Relay Protection
- [GE L90 Manual](https://gegridsolutions.com) — Line Current Differential

### Related Pages

- [Related Topic One](./related-topic-one) — Brief description
- [Related Topic Two](./related-topic-two) — Brief description

### External Resources

- [Technical Paper Title](https://example.com) — Brief description of the resource
- [Training Material](https://example.com) — Brief description

<!-- Additional Sections (Optional) ========================================= -->
## Troubleshooting

<!--
  Optional section for common issues and solutions.
  Use if applicable to the topic.
-->

### Common Issue One

**Symptom**: Description of what goes wrong.

**Cause**: Explanation of why this happens.

**Solution**: Steps to resolve the issue.

### Common Issue Two

**Symptom**: Description of what goes wrong.

**Cause**: Explanation of why this happens.

**Solution**: Steps to resolve the issue.

## Frequently Asked Questions

<!--
  Optional section for common questions.
  Format as Q&A pairs.
-->

**Q: Question one?**

A: Answer to question one.

**Q: Question two?**

A: Answer to question two.
