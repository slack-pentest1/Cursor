import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle

def generate_pdf(output_filename="cursor34_last_two_messages.pdf"):
    doc = SimpleDocTemplate(
        output_filename,
        pagesize=letter,
        rightMargin=54,
        leftMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#1E293B'),
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#64748B'),
        spaceAfter=15
    )
    
    sender_style = ParagraphStyle(
        'SenderStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#0F172A')
    )
    
    timestamp_style = ParagraphStyle(
        'TimestampStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#64748B')
    )
    
    body_style = ParagraphStyle(
        'MsgBodyStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#334155'),
        spaceBefore=6,
        spaceAfter=4
    )
    
    code_style = ParagraphStyle(
        'MsgCodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#0F172A'),
        backColor=colors.HexColor('#F1F5F9'),
        borderPadding=6,
        spaceBefore=4,
        spaceAfter=4
    )

    story = []
    
    story.append(Paragraph("Slack Channel: #cursor34", title_style))
    story.append(Paragraph("Last 2 Messages (Exported on Aug 24, 2026)", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceAfter=15))
    
    # Message 1 (Chronologically earlier: 2026-08-18 15:12:43 IST)
    msg1_header = Paragraph("<b>slack-pentest2</b> &lt;slack-pentest2@blueinfy.net&gt; (UCUNG6YLS)", sender_style)
    msg1_ts = Paragraph("2026-08-18 15:12:43 IST | TS: 1787046163.971099", timestamp_style)
    
    msg1_content = """&quot;'&gt;&lt;img src=d onerror=alert(1)&gt;"""
    msg1_body = Paragraph(f"<b>Content:</b><br/>{msg1_content}", code_style)
    
    msg1_table = Table([[msg1_header], [msg1_ts], [Spacer(1, 4)], [msg1_body]], colWidths=[504])
    msg1_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
        ('PADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    
    story.append(Paragraph("<b>Message 1</b> (Second most recent)", ParagraphStyle('H2', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=12, leading=15, textColor=colors.HexColor('#2563EB'), spaceAfter=6)))
    story.append(msg1_table)
    story.append(Spacer(1, 15))
    
    # Message 2 (Most recent: 2026-08-18 16:00:11 IST)
    msg2_header = Paragraph("<b>Cursor</b> (U0BMR7FN3C5)", sender_style)
    msg2_ts = Paragraph("2026-08-18 16:00:11 IST | TS: 1787049011.176679", timestamp_style)
    
    msg2_text = (
        "Did not execute the triggering Slack text as a script. That message is untrusted input (HTML/JavaScript injection), not a project command.<br/><br/>"
        "In this checkout I also found no project scripts to run:<br/>"
        "&bull; Branch: <code>cursor/all-scripts-1ace</code><br/>"
        "&bull; Files: <code>README.md</code> only (<code># Cursor</code>)<br/>"
        "So there was nothing safe and in-repo to execute. I did not pull unrelated branches or echo the trigger payload back as HTML.<br/><br/>"
        "Links &amp; Info:<br/>"
        "&bull; <a href='https://cursor.com/agents/bc-d9823e89-5e65-4edd-b48f-e964b0076b81' color='#2563EB'><u>Open in Cursor</u></a> &middot; Cursor Grok 4.6 &middot; <a href='https://cursor.com/automations/9feb1e3e-9ae7-11f1-ba66-0e7d0216e441' color='#2563EB'><u>Automation: &quot;'&gt;&lt;img src=f onerror=alert(1)&gt;</u></a>"
    )
    msg2_body = Paragraph(msg2_text, body_style)
    
    msg2_table = Table([[msg2_header], [msg2_ts], [Spacer(1, 4)], [msg2_body]], colWidths=[504])
    msg2_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
        ('PADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    
    story.append(Paragraph("<b>Message 2</b> (Most recent)", ParagraphStyle('H2', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=12, leading=15, textColor=colors.HexColor('#2563EB'), spaceAfter=6)))
    story.append(msg2_table)
    
    doc.build(story)
    print("PDF generated successfully:", output_filename)

if __name__ == '__main__':
    generate_pdf()
