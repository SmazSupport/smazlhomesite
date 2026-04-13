//script.js
document.addEventListener('DOMContentLoaded', function() {
    const extractTextButton = document.getElementById('extractText');
    const nextParseButton = document.getElementById('nextParse');
    const nextTableButton = document.getElementById('nextTable');
    const pdfTextSection = document.getElementById('textSection');
    const parseDataSection = document.getElementById('parseSection');
    const tableSection = document.getElementById('tableSection');
    const pdfTextContainer = document.getElementById('pdfText');
    const jsonDataContainer = document.getElementById('jsonData');
    const tableContentContainer = document.getElementById('tableContent');

    extractTextButton.addEventListener('click', function() {
        var fileInput = document.getElementById('pdfUpload');
        var file = fileInput.files[0];

        if (!file || file.type !== 'application/pdf') {
            alert('Please upload a PDF file.');
            return;
        }

        var fileReader = new FileReader();
        fileReader.onload = function() {
            var typedarray = new Uint8Array(this.result);
            pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
                console.log(`PDF loaded with ${pdf.numPages} pages`);
                let promises = [];
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    promises.push(pdf.getPage(pageNum).then(function(page) {
                        return page.getTextContent().then(function(textContent) {
                            return textContent.items.map(item => item.str).join(' ');
                        });
                    }));
                }

                Promise.all(promises).then(function(pagesText) {
                    let finalText = pagesText.join('\n');
                    pdfTextContainer.textContent = finalText;
                    pdfTextSection.style.display = '';
                    nextParseButton.style.display = '';
                });
            }, function(reason) {
                console.error(reason);
            });
        };
        fileReader.readAsArrayBuffer(file);
    });

    nextParseButton.addEventListener('click', function() {
        const finalText = pdfTextContainer.textContent;
        const structuredData = parseFuelData(finalText);
        jsonDataContainer.textContent = JSON.stringify(structuredData, null, 2);
        parseDataSection.style.display = '';
        nextTableButton.style.display = '';
    });

    nextTableButton.addEventListener('click', function() {
        const structuredData = JSON.parse(jsonDataContainer.textContent);
        buildDataTable(structuredData);
        tableSection.style.display = '';
        tableContentContainer.style.display = '';
    });
});

function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    section.style.display = section.style.display === 'none' ? '' : 'none';
}



function parseFuelData(text) {
    const startMarker = "Pump Totals Report";
    const endMarker = "Grand Total";
    const startIndex = text.indexOf(startMarker);
    const endIndex = text.indexOf(endMarker, startIndex);

    const relevantText = text.substring(startIndex, endIndex);

    const data = [];
    const positions = relevantText.split(/Fueling Position\s+\d+/).slice(1);

    positions.forEach((pos, index) => {
        const positionNumber = index + 1;
        const gradeSegments = pos.trim().split(/(REGULAR|PLUS|SUPER|DIESEL|Total)/).slice(1);

        for (let i = 0; i < gradeSegments.length; i += 2) {
            const gradeName = gradeSegments[i].trim();
            const valuesStr = gradeSegments[i + 1].trim();
            const values = valuesStr.split(/\s+/);

            if (values.length >= 6) {
                const entry = {
                    "Fueling Position": positionNumber,
                    "Grade Name": gradeName,
                    "Close Money": parseFloat(values[0].replace(/[\$,]/g, '')),
                    "Open Money": parseFloat(values[1].replace(/[\$,]/g, '')),
                    "Metered Money": parseFloat(values[2].replace(/[\$,]/g, '')),
                    "Close Volume": parseFloat(values[3].replace(/[\$,]/g, '')),
                    "Open Volume": parseFloat(values[4].replace(/[\$,]/g, '')),
                    "Metered Volume": parseFloat(values[5].replace(/[\$,]/g, ''))
                };
                data.push(entry);
            }
        }
    });

    return data;
}

function buildDataTable(data) {
    const tableContainer = document.getElementById('tableContent');
    tableContainer.innerHTML = ''; // Clear any existing table content

    const table = document.createElement('table');
    table.style.width = '100%';
    table.setAttribute('border', '1');

    const thead = document.createElement('thead');
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    // Create header row
    const headerRow = document.createElement('tr');
    ["Fueling Position", "Grade Name", "Close Money", "Open Money", "Metered Money", "Close Volume", "Open Volume", "Metered Volume"].forEach(headerText => {
        const headerCell = document.createElement('th');
        headerCell.textContent = headerText;
        headerRow.appendChild(headerCell);
    });
    thead.appendChild(headerRow);

    // Fill table body with data
    data.forEach(item => {
        const row = document.createElement('tr');
        Object.values(item).forEach(value => {
            const cell = document.createElement('td');
            cell.textContent = value;
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });

    tableContainer.appendChild(table);
}


