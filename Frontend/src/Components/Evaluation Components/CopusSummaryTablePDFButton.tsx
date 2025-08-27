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
      doc.setLineWidth(8);
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
        
        doc.setLineWidth(8);
        
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
      doc.roundedRect(14, y, 180, 60, 5, 5, 'F');
      
      // Add gauge chart if available
      if (chartImages?.gauge && chartImages.gauge.startsWith('data:image/png')) {
        try {
          doc.addImage(chartImages.gauge, 'PNG', 20, y + 5, 50, 30);
        } catch (error) {
          console.warn('Could not add gauge image:', error);
        }
      } else {
        // Draw a simple gauge representation
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 165, 0); // Orange color for the percentage
        doc.text(`${avgActiveLearning.toFixed(2)}%`, 25, y + 25);
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text("Active Learning %", 25, y + 35);
        doc.text("(Avg)", 25, y + 45);
      }

      // Add explanation text
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(`Active Learning % (Avg): `, 80, y + 15);
      doc.setTextColor(255, 165, 0);
      doc.text(`${avgActiveLearning.toFixed(2)}%`, 150, y + 15);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text("• Computed as the percent of timestamps with active teacher or student", 80, y + 28);
      doc.text("  activities.", 80, y + 38);
      doc.text("• Active learning includes group work, discussions, questions,", 80, y + 48);
      doc.text("  presentations, and related interactions.", 80, y + 58);

      y += 75;

      // Active Learning Percentage for Each COPUS Section
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Active Learning Percentage for Each COPUS", 14, y);
      y += 20;

      // Draw circular progress indicators
      const circleRadius = 15;
      const circleSpacing = 60;
      const startX = 30;
      
      copusEvals.forEach((copuseval, idx) => {
        const perc = evaluationTallies[copuseval.id]?.activeLearningPercentage ?? 0;
        const color = perc >= 70 ? 'green' : perc >= 40 ? 'yellow' : 'red';
        const label = `COPUS ${idx + 1}: ${perc.toFixed(2)}%`;
        
        drawCircularProgress(doc, startX + (idx * circleSpacing), y, circleRadius, perc, color, label);
      });

      y += 50;

      // Student Activities Table
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
        headStyles: {
          fillColor: [37, 99, 235], // Blue header
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 120 },
          1: { cellWidth: 40, halign: 'right' }
        }
      });

      y = (doc as any).lastAutoTable.finalY + 15;

      // Check if we need a new page
      if (y > 250) {
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
        headStyles: {
          fillColor: [37, 99, 235], // Blue header
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 120 },
          1: { cellWidth: 40, halign: 'right' }
        }
      });

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
