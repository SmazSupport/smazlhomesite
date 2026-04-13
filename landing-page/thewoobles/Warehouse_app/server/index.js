const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.static("public"));

// Path to the JSON data file
const dataFilePath = path.join(__dirname, "data.json");

// Function to read data from JSON file
const readData = () => {
  const data = fs.readFileSync(dataFilePath);
  return JSON.parse(data);
};

// Function to write data to JSON file
const writeData = (data) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

// Function to safely check if poNumber exists and standardize it
function standardizePOField(location) {
  return {
    ...location,
    poNumber: location.poNumber || null, // Default to null if poNumber is not present
  };
}

// Endpoint to locate freight by item name
app.get("/locate", (req, res) => {
  try {
    const { itemName } = req.query;
    const data = readData();
    const result = data.filter(
      (item) => item.itemName.toLowerCase() === itemName.toLowerCase()
    );

    if (result.length > 0) {
      res.json(result[0].locations);
    } else {
      res.json([]); // Return an empty array if no locations are found
    }
  } catch (error) {
    console.error("Error in /locate endpoint:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Endpoint to locate freight by location ID
app.get("/locateByLocationId", (req, res) => {
  try {
    const standardizedLocationId = standardizeLocation(req.query.locationId);
    const data = readData();
    const results = [];

    data.forEach((item) => {
      item.locations.forEach((location) => {
        if (
          standardizeLocation(location.locationId) === standardizedLocationId
        ) {
          results.push({
            itemNumber: item.itemNumber, // Ensure this is itemNumber
            locationId: standardizedLocationId,
            cartonCount: location.cartonCount,
            itemsPerCarton: location.itemsPerCarton,
          });
        }
      });
    });

    res.json(results.length > 0 ? results : []);
  } catch (error) {
    console.error("Error in /locateByLocationId:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Endpoint to get item details for the Put Away tab
app.get("/getItemDetails", (req, res) => {
  let itemNumber = req.query.itemNumber;
  itemNumber = standardizeItemNumber(itemNumber); // Standardize the item number

  const data = readData();
  const item = data.find(
    (item) => standardizeItemNumber(item.itemNumber) === itemNumber
  );

  if (item) {
    // Send the item details including all locations and PO numbers
    res.json(item);
  } else {
    res.json(null); // Return null if item is not found
  }
});

// Endpoint to add or update a location for an item
app.post("/addLocation", (req, res) => {
  try {
    const { itemNumber, newLocation, cartonCount, itemsPerCarton, poNumber } =
      req.body;
    const standardizedLocation = standardizeLocation(newLocation);

    let data = readData();

    // Check if the item already exists
    let itemExists = false;
    data = data.map((item) => {
      if (item.itemNumber === itemNumber) {
        // Add the new location, using standardizePOField to ensure safe handling of PO number
        item.locations.push(
          standardizePOField({
            locationId: standardizedLocation,
            cartonCount: cartonCount ? parseInt(cartonCount, 10) : 1,
            itemsPerCarton: itemsPerCarton
              ? parseInt(itemsPerCarton, 10)
              : null,
            poNumber: poNumber || null, // Add PO number if it exists
          })
        );
        itemExists = true;
      }
      return item;
    });

    // If the item does not exist, create a new item entry
    if (!itemExists) {
      data.push({
        itemNumber,
        itemName: "New Item",
        locations: [
          standardizePOField({
            locationId: standardizedLocation,
            cartonCount: cartonCount ? parseInt(cartonCount, 10) : 1,
            itemsPerCarton: itemsPerCarton
              ? parseInt(itemsPerCarton, 10)
              : null,
            poNumber: poNumber || null, // Add PO number if it exists
          }),
        ],
      });
    }

    writeData(data);
    res.json({ message: "Location added successfully." });
  } catch (error) {
    console.error("Error in /addLocation endpoint:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Endpoint to retrieve location details by locationId (GET method)
app.post("/edit", (req, res) => {
  try {
    const { itemId, locationId, cartonCount, itemsPerCarton, poNumber } =
      req.body;
    let data = readData();

    data = data.map((item) => {
      if (item.itemNumber === itemId) {
        item.locations = item.locations.map((location) => {
          if (location.locationId === locationId) {
            // Update cartonCount, itemsPerCarton, and PO number if provided
            return {
              locationId: location.locationId,
              cartonCount:
                cartonCount !== undefined ? cartonCount : location.cartonCount,
              itemsPerCarton:
                itemsPerCarton !== null
                  ? itemsPerCarton
                  : location.itemsPerCarton,
              poNumber: poNumber !== undefined ? poNumber : location.poNumber, // Update the PO number
            };
          }
          return location;
        });
      }
      return item;
    });

    writeData(data);
    res.json({ message: "Location updated successfully." });
  } catch (error) {
    console.error("Error in /edit POST endpoint:", error); // Log the error
    res.status(500).send("Internal Server Error");
  }
});

// Endpoint to move product to a new location
app.post("/move", (req, res) => {
  try {
    const {
      itemId,
      oldLocationId,
      newLocationId,
      cartonCount,
      itemsPerCarton,
      poNumber,
    } = req.body;
    const standardizedNewLocation = standardizeLocation(newLocationId);

    let data = readData();
    let itemMoved = false;

    data = data.map((item) => {
      if (item.itemNumber === itemId) {
        // Filter out the old location from the item's locations
        item.locations = item.locations.filter(
          (location) => location.locationId !== oldLocationId
        );

        // Check if the item already exists in the new location
        const existingLocation = item.locations.find(
          (location) =>
            location.locationId === standardizedNewLocation &&
            (location.poNumber === poNumber ||
              (!location.poNumber && !poNumber)) // Matching PO numbers (both blank or equal)
        );

        if (existingLocation) {
          // Consolidate carton counts and use destination itemsPerCarton
          existingLocation.cartonCount += cartonCount
            ? parseInt(cartonCount, 10)
            : 1;
          existingLocation.itemsPerCarton =
            existingLocation.itemsPerCarton !== null
              ? existingLocation.itemsPerCarton
              : itemsPerCarton; // Use destination's itemsPerCarton, or source if destination is null
        } else {
          // If no existing location with matching PO, add new entry
          item.locations.push({
            locationId: standardizedNewLocation,
            cartonCount: cartonCount ? parseInt(cartonCount, 10) : 1,
            itemsPerCarton: itemsPerCarton
              ? parseInt(itemsPerCarton, 10)
              : null,
            poNumber: poNumber || null, // Add PO number or null if blank
          });
        }

        itemMoved = true;
      }
      return item;
    });

    if (itemMoved) {
      writeData(data);
      res.json({ message: "Product moved to new location successfully." });
    } else {
      res.json({ message: "Item not found or already in the new location." });
    }
  } catch (error) {
    console.error("Error in /move endpoint:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get("/edit", (req, res) => {
  try {
    const { locationId } = req.query;
    const standardizedLocationId = standardizeLocation(locationId); // Standardize location format
    console.log("Standardized Location ID:", standardizedLocationId); // Debugging line

    const data = readData(); // Read the data from your JSON or database
    const results = [];

    data.forEach((item) => {
      item.locations.forEach((location) => {
        if (
          standardizeLocation(location.locationId) === standardizedLocationId
        ) {
          // Matching location found, return the item and location details
          console.log("Matching Item Found:", item); // Debugging line
          results.push({
            itemNumber: item.itemNumber, // Item number
            locationId: location.locationId, // Location ID
            cartonCount: location.cartonCount, // Carton count
            itemsPerCarton: location.itemsPerCarton, // Items per carton
            poNumber: location.poNumber || "", // Include PO number, default to empty string if not present
          });
        }
      });
    });

    if (results.length > 0) {
      res.json(results); // Return the results with location details
    } else {
      res.json([]); // Return an empty array if no items are found in the location
    }
  } catch (error) {
    console.error("Error in /edit GET endpoint:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/removeItem", (req, res) => {
  try {
    const { itemId, locationId } = req.body;
    let data = readData();

    data = data.map((item) => {
      if (item.itemNumber === itemId) {
        item.locations = item.locations.filter(
          (location) => location.locationId !== locationId
        );
      }
      return item;
    });

    writeData(data);
    res.json({ message: "Item removed from location successfully." });
  } catch (error) {
    console.error("Error in /removeItem endpoint:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Function to standardize location in backend
function standardizeLocation(input) {
  input = input.toUpperCase();
  const match = input.match(/^([A-Z]{1,2})[-]?(\d{1,2})[-]?([A-E])$/);
  if (match) {
    const letterPart = match[1];
    const numberPart = parseInt(match[2], 10);
    const letterSuffix = match[3];
    return `${letterPart}-${numberPart}-${letterSuffix}`;
  } else {
    throw new Error("Invalid location format");
  }
}

function standardizeItemNumber(input) {
  return input.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

app.get("/getAllItems", (req, res) => {
  try {
    const data = readData();
    const results = [];

    data.forEach((item) => {
      item.locations.forEach((location) => {
        results.push({
          itemNumber: item.itemNumber,
          locationId: location.locationId,
          cartonCount: location.cartonCount,
        });
      });
    });

    res.json(results);
  } catch (error) {
    console.error("Error in /getAllItems endpoint:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/readLabelsFile", (req, res) => {
  const filePath = path.join(__dirname, "public/labels/labels.csv");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading labels file:", err);
      res.status(500).send("Error reading labels file");
    } else {
      res.send(data);
    }
  });
});

app.get("/readLabelsJson", (req, res) => {
  const filePath = path.join(__dirname, "public/labels/labels.json");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading labels JSON file:", err);
      res.status(500).send("Error reading labels JSON file");
    } else {
      res.json(JSON.parse(data));
    }
  });
});

app.post("/importItems", (req, res) => {
  try {
    const importedItems = req.body;
    let data = readData();

    importedItems.forEach((importedItem) => {
      const { itemNumber, newLocation, cartonCount, itemsPerCarton } =
        importedItem;

      let itemExists = false;
      data = data.map((item) => {
        if (item.itemNumber === itemNumber) {
          item.locations.push({
            locationId: newLocation,
            cartonCount,
            itemsPerCarton,
          });
          itemExists = true;
        }
        return item;
      });

      if (!itemExists) {
        data.push({
          itemNumber,
          itemName: "Imported Item",
          locations: [
            {
              locationId: newLocation,
              cartonCount,
              itemsPerCarton,
            },
          ],
        });
      }
    });

    writeData(data);
    res.json({ message: "Items imported successfully." });
  } catch (error) {
    console.error("Error importing items:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/backupData", (req, res) => {
  const { backupFileName } = req.body;

  // Read the current JSON data
  fs.readFile(dataFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading data file:", err);
      return res.status(500).json({ message: "Error reading data file" });
    }

    // Write the backup file
    fs.writeFile(path.join(__dirname, backupFileName), data, (err) => {
      if (err) {
        console.error("Error creating backup file:", err);
        return res.status(500).json({ message: "Error creating backup file" });
      }

      res.json({ message: "Backup created successfully" });
    });
  });
});

// Endpoint to replace JSON data with new data
app.post("/replaceData", (req, res) => {
  const newData = req.body;

  // Write the new data to the JSON file
  fs.writeFile(
    dataFilePath,
    JSON.stringify(newData, null, 2),
    "utf8",
    (err) => {
      if (err) {
        console.error("Error writing new data to file:", err);
        return res.status(500).json({ message: "Error writing data to file" });
      }

      res.json({ message: "Data replaced successfully" });
    }
  );
});

// Endpoint to get current JSON data
app.get("/getCurrentData", (req, res) => {
  // Read the current JSON data
  fs.readFile(dataFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading data file:", err);
      return res.status(500).json({ message: "Error reading data file" });
    }

    res.json(JSON.parse(data));
  });
});

app.post("/cleanLocations", (req, res) => {
  try {
    let data = readData(); // Read the existing JSON data
    let modified = false; // Track if any changes were made
    let locationsArray = {}; // Dictionary to track locations and their items

    // Step 1: Build the locations array
    data.forEach((item) => {
      item.locations.forEach((location) => {
        const locationId = location.locationId;
        if (!locationsArray[locationId]) {
          // Initialize a new location entry if it doesn't exist yet
          locationsArray[locationId] = { locationId, items: [] };
        }
        locationsArray[locationId].items.push({
          itemNumber: item.itemNumber,
          cartonCount: location.cartonCount,
          itemsPerCarton: location.itemsPerCarton,
        });
      });
    });

    // Step 2: Identify and clean locations with both blank and valid items
    Object.values(locationsArray).forEach((location) => {
      if (location.items.length > 1) {
        // Find if any items in the location are blank
        const blankItem = location.items.find((item) => item.itemNumber === "");
        const validItem = location.items.find((item) => item.itemNumber !== "");

        if (blankItem && validItem) {
          // Step 3: Remove the blank item from this location in the original data
          data.forEach((item) => {
            if (item.itemNumber === "") {
              // Remove the location from the blank item's location array
              item.locations = item.locations.filter(
                (loc) => loc.locationId !== location.locationId
              );
              modified = true; // Mark that we made a modification
            }
          });
        }
      }
    });

    // Step 4: Write the updated data back to the file
    if (modified) {
      writeData(data);
      res.json({ message: "Locations cleaned successfully." });
    } else {
      res.json({ message: "No invalid entries found." });
    }
  } catch (error) {
    console.error("Error cleaning locations:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/hiddenProductsReport", (req, res) => {
  try {
    let data = readData(); // Read the existing JSON data
    let hiddenProducts = [];

    // Loop through all items in the data
    data.forEach((item) => {
      if (!item.itemNumber) return; // Ignore blank items (empty itemNumber)

      const locationMap = {};
      let hasVisibleLocation = false;

      // Organize locations by row and column, and check for visible spots
      item.locations.forEach((location) => {
        const [row, column, position] = location.locationId.split("-");
        const columnNumber = parseInt(column, 10);

        if (!locationMap[row]) {
          locationMap[row] = {};
        }

        if (!locationMap[row][columnNumber]) {
          locationMap[row][columnNumber] = {};
        }

        // Store the location's position
        locationMap[row][columnNumber][position] = location;

        // If we find any location in A or C, the item is visible
        if (position === "A" || position === "C") {
          hasVisibleLocation = true;
        }
      });

      // If the item has a visible location, skip it
      if (hasVisibleLocation) return;

      // Now check for hidden products in B and D
      Object.keys(locationMap).forEach((row) => {
        Object.keys(locationMap[row]).forEach((column) => {
          const positions = locationMap[row][column];

          // Check if B is blocked by A
          if (positions.B && (!positions.A || positions.A.cartonCount === 0)) {
            hiddenProducts.push({
              itemNumber: item.itemNumber,
              locationId: positions.B.locationId,
              blockedBy: positions.A ? positions.A.locationId : "None",
            });
          }

          // Check if D is blocked by C
          if (positions.D && (!positions.C || positions.C.cartonCount === 0)) {
            hiddenProducts.push({
              itemNumber: item.itemNumber,
              locationId: positions.D.locationId,
              blockedBy: positions.C ? positions.C.locationId : "None",
            });
          }
        });
      });
    });

    res.json({ hiddenProducts });
  } catch (error) {
    console.error("Error generating hidden products report:", error);
    res.status(500).send("Internal Server Error");
  }
});
