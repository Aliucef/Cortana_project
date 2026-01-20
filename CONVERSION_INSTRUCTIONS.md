# How to Convert the Graduation Report to Microsoft Word (.docx)

Your complete graduation report is ready in markdown format at:
**`CORTANA_GRADUATION_REPORT_COMPLETE.md`**

Here are several methods to convert it to Microsoft Word format:

## Method 1: Using Pandoc (Recommended - Best Quality)

Pandoc is the best tool for converting markdown to Word with proper formatting.

### On Windows:
1. Download Pandoc from: https://pandoc.org/installing.html
2. Install Pandoc
3. Open Command Prompt in the project directory
4. Run:
```bash
pandoc CORTANA_GRADUATION_REPORT_COMPLETE.md -o CORTANA_GRADUATION_REPORT.docx --toc --reference-doc=custom-reference.docx
```

### On Linux/WSL:
```bash
sudo apt-get update
sudo apt-get install pandoc
cd /mnt/d/Final-Project
pandoc CORTANA_GRADUATION_REPORT_COMPLETE.md -o CORTANA_GRADUATION_REPORT.docx --toc
```

### On Mac:
```bash
brew install pandoc
cd /path/to/Final-Project
pandoc CORTANA_GRADUATION_REPORT_COMPLETE.md -o CORTANA_GRADUATION_REPORT.docx --toc
```

## Method 2: Using Microsoft Word Directly

1. Open **Microsoft Word**
2. Go to **File → Open**
3. Select **"All Files (*.*)"** in file type dropdown
4. Navigate to and open `CORTANA_GRADUATION_REPORT_COMPLETE.md`
5. Word will automatically convert the markdown
6. Go to **File → Save As**
7. Choose **".docx"** format
8. Save as `CORTANA_GRADUATION_REPORT.docx`

**Note:** This method may require manual formatting adjustments.

## Method 3: Using Online Converter

1. Visit: https://www.markdowntoword.com/ or https://cloudconvert.com/md-to-docx
2. Upload `CORTANA_GRADUATION_REPORT_COMPLETE.md`
3. Download the converted `.docx` file
4. Open in Word to verify and adjust formatting

## Method 4: Using VS Code Extension

If you use Visual Studio Code:

1. Install the **"Markdown PDF"** extension
2. Open `CORTANA_GRADUATION_REPORT_COMPLETE.md` in VS Code
3. Right-click in the editor
4. Select **"Markdown PDF: Export (docx)"**

## Method 5: Using Google Docs

1. Go to https://docs.google.com
2. Create a new document
3. Go to **File → Open → Upload**
4. Upload `CORTANA_GRADUATION_REPORT_COMPLETE.md`
5. Google Docs will convert it
6. Go to **File → Download → Microsoft Word (.docx)**

## After Conversion: Formatting Checklist

Once converted to Word, please verify and adjust:

✅ **Title Page**: Ensure proper formatting with centered text
✅ **Table of Contents**: Verify all page numbers are correct (use Word's auto-TOC feature)
✅ **Headings**: Apply Word styles (Heading 1, 2, 3, etc.)
✅ **Tables**: Ensure all tables are properly formatted
✅ **Diagrams**: Mermaid diagrams need to be rendered separately (see below)
✅ **Page Numbers**: Add page numbers in footer
✅ **Line Spacing**: Set to 1.5 as per IUL requirements
✅ **Font**: Times New Roman 12pt throughout
✅ **Margins**: 1 inch (2.54 cm) all around

## Rendering Mermaid Diagrams

The report includes 15+ Mermaid diagrams. To render them:

### Option A: Using Mermaid Live Editor
1. Visit: https://mermaid.live/
2. Copy each Mermaid diagram code from the markdown
3. Paste into the editor
4. Click **"Download PNG"** or **"Download SVG"**
5. Insert images into Word document at appropriate locations

### Option B: Using VS Code Extension
1. Install **"Markdown Preview Mermaid Support"** extension in VS Code
2. Open the markdown file
3. Press `Ctrl+Shift+V` to preview
4. Take screenshots of rendered diagrams
5. Insert into Word document

### Option C: Using Mermaid CLI
```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i input.mmd -o output.png
```

## List of Mermaid Diagrams to Render

1. Chapter 5: ERD (Entity-Relationship Diagram)
2. Chapter 5: Database Class Diagram
3. Chapter 6: FastAPI Architecture
4. Chapter 6: API Request Sequence
5. Chapter 6: Finance Agent Class Diagram
6. Chapter 6: News Agent Sequence
7. Chapter 6: Health Agent Architecture
8. Chapter 6: Scheduler Service
9. Chapter 6: Telegram Bot Architecture
10. Chapter 7: React Architecture
11. Chapter 7: Flutter Architecture
12. Chapter 8: JWT Authentication Sequence
13. Chapter 8: Security Architecture
14. Chapter 9: Finance Use Cases
15. Chapter 9: Integration Flow
16. Chapter 10: Testing Pyramid

## Final Touches in Word

1. **Add Header**: Islamic University of Lebanon logo (if available)
2. **Page Breaks**: Insert before each new chapter
3. **Page Numbers**: Roman numerals (i, ii, iii) for front matter, Arabic (1, 2, 3) for main content
4. **References**: Ensure IEEE citation format is correct
5. **Proofreading**: Run spell check and grammar check

## Recommended Pandoc Command with Best Options

For the highest quality conversion:

```bash
pandoc CORTANA_GRADUATION_REPORT_COMPLETE.md \
  -o CORTANA_GRADUATION_REPORT.docx \
  --toc \
  --toc-depth=3 \
  --number-sections \
  --highlight-style=tango \
  --reference-doc=ieee-template.docx \
  --metadata title="Cortana AI Assistant" \
  --metadata author="Ali Youssef" \
  --metadata date="2026"
```

## Need Help?

If you encounter issues:
1. Check that the markdown file is not corrupted
2. Ensure you have the latest version of your conversion tool
3. Try a different method from the list above
4. For Mermaid diagrams, use the online editor as fallback

---

**Your complete graduation report has 120+ pages and 45,000+ words covering all 10 chapters, conclusion, references, and appendices.**

Good luck with your defense! 🎓
