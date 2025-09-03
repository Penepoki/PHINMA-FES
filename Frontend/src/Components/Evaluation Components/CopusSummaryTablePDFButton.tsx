import React, { forwardRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


interface PDFButtonProps {
  evaluations: any[];
  evaluationTallies: any;
  studentOptions: string[];
  teacherOptions: string[];
  chartImages?: { gauge?: string; pie?: string };
  onCollectChartImages?: () => void;
  professorName?: string;
}

const PDFButton = forwardRef<HTMLButtonElement, PDFButtonProps>(
  ({ evaluations, evaluationTallies, studentOptions, teacherOptions, chartImages, onCollectChartImages, professorName }, ref) => {
    
    // Helper function to draw circular progress indicator
    const drawCircularProgress = (doc: jsPDF, x: number, y: number, radius: number, percentage: number, color: string, label: string) => {
      const centerX = x + radius;
      const centerY = y + radius;
      
      // Draw background circle
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(10);
      doc.circle(centerX, centerY, radius, 'S');
      
      // Draw progress arc
      if (percentage > 0) {
        // Convert percentage to radians (starting from top, going clockwise)
        const startAngle = -Math.PI / 2; // Start from top
        const endAngle = startAngle + (percentage / 100) * 2 * Math.PI;
        
        // Set color based on percentage
        if (color === 'green') doc.setDrawColor(34, 197, 94);
        else if (color === 'red') doc.setDrawColor(239, 68, 68);
        else doc.setDrawColor(34, 197, 94); // default green
        
        doc.setLineWidth(10);
        
        // Draw arc manually using small line segments
        const segments = Math.max(10, Math.floor(percentage * 2)); // More segments for smoother arc
        for (let i = 0; i <= segments; i++) {
          const angle = startAngle + (i / segments) * (endAngle - startAngle);
          const x1 = centerX + Math.cos(angle) * radius;
          const y1 = centerY + Math.sin(angle) * radius;
          
          if (i > 0) {
            const prevAngle = startAngle + ((i - 1) / segments) * (endAngle - startAngle);
            const x0 = centerX + Math.cos(prevAngle) * radius;
            const y0 = centerY + Math.sin(prevAngle) * radius;
            doc.line(x0, y0, x1, y1);
          }
        }
      }
      
      // Add percentage text in center
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      const text = `${percentage.toFixed(2)}%`;
      const textWidth = doc.getTextWidth(text);
      doc.text(text, centerX - textWidth / 2, centerY + 2);
      
      // Add label below
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const labelWidth = doc.getTextWidth(label);
      doc.text(label, centerX - labelWidth / 2, centerY + radius + 15);
    };

    const handleExportPDF = () => {
      if (onCollectChartImages) onCollectChartImages();
      const doc = new jsPDF();
      let y = 20;

      // Header with professor name
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      const title = `${professorName || 'Professor'} - COPUS Summary`;
      const titleWidth = doc.getTextWidth(title);
      doc.text(title, (210 - titleWidth) / 2, y); // Center the title
      y += 20;
      // Divider line below title
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(14, y - 10, 196, y - 10);



      // Active Learning Summary Section
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Active Learning Summary", 14, y);
      y += 15;

      const copusEvals = evaluations.filter((e) => ["copus_1", "copus_2", "copus_3"].includes(e.evaluation_type));
      const avgActiveLearning = (() => {
        let sum = 0, count = 0;
        copusEvals.forEach((ev) => {
          const perc = evaluationTallies[ev.id]?.activeLearningPercentage;
          if (typeof perc === "number") { sum += perc; count++; }
        });
        return count > 0 ? sum / count : 0;
      })();

      // Draw main gauge chart area
      const gaugeX = 20;
      const gaugeY = y;
      
      // Draw gauge background
      doc.setFillColor(248, 248, 248);
      doc.roundedRect(14, y, 180, 80, 5, 5, 'F');
      
      // Draw gauge chart (vector)
      const gCenterX = 1 + 45;
      const gCenterY = y + 40; // center of gauge circle
      const gRadius = 16;
      const gLine = 1;
      const gSteps = 100;

      // Background semi-circle (light gray)
      doc.setDrawColor(230, 232, 235);
      doc.setLineWidth(gLine);
      for (let i = 0; i < gSteps; i++) {
        const t1 = Math.PI - (i / gSteps) * Math.PI;      // from PI to 0
        const t2 = Math.PI - ((i + 1) / gSteps) * Math.PI;
        const x1 = gCenterX + Math.cos(t1) * gRadius;
        const y1 = gCenterY - Math.sin(t1) * gRadius;
        const x2 = gCenterX + Math.cos(t2) * gRadius;
        const y2 = gCenterY - Math.sin(t2) * gRadius;
        doc.line(x1, y1, x2, y2);
      }

      // Foreground value arc (green)
      const gFrac = Math.max(0, Math.min(1, avgActiveLearning / 100));
      const gValSteps = Math.floor(gSteps * gFrac);
      // Apply threshold color (red <40, yellow <70, else green)
      let avgCol: [number, number, number] = [34, 197, 94];
      if (gFrac < 0.4) avgCol = [239, 68, 68];
      else if (gFrac < 0.7) avgCol = [245, 158, 11];
      doc.setDrawColor(avgCol[0], avgCol[1], avgCol[2]);
      doc.setLineWidth(gLine);
      for (let i = 0; i < gValSteps; i++) {
        const t1 = Math.PI - (i / gSteps) * Math.PI;
        const t2 = Math.PI - ((i + 1) / gSteps) * Math.PI;
        const x1 = gCenterX + Math.cos(t1) * gRadius;
        const y1 = gCenterY - Math.sin(t1) * gRadius;
        const x2 = gCenterX + Math.cos(t2) * gRadius;
        const y2 = gCenterY - Math.sin(t2) * gRadius;
        doc.line(x1, y1, x2, y2);
      }

      // Gauge center text
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      const gText = `${avgActiveLearning.toFixed(2)}%`;
      const gTextWidth = doc.getTextWidth(gText);
      doc.text(gText, gCenterX - gTextWidth / 2, gCenterY + 5);

      // Gauge label under center
      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      const gLbl = "Active Learning % (Avg)";
      const gLblW = doc.getTextWidth(gLbl);
      doc.text(gLbl, gCenterX - gLblW / 2, gCenterY + 16);

      // Add explanation text to the right of the gauge (avoid overlap)
      const textX = gCenterX + gRadius + 15; // dynamic right column start
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      const labelTxt = `Active Learning % (Avg): `;
      doc.text(labelTxt, textX, y + 15);
      {
        const avgColTxt: [number, number, number] = gFrac < 0.4 ? [239, 68, 68] : (gFrac < 0.7 ? [245, 158, 11] : [34, 197, 94]);
        doc.setTextColor(avgColTxt[0], avgColTxt[1], avgColTxt[2]);
      }
      doc.text(`${avgActiveLearning.toFixed(2)}%`, textX + doc.getTextWidth(labelTxt) + 4, y + 15);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text("- Computed as the percent of timestamps with active teacher or student", textX, y + 28);
      doc.text("  activities.", textX, y + 38);
      doc.text("- Active learning includes group work, discussions, questions,", textX, y + 48);
      doc.text("  presentations, and related interactions.", textX, y + 58);

      y += 105;

      // Active Learning Percentage for Each COPUS Section
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Active Learning Percentage for Each COPUS", 14, y);
      y += 20;

      // Draw gauge background
      doc.setFillColor(248, 248, 248);
      doc.roundedRect(14, y, 150, 70, 5, 5, 'F');

      // Draw per-COPUS gauges (vector)
      const miniRadius = 16;
      const miniLine = 1;
      const gaugeSpacing = 8;
      const gCount = copusEvals.length || 3;
      const gTotalWidth = (2 * miniRadius) * gCount + gaugeSpacing * (gCount - 1);
      const gStartX = Math.max(14, (210 - gTotalWidth) / 2);
      const gBaseY = y + 30; // baseline for gauge centers (tighter)

      copusEvals.forEach((copuseval, idx) => {
        const perc = evaluationTallies[copuseval.id]?.activeLearningPercentage ?? 0;
        let col: [number, number, number] = [34, 197, 94]; // green
        if (perc < 40) col = [239, 68, 68]; // red
        else if (perc < 70) col = [245, 158, 11]; // yellow

        const cx = gStartX + idx * (2 * miniRadius + gaugeSpacing);
        const cy = gBaseY;

        // background semi-circle
        doc.setDrawColor(230, 232, 235);
        doc.setLineWidth(miniLine);
        for (let i = 0; i < 100; i++) {
          const t1 = Math.PI - (i / 100) * Math.PI;
          const t2 = Math.PI - ((i + 1) / 100) * Math.PI;
          const x1 = cx + Math.cos(t1) * miniRadius;
          const y1 = cy - Math.sin(t1) * miniRadius;
          const x2 = cx + Math.cos(t2) * miniRadius;
          const y2 = cy - Math.sin(t2) * miniRadius;
          doc.line(x1, y1, x2, y2);
        }

        // value semi-circle
        const frac = Math.max(0, Math.min(1, perc / 100));
        const steps = Math.floor(100 * frac);
        doc.setDrawColor(col[0], col[1], col[2]);
        doc.setLineWidth(miniLine);
        for (let i = 0; i < steps; i++) {
          const t1 = Math.PI - (i / 100) * Math.PI;
          const t2 = Math.PI - ((i + 1) / 100) * Math.PI;
          const x1 = cx + Math.cos(t1) * miniRadius;
          const y1 = cy - Math.sin(t1) * miniRadius;
          const x2 = cx + Math.cos(t2) * miniRadius;
          const y2 = cy - Math.sin(t2) * miniRadius;
          doc.line(x1, y1, x2, y2);
        }

        // center text
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        const t = `${perc.toFixed(2)}%`;
        const tw = doc.getTextWidth(t);
        doc.text(t, cx - tw / 2, cy + 4);

        // label under
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        const lbl = `COPUS ${idx + 1}`;
        const lw = doc.getTextWidth(lbl);
        doc.text(lbl, cx - lw / 2, cy + 16);
      });

      y += 48;

      // Student Activities Table - start on a new page to avoid cutting and improve spacing from previous section
      doc.addPage();
      y = 24;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Student Activities (Average across 3 COPUS Evaluations)", 14, y);
      y += 10;

      const studentData = studentOptions.map((activity) => [
        activity,
        (() => {
          let sum = 0, count = 0;
          copusEvals.forEach((ev) => {
            const tallies = evaluationTallies[ev.id]?.studentTallies;
            if (tallies && typeof tallies[activity]?.count === "number") {
              sum += tallies[activity].count;
              count++;
            }
          });
          return count > 0 ? (sum / count).toFixed(2) : "0.00";
        })()
      ]);

      autoTable(doc, {
        startY: y,
        head: [["Activity", "Student Avg"]],
        body: studentData,
        theme: 'grid',
        margin: { left: 20, right: 20 },
        headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3, lineColor: [230, 230, 230] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 110 },
          1: { cellWidth: 35, halign: 'right' }
        }
      });

      y = (doc as any).lastAutoTable.finalY + 15;

      // Check if we need a new page (tighter threshold to avoid cramped sections)
      if (y > 220) {
        doc.addPage();
        y = 20;
      }

      // Teacher Activities Table
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Teacher Activities (Average across 3 COPUS Evaluations)", 14, y);
      y += 10;

      const teacherData = teacherOptions.map((activity) => [
        activity,
        (() => {
          let sum = 0, count = 0;
          copusEvals.forEach((ev) => {
            const tallies = evaluationTallies[ev.id]?.teacherTallies;
            if (tallies && typeof tallies[activity]?.count === "number") {
              sum += tallies[activity].count;
              count++;
            }
          });
          return count > 0 ? (sum / count).toFixed(2) : "0.00";
        })()
      ]);

      autoTable(doc, {
        startY: y,
        head: [["Activity", "Teacher Avg"]],
        body: teacherData,
        theme: 'grid',
        margin: { left: 20, right: 20 },
        headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3, lineColor: [230, 230, 230] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 110 },
          1: { cellWidth: 35, halign: 'right' }
        }
      });

      // Footer with page numbers and date
      const pageCount = (doc as any).getNumberOfPages?.() || (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        (doc as any).setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, 196, 290, { align: 'right' } as any);
        doc.text(new Date().toLocaleDateString(), 14, 290);
      }

      doc.save("copus-summary.pdf");
    };

    return (
      <button
        className="btn btn-primary mb-4 float-right"
        onClick={handleExportPDF}
        ref={ref}
      >
        Save as PDF
      </button>
    );
  }
);

export default PDFButton;
