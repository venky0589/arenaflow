# How to Generate PDF from Manual Testing Guide

This guide explains how to convert `MANUAL_TESTING_GUIDE.md` to a professional PDF document.

## Method 1: Using Pandoc (Recommended)

### Install Pandoc

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install pandoc texlive-latex-base texlive-fonts-recommended texlive-latex-extra
```

**macOS**:
```bash
brew install pandoc
brew install --cask basictex
```

**Windows**:
Download from https://pandoc.org/installing.html

### Generate PDF

**Basic conversion**:
```bash
cd docs
pandoc MANUAL_TESTING_GUIDE.md -o MANUAL_TESTING_GUIDE.pdf --toc --number-sections
```

**Professional formatting** (recommended):
```bash
pandoc MANUAL_TESTING_GUIDE.md -o MANUAL_TESTING_GUIDE.pdf \
  --toc \
  --number-sections \
  --variable geometry:margin=1in \
  --variable fontsize=11pt \
  --variable documentclass=report \
  --variable colorlinks=true \
  --variable linkcolor=blue \
  --highlight-style=tango
```

**With custom title page**:
```bash
pandoc MANUAL_TESTING_GUIDE.md -o MANUAL_TESTING_GUIDE.pdf \
  --toc \
  --number-sections \
  --variable geometry:margin=1in \
  --variable fontsize=11pt \
  --variable documentclass=report \
  --variable colorlinks=true \
  --variable linkcolor=blue \
  --variable title="Badminton Tournament Manager - Manual Testing Guide" \
  --variable author="Testing Team" \
  --variable date="November 2025" \
  --highlight-style=tango
```

---

## Method 2: Using VS Code Extension

### Install Extension
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Markdown PDF"
4. Install the extension by yzane

### Convert to PDF
1. Open `MANUAL_TESTING_GUIDE.md` in VS Code
2. Press Ctrl+Shift+P (or Cmd+Shift+P on Mac)
3. Type "Markdown PDF: Export (pdf)"
4. Select the command
5. PDF will be generated in the same folder

### Optional: Configure Settings
Add to VS Code settings.json:
```json
{
  "markdown-pdf.format": "A4",
  "markdown-pdf.displayHeaderFooter": true,
  "markdown-pdf.headerTemplate": "<div style='font-size: 9px; margin-left: 1cm;'><span class='title'></span></div>",
  "markdown-pdf.footerTemplate": "<div style='font-size: 9px; margin: 0 auto;'><span class='pageNumber'></span> / <span class='totalPages'></span></div>",
  "markdown-pdf.margin.top": "2cm",
  "markdown-pdf.margin.bottom": "2cm",
  "markdown-pdf.margin.left": "2cm",
  "markdown-pdf.margin.right": "2cm"
}
```

---

## Method 3: Using Online Converters

### CloudConvert (Free, No Installation)
1. Visit https://cloudconvert.com/md-to-pdf
2. Upload `MANUAL_TESTING_GUIDE.md`
3. Click "Convert"
4. Download the generated PDF

### Markdown to PDF (Free)
1. Visit https://www.markdowntopdf.com/
2. Paste the markdown content or upload file
3. Click "Convert"
4. Download PDF

**Note**: Online converters may have limitations with very large documents.

---

## Method 4: Using Chrome/Browser Print

### Steps
1. Install a markdown viewer extension (e.g., "Markdown Viewer" for Chrome)
2. Open `MANUAL_TESTING_GUIDE.md` in Chrome
3. Press Ctrl+P (or Cmd+P on Mac)
4. Select "Save as PDF" as destination
5. Adjust print settings:
   - Enable "Background graphics"
   - Set margins to "Normal"
   - Enable "Headers and footers"
6. Click "Save"

---

## Method 5: Using Python (md2pdf)

### Install
```bash
pip install md2pdf
```

### Convert
```bash
md2pdf MANUAL_TESTING_GUIDE.pdf MANUAL_TESTING_GUIDE.md
```

---

## Recommended Approach for Best Results

**For professional quality**:
```bash
# Method 1 with full formatting
pandoc MANUAL_TESTING_GUIDE.md -o MANUAL_TESTING_GUIDE.pdf \
  --pdf-engine=xelatex \
  --toc \
  --toc-depth=3 \
  --number-sections \
  --variable geometry:margin=1in \
  --variable fontsize=11pt \
  --variable documentclass=report \
  --variable colorlinks=true \
  --variable linkcolor=blue \
  --variable urlcolor=blue \
  --variable toccolor=black \
  --variable title="Badminton Tournament Manager" \
  --variable subtitle="Comprehensive Manual Testing Guide" \
  --variable author="QA Team" \
  --variable date="November 7, 2025" \
  --highlight-style=tango \
  --listings
```

---

## Troubleshooting

### Pandoc: "pdflatex not found"
```bash
# Ubuntu/Debian
sudo apt install texlive-latex-base texlive-fonts-recommended

# macOS
brew install --cask basictex
```

### Pandoc: Unicode/special characters issues
Use `--pdf-engine=xelatex` instead of default pdflatex:
```bash
pandoc MANUAL_TESTING_GUIDE.md -o MANUAL_TESTING_GUIDE.pdf --pdf-engine=xelatex
```

### File too large for online converters
Use Method 1 (Pandoc) or Method 2 (VS Code) instead.

### Tables not rendering properly
Ensure sufficient margin width:
```bash
--variable geometry:margin=0.75in
```

---

## Output Location

The generated PDF will be created in the same directory as the markdown file:
```
/home/venky/Development-Personal/sports-app/docs/MANUAL_TESTING_GUIDE.pdf
```

---

## Verification

After generating the PDF, verify:
- [ ] Table of contents is present
- [ ] All sections are numbered
- [ ] Tables are properly formatted
- [ ] Code blocks are syntax-highlighted
- [ ] Links are clickable (if using Pandoc with colorlinks)
- [ ] Page numbers are present
- [ ] All 160+ test cases are included
- [ ] Approximately 70-80 pages total

---

## Additional Customization

### Add a cover page
Create `cover.md`:
```markdown
---
title: "Badminton Tournament Manager"
subtitle: "Comprehensive Manual Testing Guide"
author: "QA & Testing Team"
date: "November 7, 2025"
version: "1.0"
---

\newpage
```

Combine files:
```bash
pandoc cover.md MANUAL_TESTING_GUIDE.md -o MANUAL_TESTING_GUIDE.pdf --toc --number-sections
```

### Custom CSS for HTML-to-PDF (Chrome method)
Create `style.css`:
```css
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

h1 { color: #2c3e50; border-bottom: 3px solid #3498db; }
h2 { color: #34495e; border-bottom: 1px solid #bdc3c7; }
table { border-collapse: collapse; width: 100%; }
th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
th { background-color: #3498db; color: white; }
code { background-color: #f4f4f4; padding: 2px 5px; border-radius: 3px; }
pre { background-color: #f4f4f4; padding: 10px; border-radius: 5px; }
```

---

For any issues, refer to:
- Pandoc documentation: https://pandoc.org/MANUAL.html
- Markdown PDF extension: https://marketplace.visualstudio.com/items?itemName=yzane.markdown-pdf
