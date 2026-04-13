document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('extractText').addEventListener('click', function() {
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
                    promises.push(pdf.getPage(pageNum).then(page => page.getTextContent().then(textContent => textContent.items.map(item => item.str).join(' '))));
                }

                Promise.all(promises).then(function(pagesText) {
                    let finalText = pagesText.join('\n');
                    const structuredData = parseFuelData(finalText);
                    console.log(structuredData);
                    // Populate form fields with the structured data
                    populateFuelData(structuredData);
                });
            }, function(reason) {
                console.error(reason);
            });
        };

        fileReader.readAsArrayBuffer(file);
    });
});

function parseFuelData(text) {
    const startMarker = "Pump Totals Report";
    const endMarker = "Grand Total";
    const startIndex = text.indexOf(startMarker);
    const endIndex = text.indexOf(endMarker, startIndex);

    // Extract the relevant section of text
    const relevantText = text.substring(startIndex, endIndex);

    const data = [];
    // Now, we work with relevantText, which is the section of interest
    const positions = relevantText.split(/Fueling Position\s+\d+/).slice(1);

    positions.forEach((pos, index) => {
        const positionNumber = index + 1; // Position numbering starts at 1
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


function populateFuelData(fuelDataArray) {
    let missingFields = []; // Array to accumulate missing fields

    // Formatter for Close Money with dollar sign, commas, and three decimal places
    const moneyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
    });

    // Formatter for Close Volume with commas and three decimal places
    const volumeFormatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
        useGrouping: true, // This enables comma separation
    });

    fuelDataArray.forEach(item => {
        const { "Fueling Position": position, "Grade Name": gradeName, "Close Money": closeMoney, "Close Volume": closeVolume } = item;
        const normalizedGradeName = gradeName.toLowerCase().replace(/\s+/g, '-');

        const closeMoneyInputId = `fuel-position-${position}-${normalizedGradeName}-close-money`;
        const closeVolumeInputId = `fuel-position-${position}-${normalizedGradeName}-close-volume`;

        const closeMoneyInput = document.getElementById(closeMoneyInputId);
        const closeVolumeInput = document.getElementById(closeVolumeInputId);

        if (!closeMoneyInput || !closeVolumeInput) {
            // Record the missing field for reporting
            missingFields.push(`Fuel Position ${position} - Grade ${gradeName}`);
        } else {
            // Format and populate the input fields if they exist
            if (closeMoneyInput) closeMoneyInput.value = moneyFormatter.format(closeMoney);
            if (closeVolumeInput) closeVolumeInput.value = volumeFormatter.format(closeVolume);
        }
    });

    // Display an error message if there are missing fields
    if (missingFields.length > 0) {
        alert("Fields Not Entered:\n" + missingFields.join("\n"));
    }
}




/*

//below is for an unedited numeric value version of populatedFuelData function 

function populateFuelData(fuelDataArray) {
    let missingFields = []; // Array to accumulate missing fields

    fuelDataArray.forEach(item => {
        const { "Fueling Position": position, "Grade Name": gradeName, "Close Money": closeMoney, "Close Volume": closeVolume } = item;
        const normalizedGradeName = gradeName.toLowerCase().replace(/\s+/g, '-');

        const closeMoneyInputId = `fuel-position-${position}-${normalizedGradeName}-close-money`;
        const closeVolumeInputId = `fuel-position-${position}-${normalizedGradeName}-close-volume`;

        const closeMoneyInput = document.getElementById(closeMoneyInputId);
        const closeVolumeInput = document.getElementById(closeVolumeInputId);

        // Check if inputs exist for the current item, if not, record the missing field
        if (!closeMoneyInput || !closeVolumeInput) {
            missingFields.push(`Fuel Position ${position} - Grade ${gradeName}`);
        } else {
            // Proceed to fill in the fields as normal if they exist
            if (closeMoneyInput) closeMoneyInput.value = closeMoney.toFixed(2);
            if (closeVolumeInput) closeVolumeInput.value = closeVolume.toFixed(2);
        }
    });

    // Display an error if there are missing fields
    if (missingFields.length > 0) {
        alert("Fields Not Entered:\n" + missingFields.join("\n"));
    }
}
*/












