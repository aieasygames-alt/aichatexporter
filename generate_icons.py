#!/usr/bin/env python3
"""
Generate PNG icons for AI Chat Exporter extension
Creates simple colored square icons as placeholders
"""

import base64
import zlib
import struct

def create_png(width, height, color=(66, 133, 244)):
    """
    Create a simple solid color PNG image
    color: tuple of (R, G, B) values
    """
    def png_chunk(chunk_type, data):
        chunk_len = struct.pack('>I', len(data))
        chunk_crc = struct.pack('>I', zlib.crc32(chunk_type + data) & 0xffffffff)
        return chunk_len + chunk_type + data + chunk_crc

    # PNG signature
    signature = b'\x89PNG\r\n\x1a\n'

    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    ihdr = png_chunk(b'IHDR', ihdr_data)

    # IDAT chunk (image data)
    raw_data = b''
    r, g, b = color
    for y in range(height):
        raw_data += b'\x00'  # filter byte
        for x in range(width):
            # Create gradient effect
            progress = (x + y) / (width + height)
            r_grad = int(r + (102 - r) * progress)  # 66 -> 102
            g_grad = int(g + (126 - g) * progress)  # 133 -> 126
            b_grad = int(b + (234 - b) * progress)  # 244 -> 234
            raw_data += bytes([r_grad, g_grad, b_grad])

    compressed = zlib.compress(raw_data, 9)
    idat = png_chunk(b'IDAT', compressed)

    # IEND chunk
    iend = png_chunk(b'IEND', b'')

    return signature + ihdr + idat + iend

def create_icon_png(size):
    """Create an icon with a simple design"""
    # Create a more sophisticated icon with rounded corners effect
    # For simplicity, we'll create a gradient square

    def png_chunk(chunk_type, data):
        chunk_len = struct.pack('>I', len(data))
        chunk_crc = struct.pack('>I', zlib.crc32(chunk_type + data) & 0xffffffff)
        return chunk_len + chunk_type + data + chunk_crc

    signature = b'\x89PNG\r\n\x1a\n'

    ihdr_data = struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)  # RGBA
    ihdr = png_chunk(b'IHDR', ihdr_data)

    raw_data = b''
    center = size / 2
    radius = size * 0.8 / 2  # 80% fill

    for y in range(size):
        raw_data += b'\x00'  # filter byte
        for x in range(size):
            # Distance from center
            dx = x - center
            dy = y - center
            dist = (dx * dx + dy * dy) ** 0.5

            # Gradient colors
            progress = (x + y) / (size * 2)
            r = int(66 + (102 - 66) * progress)
            g = int(133 + (126 - 133) * progress)
            b = int(244 + (234 - 244) * progress)

            # Alpha for rounded corners (simplified square)
            if dist > radius:
                a = 0
            else:
                a = 255

            raw_data += bytes([r, g, b, a])

    compressed = zlib.compress(raw_data, 9)
    idat = png_chunk(b'IDAT', compressed)
    iend = png_chunk(b'IEND', b'')

    return signature + ihdr + idat + iend

if __name__ == '__main__':
    import os

    # Create icons directory if it doesn't exist
    icons_dir = os.path.dirname(os.path.abspath(__file__))
    icons_dir = os.path.join(icons_dir, 'icons')
    os.makedirs(icons_dir, exist_ok=True)

    # Generate icons
    for size in [16, 48, 128]:
        png_data = create_icon_png(size)
        filename = os.path.join(icons_dir, f'icon{size}.png')
        with open(filename, 'wb') as f:
            f.write(png_data)
        print(f'Created {filename}')

    print('Done! Icons generated successfully.')
