# Governance Website v2 - Styling Guide

A Next.js governance application with Material-UI theming system and TypeScript.

# Themes
<details>
<summary>Theme Details</summary>

## Overview
<details>
<summary>Directory Structure</summary>

```bash
src/theme/
├── index.ts          # Main theme configuration
├── palette.ts        # Color definitions
├── typography.ts     # Typography variants
├── components.ts     # Component style overrides
└── breakpoints.ts    # Responsive breakpoints
```

**Key Features:**
- Centralized styling in theme files
- Custom color palette extensions
- Component-level style overrides
- Responsive design tokens

</details>

## 🎯 Quick Reference

<details>
<summary><strong>Colors</strong></summary>

```typescript
primary: '#38FF9C'        // Green - main actions
secondary: '#FF6B6B'      // Red - secondary actions
success: '#38FF9C'        // Green - "yea" votes
error: '#FF6B6B'          // Red - "nay" votes
warning: '#FFA726'        // Orange - "pass" votes
background.default: '#0A0A0A'  // Pure black
background.paper: '#151515'    // Card backgrounds
```

</details>

<details>
<summary><strong>Typography</strong></summary>

```tsx
// Use semantic variants - avoid inline styles
<Typography variant="h1">Main Title</Typography>
<Typography variant="body1">Content</Typography>
<Typography variant="caption">Labels</Typography>

// Font specs: Inter, 400/600/700 weights, responsive sizing
```

</details>

<details>
<summary><strong>Components</strong></summary>

**Auto-styled via theme:**
- **Buttons**: 50px border-radius, glowing effects
- **Tables**: Headers 700 weight/16px, Body 400 weight/12px
- **Cards**: 25px border-radius, primary shadows
- **Forms**: Outlined style, primary focus states

</details>

## 📁 Component Organization

```bash
src/components/
├── contract/     # ContractSummary
├── proposals/    # ProposalsList, ProposalCard, ProposalsView
├── voting/       # VotingResults, VoteResultCard, VotersTable
└── ui/           # SortableTable, shared components
```

## ✅ Best Practices

<details>
<summary><strong>Do's and Dont's</strong></summary>

**✅ Good:**
```tsx
// Use theme values
<Box sx={{ p: theme.spacing(2), borderRadius: theme.shape.borderRadius }}>
<Typography variant="subtitle1">Styled Text</Typography>
<Button sx={{ color: theme.palette.primary.main }}>
```

**❌ Avoid:**
```tsx
// Don't hardcode values
<Box sx={{ padding: '16px', borderRadius: '8px' }}>
<Typography sx={{ fontSize: '14px', fontWeight: 'bold' }}>
<Button sx={{ backgroundColor: '#3B82F6' }}>
```

</details>

## 🚀 Development

<details>
<summary><strong>Getting Started</strong></summary>

```bash
npm install
npm run dev
```

**Adding New Components:**
1. Create in appropriate domain folder
2. Use TypeScript interfaces
3. Apply theme-based styling
4. Add to barrel exports
5. Test responsively

**Modifying Theme:**
- Colors: Edit `src/theme/palette.ts`
- Typography: Edit `src/theme/typography.ts`
- Component styles: Edit `src/theme/components.ts`

</details>

<details>
<summary><strong>Troubleshooting</strong></summary>

**Common Issues:**
- **Typography not applying**: Check theme variants vs component overrides
- **Colors wrong**: Verify palette values and semantic usage
- **Responsive issues**: Use theme breakpoints consistently
- **Style conflicts**: Check component overrides specificity

</details>

---

**📚 Resources:** [Material-UI Docs](https://mui.com) | **🎯 Focus:** Use theme system, avoid hardcoded styles, organize by domain

</details>