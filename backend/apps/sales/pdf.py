"""
Minimal, dependency-free PDF generation. Produces a one-page PDF with a title
and a list of text lines — good enough to stand in for invoice/receipt
documents until real templated PDF generation (Module 12) lands.
"""


def _escape(text):
    return text.replace('\\', r'\\').replace('(', r'\(').replace(')', r'\)')


def build_stub_pdf(title, lines):
    text_ops = [f'BT /F1 16 Tf 50 760 Td ({_escape(title)}) Tj ET']
    y = 720
    for line in lines:
        text_ops.append(f'BT /F1 11 Tf 50 {y} Td ({_escape(line)}) Tj ET')
        y -= 20
    content = '\n'.join(text_ops).encode('latin-1', errors='replace')

    objects = [
        b'<< /Type /Catalog /Pages 2 0 R >>',
        b'<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        b'<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> '
        b'/MediaBox [0 0 612 792] /Contents 5 0 R >>',
        b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
        b'<< /Length %d >>\nstream\n' % len(content) + content + b'\nendstream',
    ]

    buf = bytearray(b'%PDF-1.4\n')
    offsets = []
    for index, body in enumerate(objects, start=1):
        offsets.append(len(buf))
        buf += f'{index} 0 obj\n'.encode('latin-1')
        buf += body
        buf += b'\nendobj\n'

    xref_offset = len(buf)
    buf += f'xref\n0 {len(objects) + 1}\n'.encode('latin-1')
    buf += b'0000000000 65535 f \n'
    for offset in offsets:
        buf += f'{offset:010d} 00000 n \n'.encode('latin-1')
    buf += (
        f'trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\n'
        f'startxref\n{xref_offset}\n%%EOF'
    ).encode('latin-1')
    return bytes(buf)
