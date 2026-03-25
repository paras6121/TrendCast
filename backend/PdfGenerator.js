import PDFDocument from 'pdfkit';

export function generateTrendReport(predictions, rawScores, keywords) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const navy = '#0a0f1e';
    const white = '#ffffff';
    const accent = '#4a90d9';
    const gray = '#8aabdd';
    const lightGray = '#e8f0fe';

    const pageWidth = doc.page.width - 100;

    // Header background
    doc.rect(0, 0, doc.page.width, 120).fill(navy);

    // Logo text
    doc.fontSize(28).fillColor(white)
      .font('Helvetica-Bold')
      .text('TrendCast', 50, 35);

    doc.fontSize(10).fillColor(gray)
      .font('Helvetica')
      .text('INDIA FASHION INTELLIGENCE', 50, 68);

    // Date
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.fontSize(10).fillColor(gray)
      .text('Generated: ' + today, 50, 85);

    // Report title
    doc.fontSize(11).fillColor(accent)
      .text('TREND FORECAST REPORT — 3 MONTH OUTLOOK', doc.page.width - 350, 50, { width: 300, align: 'right' });

    doc.moveDown(4);

    // Keywords searched
    doc.fontSize(13).fillColor(navy)
      .font('Helvetica-Bold')
      .text('Keywords Analysed', 50, 145);

    doc.rect(50, 162, pageWidth, 1).fill(lightGray);
    doc.moveDown(0.5);

    const kwText = keywords.join('  ·  ');
    doc.fontSize(11).fillColor('#333333')
      .font('Helvetica')
      .text(kwText, 50, 172);

    doc.moveDown(1.5);

    // Overall insight
    if (predictions?.overallInsight) {
      doc.rect(50, doc.y, pageWidth, 60).fill('#f0f4ff').stroke('#dde8ff');
      doc.fontSize(11).fillColor(navy)
        .font('Helvetica-Bold')
        .text('Market Intelligence', 60, doc.y - 55);
      doc.fontSize(10).fillColor('#333333')
        .font('Helvetica')
        .text(predictions.overallInsight, 60, doc.y - 40, { width: pageWidth - 20 });
      doc.moveDown(2);
    }

    doc.moveDown(0.5);

    // Each prediction
    predictions?.predictions?.forEach((pred, i) => {
      const raw = rawScores?.find(r => r.keyword === pred.keyword);
      const score = raw?.compositeScore || 0;

      if (doc.y > 680) doc.addPage();

      const yStart = doc.y;

      // Card background
      doc.rect(50, yStart, pageWidth, 180).fill('#f9fafb').stroke('#e8edf5');

      // Keyword title
      doc.fontSize(16).fillColor(navy)
        .font('Helvetica-Bold')
        .text(pred.keyword, 65, yStart + 15);

      // Confidence badge
      const confColor = pred.confidence === 'HIGH' ? '#15803d' : pred.confidence === 'MEDIUM' ? '#b45309' : '#be123c';
      const confBg = pred.confidence === 'HIGH' ? '#f0fdf4' : pred.confidence === 'MEDIUM' ? '#fffbeb' : '#fff1f2';
      doc.rect(doc.page.width - 130, yStart + 12, 70, 22).fill(confBg).stroke(confColor);
      doc.fontSize(10).fillColor(confColor)
        .font('Helvetica-Bold')
        .text(pred.confidence, doc.page.width - 120, yStart + 18, { width: 50, align: 'center' });

      // Trend phase
      doc.fontSize(10).fillColor(gray)
        .font('Helvetica')
        .text('Phase: ' + (pred.trendPhase || 'GROWING') + '   ·   Peak: ' + (pred.peakMonth || 'TBD') + '   ·   Sustained until: ' + (pred.sustainedUntil || 'TBD'), 65, yStart + 38);

      // Score bar
      doc.fontSize(9).fillColor(gray)
        .text('Trend Score', 65, yStart + 58);
      doc.rect(65, yStart + 70, 200, 8).fill('#e8edf5');
      doc.rect(65, yStart + 70, Math.min(200, score * 2), 8).fill(accent);
      doc.fontSize(9).fillColor(navy)
        .font('Helvetica-Bold')
        .text(score + '/100', 275, yStart + 68);

      // Sustainability
      if (pred.sustainabilityScore) {
        doc.fontSize(9).fillColor(gray)
          .font('Helvetica')
          .text('Sustainability: ' + pred.sustainabilityScore + '%', 320, yStart + 58);
        doc.rect(320, yStart + 70, 150, 8).fill('#e8edf5');
        doc.rect(320, yStart + 70, Math.min(150, pred.sustainabilityScore * 1.5), 8).fill('#4ade80');
      }

      // Prediction text
      doc.fontSize(10).fillColor('#333333')
        .font('Helvetica')
        .text(pred.prediction || '', 65, yStart + 90, { width: pageWidth - 30 });

      // Drivers
      if (pred.drivers?.length > 0) {
        doc.fontSize(9).fillColor(navy)
          .font('Helvetica-Bold')
          .text('Key Drivers:', 65, yStart + 130);
        doc.fontSize(9).fillColor('#555555')
          .font('Helvetica')
          .text(pred.drivers.slice(0, 2).map(d => '→ ' + d).join('   '), 65, yStart + 143, { width: pageWidth - 30 });
      }

      // Retailer action
      if (pred.retailerAction) {
        doc.fontSize(9).fillColor(accent)
          .font('Helvetica-Bold')
          .text('Action: ', 65, yStart + 160);
        doc.fontSize(9).fillColor('#333333')
          .font('Helvetica')
          .text(pred.retailerAction, 105, yStart + 160, { width: pageWidth - 70 });
      }

      doc.moveDown(9);
    });

    // Footer
    doc.rect(0, doc.page.height - 50, doc.page.width, 50).fill(navy);
    doc.fontSize(9).fillColor(gray)
      .text('Generated by TrendCast India · Powered by Claude AI · Data from Google, Amazon, Reddit, YouTube', 50, doc.page.height - 32, { width: pageWidth, align: 'center' });

    doc.end();
  });
}