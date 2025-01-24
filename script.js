function validateInput(input) {
    return /^[01]+$/.test(input);
}

function applyRule110(above) {
    const rules = {
        '111': 0,
        '110': 1,
        '101': 1,
        '100': 0,
        '011': 1,
        '010': 1,
        '001': 1,
        '000': 0
    };
    
    const result = [];
    for (let i = 0; i < above.length; i++) {
        const left = above[(i - 1 + above.length) % above.length];
        const center = above[i];
        const right = above[(i + 1) % above.length];
        const pattern = `${left}${center}${right}`;
        result.push(rules[pattern]);
    }
    return result;
}

function getCellShape(x, y, cellSize, filled) {
    const style = document.getElementById('styleSelect').value;
    const showEmpty = document.querySelector('input[name="showEmpty"]:checked').value === 'yes';
    
    // If it's an empty cell (filled === false) and we don't want to show empty cells
    if (!filled && !showEmpty) {
        return '';
    }
    
    const halfSize = cellSize / 2;
    const centerX = x * cellSize + halfSize;
    const centerY = y * cellSize + halfSize;
    
    switch (style) {
        case 'circles':
            if (filled) {
                return `<circle cx="${centerX}" cy="${centerY}" r="${halfSize * 0.8}" stroke="black" stroke-width="1" />`;
            } else {
                return showEmpty ? `<circle cx="${centerX}" cy="${centerY}" r="${halfSize * 0.8}" stroke="black" stroke-width="1" fill="none" />` : '';
            }
        
        case 'diamonds':
            const diamond = `M ${centerX} ${y * cellSize + 2}
                           L ${(x + 1) * cellSize - 2} ${centerY}
                           L ${centerX} ${(y + 1) * cellSize - 2}
                           L ${x * cellSize + 2} ${centerY} Z`;
            if (filled) {
                return `<path d="${diamond}" stroke="black" stroke-width="1" />`;
            } else {
                return showEmpty ? `<path d="${diamond}" stroke="black" stroke-width="1" fill="none" />` : '';
            }
        
        case 'minimal':
            return filled ? `<circle cx="${centerX}" cy="${centerY}" r="${halfSize * 0.3}" stroke="black" stroke-width="1" />` : '';
        
        case 'squares':
        default:
            if (filled) {
                return `<rect x="${x * cellSize + 1}" y="${y * cellSize + 1}" 
                       width="${cellSize - 2}" height="${cellSize - 2}" 
                       stroke="black" stroke-width="1" />`;
            } else {
                return showEmpty ? `<rect x="${x * cellSize + 1}" y="${y * cellSize + 1}" 
                       width="${cellSize - 2}" height="${cellSize - 2}" 
                       stroke="black" stroke-width="1" fill="none" />` : '';
            }
    }
}

function generatePattern() {
    const input = document.getElementById('binaryInput').value;
    if (!validateInput(input)) {
        alert('Please enter only 1s and 0s');
        return;
    }

    const cellSize = 10;
    const generations = 50;
    const pattern = [Array.from(input).map(Number)];

    // Generate subsequent rows
    for (let i = 0; i < generations - 1; i++) {
        pattern.push(applyRule110(pattern[i]));
    }

    // Create SVG
    const width = pattern[0].length * cellSize;
    const height = generations * cellSize;
    const svg = `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
            ${pattern.map((row, y) => 
                row.map((cell, x) => 
                    getCellShape(x, y, cellSize, cell === 1)
                ).join('')
            ).join('')}
        </svg>
    `;

    document.getElementById('svgContainer').innerHTML = svg;
    document.getElementById('downloadContainer').style.display = 'block';
}

function downloadSVG() {
    // Get the SVG content
    const svgElement = document.querySelector('svg');
    
    // Add XML declaration and SVG namespace
    const svgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" 
     xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${svgElement.getAttribute('width')}"
     height="${svgElement.getAttribute('height')}"
     viewBox="${svgElement.getAttribute('viewBox')}">
     ${svgElement.innerHTML}
</svg>`;

    // Create blob and download link
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = window.URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'rule110_pattern.svg';
    
    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    window.URL.revokeObjectURL(url);
} 