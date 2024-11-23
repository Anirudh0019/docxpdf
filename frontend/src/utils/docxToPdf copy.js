import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';

export async function convertDocxToPdf(file) {
  if (!file || !(file instanceof File)) {
    throw new Error('Invalid file provided');
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const { content, styles } = await parseDocxContent(arrayBuffer);

    if (!content || content.length === 0) {
      throw new Error('No content found in the document');
    }

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    let currentPage = pdfDoc.addPage();
    const { width, height } = currentPage.getSize();

    // Embed fonts
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    const boldItalicFont = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);

    const margin = 50;
    let yOffset = height - margin;
    const lineHeight = 14;
    const fontSize = 12;

    for (const item of content) {
      if (yOffset < margin) {
        currentPage = pdfDoc.addPage();
        yOffset = height - margin;
      }

      if (typeof item === 'string') {
        if (item.trim()) {
          const style = styles[item] || {};
          const font = style.bold && style.italic ? boldItalicFont :
                       style.bold ? boldFont :
                       style.italic ? italicFont :
                       regularFont;

          // Normalize text for better encoding handling
          const safeText = item.normalize("NFD").replace(/[^\x00-\x7F]/g, '?');

          currentPage.drawText(safeText, {
            x: margin,
            y: yOffset,
            size: style.size || fontSize,
            font,
            color: rgb(0, 0, 0),
            maxWidth: width - (margin * 2),
            lineHeight,
          });
          yOffset -= (lineHeight * Math.ceil(safeText.length / 80)) + 10;
        }
      } else if (item.type === 'image') {
        try {
          const imageBytes = await item.data;
          let pdfImage;

          if (item.format === 'png') {
            pdfImage = await pdfDoc.embedPng(imageBytes);
          } else if (item.format === 'jpeg' || item.format === 'jpg') {
            pdfImage = await pdfDoc.embedJpg(imageBytes);
          }

          if (pdfImage) {
            const imgDims = pdfImage.scale(0.5);
            const imgWidth = Math.min(imgDims.width, width - (margin * 2));
            const imgHeight = (imgDims.height * imgWidth) / imgDims.width;

            if (yOffset - imgHeight < margin) {
              currentPage = pdfDoc.addPage();
              yOffset = height - margin;
            }

            currentPage.drawImage(pdfImage, {
              x: margin,
              y: yOffset - imgHeight,
              width: imgWidth,
              height: imgHeight,
            });

            yOffset -= imgHeight + 20;
          }
        } catch (imgError) {
          console.error('Error processing image:', imgError);
          throw new Error('Failed to process image in document');
        }
      }
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error converting document:', error);
    throw error instanceof Error ? error : new Error('Failed to convert document');
  }
}

async function parseDocxContent(buffer) {
  try {
    const zip = await JSZip.loadAsync(buffer);
    const content = [];
    const styles = {};

    // Load document content
    const documentXml = await zip.file('word/document.xml')?.async('binarystring'); // Read as binary string to handle encoding issues
    if (!documentXml) {
      throw new Error('Invalid DOCX file structure');
    }

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(documentXml, 'text/xml');

    // Load relationships for images
    const relsXml = await zip.file('word/_rels/document.xml.rels')?.async('text');
    const relsDoc = relsXml ? parser.parseFromString(relsXml, 'text/xml') : null;
    const relationships = {};

    if (relsDoc) {
      const rels = relsDoc.getElementsByTagName('Relationship');
      for (const rel of rels) {
        relationships[rel.getAttribute('Id')] = rel.getAttribute('Target');
      }
    }

    // Parse document content
    const body = xmlDoc.getElementsByTagName('w:body')[0];
    if (!body) {
      throw new Error('No document content found');
    }

    for (const node of body.children) {
      if (node.nodeName === 'w:p') {
        let paragraphText = '';
        const runs = node.getElementsByTagName('w:r');
        let currentStyle = {};

        for (const run of runs) {
          // Parse text formatting
          const rPr = run.getElementsByTagName('w:rPr')[0];
          if (rPr) {
            currentStyle = {
              bold: !!rPr.getElementsByTagName('w:b')[0],
              italic: !!rPr.getElementsByTagName('w:i')[0],
              size: 12, // Default size
            };
          }

          // Get text content
          const texts = run.getElementsByTagName('w:t');
          for (const text of texts) {
            const textContent = text.textContent || '';
            paragraphText += textContent;
            styles[textContent] = currentStyle;
          }

          // Handle images
          const drawings = run.getElementsByTagName('w:drawing');
          for (const drawing of drawings) {
            if (paragraphText) {
              content.push(paragraphText);
              paragraphText = '';
            }

            const blipElements = drawing.getElementsByTagName('a:blip');
            for (const blip of blipElements) {
              const rId = blip.getAttribute('r:embed');
              if (rId && relationships[rId]) {
                const imagePath = `word/${relationships[rId].replace(/^\//, '')}`;
                const imageFile = zip.file(imagePath);

                if (imageFile) {
                  const imageData = await imageFile.async('uint8array');
                  const format = imagePath.split('.').pop().toLowerCase();

                  content.push({
                    type: 'image',
                    data: imageData,
                    format,
                  });
                }
              }
            }
          }
        }

        if (paragraphText) {
          content.push(paragraphText);
        }
      }
    }

    if (content.length === 0) {
      throw new Error('No content found in document');
    }

    return { content, styles };
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw error instanceof Error ? error : new Error('Failed to parse DOCX file');
  }
}
