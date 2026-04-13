document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('extractText').addEventListener('click', function() {
        const fileInput = document.getElementById('pdfUpload'); // Adjust this ID as necessary
        const file = fileInput.files[0];

        if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.js';
        } else {
            console.error("PDF.js library not loaded!");
            return;
        }

        if (!file) {
            console.error("No file selected.");
            return;
        }

        if (file.type === 'application/pdf') {
            // Process PDF file
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
                        populateFuelData(structuredData);
                    });
                }, function(reason) {
                    console.error(reason);
                });
            };
            fileReader.readAsArrayBuffer(file);
        } else {
            console.error("Unsupported file type.");
        }
    });
});


// Function to update form values based on JSON data
function updateFormWithJsonData(jsonData) {
    // Iterate over each entry in the JSON data
    jsonData.forEach(entry => {
        // Map the "Grade Name" from JSON to the equivalent used in the HTML form
        let grade = mapGradeNameToHtmlForm(entry['Grade Name']);
        
        // Find the "Fueling Position ID" based on the "Fueling Position" number
        let fuelPositionID = findFuelPositionIdByNumber(entry['Fueling Position']);

        if (fuelPositionID && grade) {
            fillDollarNowByPositionID(fuelPositionID, grade, entry['Close Money']);
            fillGallonsNowByPositionID(fuelPositionID, grade, entry['Close Volume']);
        } else {
            console.log(`Cannot find inputs for Fuel Position: ${entry['Fueling Position']}, Grade: ${entry['Grade Name']}`);
        }
    });
}

function getGradeMapping() {
    return {
        'REGULAR': 'Unleaded',
        'PLUS': 'Plus',
        'SUPER': 'Super',
        'DIESEL': 'Diesel',
        // Add more mappings if necessary
    };
}

function mapGradeNameToHtmlForm(gradeNameFromJson) {
    const gradeMap = getGradeMapping();
    return gradeMap[gradeNameFromJson.toUpperCase()] || gradeNameFromJson;
}

// Helper function to find Fueling Position ID by fueling position number
function findFuelPositionIdByNumber(fuelPositionNumber) {
    const fuelPositionSpans = document.querySelectorAll('span.boldTextStyle');
    const pattern = new RegExp(`Fueling\\s*Position\\s*${fuelPositionNumber}`, 'i');

    for (let span of fuelPositionSpans) {
        const normalizedText = span.textContent.replace(/\s+/g, ' ').trim();
        if (pattern.test(normalizedText)) {
            const fuelPositionInput = span.closest('td').querySelector('input[name="FuelingPositionReading.fuelingPositionID"]');
            if (fuelPositionInput) {
                return fuelPositionInput.value; // Return the ID once found
            }
        }
    }
    console.log(`Fuel Position "${fuelPositionNumber}" not found.`);
    return null; // Return null if the position is not found
}


// Function to update "Gallons Now" based on position ID
function fillGallonsNowByPositionID(fuelPositionID, grade, newGallonValue) {
    // Find the grade input within the same fueling position based on FuelingPositionID
    const matchingGradeInput = findMatchingGradeInput(fuelPositionID, grade);

    if (matchingGradeInput) {
        // Find the "Gallons Now" input and update its value
        const gallonsNowInput = matchingGradeInput.closest('tr').querySelector(`input[name="FuelingPositionProductReading.insideGallonReadingNow"]`);
        if (gallonsNowInput) {
            gallonsNowInput.value = newGallonValue;
            console.log(`Gallons value set for Fuel Position ID ${fuelPositionID}, Grade ${grade}: ${newGallonValue}`);
            return true;
        } else {
            console.log(`"Gallons Now" input not found for Grade ${grade} with Fuel Position ID ${fuelPositionID}.`);
        }
    } else {
        console.log(`Grade ${grade} not found within Fuel Position ID ${fuelPositionID}.`);
    }
    return false
}

function fillDollarNowByPositionID(fuelPositionID, grade, newValue) {
    // Find the grade input within the same fueling position based on FuelingPositionID
    const matchingGradeInput = findMatchingGradeInput(fuelPositionID, grade);
    

    if (matchingGradeInput) {
        // Found the matching grade within the correct fueling position
        // Now find the "Dollar Now" input
        const dollarNowInput = matchingGradeInput.closest('tr').querySelector(`input[name="FuelingPositionProductReading.insideDollarReadingNow"]`);
        
        if (dollarNowInput) {
            // Set the new value for "Dollar Now"
            dollarNowInput.value = newValue;
            console.log(`Dollar value set for Fuel Position ID ${fuelPositionID}, Grade ${grade}: ${newValue}`);
            return true;
        } else {
            console.log(`"Dollar Now" input not found for Grade ${grade} with Fuel Position ID ${fuelPositionID}.`);

        }
    } else {
        console.log(`Grade ${grade} not found within Fuel Position ID ${fuelPositionID}.`);
    }
    return false;
}

function findMatchingGradeInput(fuelPositionID, grade) {
    const gradeInputs = Array.from(document.querySelectorAll(`input[name="FuelingPositionProductReading.fuelingPositionID"]`));
    return gradeInputs.find(input =>
        input.value == fuelPositionID &&
        input.closest('tr').querySelector(`span[onclick*="toggleTest"]`).textContent.trim() === grade
    );
}

function populateFuelData(fuelDataArray) {
    let missingFields = []; // Accumulate messages about missing fields

    fuelDataArray.forEach(item => {
        const { "Fueling Position": position, "Grade Name": gradeName, "Close Money": closeMoney, "Close Volume": closeVolume } = item;
        const grade = mapGradeNameToHtmlForm(gradeName);
        const fuelPositionID = findFuelPositionIdByNumber(position);

        if (fuelPositionID) {
            const dollarSuccess = fillDollarNowByPositionID(fuelPositionID, grade, closeMoney);
            const gallonSuccess = fillGallonsNowByPositionID(fuelPositionID, grade, closeVolume);

            if (!dollarSuccess || !gallonSuccess) {
                missingFields.push(`Missing: Fuel Position ${position}, Grade ${gradeName}`);
            }
        } else {
            missingFields.push(`Fuel Position ID not found for position ${position}`);
        }
    });

    // Alert the user if there are any missing fields
    if (missingFields.length > 0) {
        alert("Some data could not be populated into the form:\n" + missingFields.join("\n"));
    }
}

function parseFuelData(text) {
    const startMarker = "Pump Totals Report";
    const endMarker = "Grand Total";
    const startIndex = text.indexOf(startMarker);
    const endIndex = text.indexOf(endMarker, startIndex);
    const relevantText = text.substring(startIndex, endIndex);

    const gradeMap = getGradeMapping(); // Get the grade mapping
    const data = [];
    const positions = relevantText.split(/Fueling Position\s+\d+/).slice(1);

    positions.forEach((pos, index) => {
        const positionNumber = index + 1;
        const gradeSegments = pos.trim().split(/(REGULAR|PLUS|SUPER|DIESEL)/).slice(1);

        for (let i = 0; i < gradeSegments.length; i += 2) {
            const gradeKey = gradeSegments[i].trim().toUpperCase(); // Normalize the key for mapping
            const gradeName = gradeMap[gradeKey] || gradeSegments[i].trim(); // Map or default to original
            const valuesStr = gradeSegments[i + 1].trim();
            const values = valuesStr.split(/\s+/);

            if (values.length >= 6) {
                const entry = {
                    "Fueling Position": positionNumber,
                    "Grade Name": gradeName,
                    "Close Money": parseFloat(values[0].replace(/[\$,]/g, '')),
                    // "Open Money": parseFloat(values[1].replace(/[\$,]/g, '')), // Uncomment if needed
                    // "Metered Money": parseFloat(values[2].replace(/[\$,]/g, '')), // Uncomment if needed
                    "Close Volume": parseFloat(values[3].replace(/[\$,]/g, '')),
                    // "Open Volume": parseFloat(values[4].replace(/[\$,]/g, '')), // Uncomment if needed
                    // "Metered Volume": parseFloat(values[5].replace(/[\$,]/g, '')) // Uncomment if needed
                };
                data.push(entry);
            }
        }
    });

    return data;
}