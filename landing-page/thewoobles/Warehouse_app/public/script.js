// LOCATE FREIGHT FUNCTIONALITY

// Function to locate freight by product name
function locateFreight() {
  let productName = document.getElementById("locateSearch").value.trim();
  productName = standardizeItemNumber(productName); // Standardize the item number

  locateFreightByName(productName).then((locationsHtml) => {
    document.getElementById(
      "locateResults"
    ).innerHTML = `<h4>Locations:</h4>${locationsHtml}`;
    document.getElementById("locateResults").style.display = "block";
  });
}

// Reusable function to locate freight by item name
function locateFreightByName(itemName) {
  itemName = standardizeItemNumber(itemName); // Ensure the item number is standardized

  return fetch(`/getItemDetails?itemNumber=${itemName}`) // Reusing the same endpoint as in Put Away Freight
    .then((response) => response.json())
    .then((data) => {
      if (data && data.locations.length > 0) {
        let locationsHtml = "<ul>";
        data.locations.forEach((location) => {
          locationsHtml += `
                    <li>
                        <a href="#" onclick="redirectToEditTab('${location.locationId}')">Location ID: ${location.locationId}</a>, 
                        Carton Count: ${location.cartonCount}, 
                        Items per Carton: ${location.itemsPerCarton}
                    </li>
                `;
        });
        locationsHtml += "</ul>";
        return locationsHtml;
      } else {
        return "<p>No locations found for this product.</p>";
      }
    })
    .catch((error) => {
      console.error("Error locating freight:", error);
      return "<p>Error locating freight. Please try again.</p>";
    });
}

function redirectToEditTab(locationId) {
  // Switch to the Edit Location tab
  document.querySelector("#edit-tab").click(); // Activate the tab
  document.querySelector("#editLocationId").value = locationId; // Fill the input field
  editLocation(); // Trigger the location search
}

// Function to locate freight by location ID
function locateByLocationId() {
  const rawLocationId = document
    .getElementById("locateLocationId")
    .value.trim();
  const locationId = standardizeLocation(rawLocationId);

  if (!locationId) {
    alert("Please enter a valid location ID.");
    return;
  }

  // Clear previous results
  document.getElementById("locateResults").innerHTML = ""; // Clear the results box
  document.getElementById("locateResults").style.display = "none"; // Hide the results box initially

  fetch(`/locateByLocationId?locationId=${locationId}`)
    .then((response) => response.json())
    .then((data) => {
      let resultsHtml = "<h4>Results:</h4>";
      if (data.length > 0) {
        data.forEach((item) => {
          resultsHtml += `
                          <div>
                              <p>Product: ${item.itemNumber}</p> <!-- Display itemNumber -->
                              <p>Location ID: ${item.locationId}</p>
                              <p>Carton Count: ${item.cartonCount}</p>
                              <p>Items per Carton: ${item.itemsPerCarton}</p>
                          </div>
                      `;
        });
      } else {
        resultsHtml += "<p>No products found at this location.</p>";
      }
      document.getElementById("locateResults").innerHTML = resultsHtml;
      document.getElementById("locateResults").style.display = "block"; // Show the results box
    })
    .catch((error) => {
      console.error("Error locating by location ID:", error);
      alert("Error locating by location ID. Please try again.");
    });
}

// PUT AWAY FREIGHT FUNCTIONALITY

// Function to search item and display form with current locations
function searchItemForPutAway() {
  let itemNumber = document.getElementById("putawayItemNumber").value.trim();
  itemNumber = standardizeItemNumber(itemNumber); // Standardize the item number

  if (!itemNumber) {
    alert("Please enter an item number.");
    return;
  }

  fetch(`/getItemDetails?itemNumber=${itemNumber}`)
    .then((response) => response.json())
    .then((data) => {
      // Always show the form, even if data is null
      document.getElementById("putawayForm").style.display = "block";

      if (data && data.locations && data.locations.length > 0) {
        const mostFrequent = getMostFrequentItemsPerCarton(data.locations);
        if (mostFrequent) {
          document.getElementById("putawayItemsPerCarton").value = mostFrequent;
        }

        let locationsHtml = "<ul>";
        data.locations.forEach((location) => {
          locationsHtml += `
              <li>
                Location ID: ${location.locationId}, 
                Carton Count: ${location.cartonCount}, 
                Items per Carton: ${location.itemsPerCarton}
              </li>`;
        });
        locationsHtml += "</ul>";
        document.getElementById("currentLocations").innerHTML = locationsHtml;
      } else {
        // If no locations are found, clear the input field and set default values
        document.getElementById("putawayItemsPerCarton").value = "";
        document.getElementById("currentLocations").innerHTML =
          "<p>No current locations for this item.</p>";
      }
    })
    .catch((error) => {
      console.error("Error fetching item details:", error);
      alert("Error fetching item details. The item may not exist.");
    });
}

// Function to add new location for an item
function addNewLocation() {
  let itemNumber = document.getElementById("putawayItemNumber").value.trim();
  itemNumber = standardizeItemNumber(itemNumber); // Standardize the item number

  const rawLocation = document
    .getElementById("putawayNewLocation")
    .value.trim();
  const newLocation = standardizeLocation(rawLocation);

  const cartonCount = document
    .getElementById("putawayCartonCount")
    .value.trim();
  const itemsPerCarton = document
    .getElementById("putawayItemsPerCarton")
    .value.trim();
  const poNumber = document.getElementById("putawayPoNumber").value.trim(); // Capture PO number

  // Update items per carton count (if applicable)
  updateItemsPerCartonCount(itemsPerCarton);

  if (!itemNumber || !newLocation) {
    alert("Please enter both item number and location ID.");
    return;
  }

  // First, fetch the item details to see if it already exists in this location
  fetch(`/getItemDetails?itemNumber=${itemNumber}`)
    .then((response) => response.json())
    .then((data) => {
      if (data && data.locations) {
        const existingLocation = data.locations.find(
          (location) => location.locationId === newLocation
        );

        if (existingLocation) {
          // Prompt the user if the item already exists in the location
          const addCartons = confirm(
            `This product is already in location ${newLocation}. Would you like to add more cartons?`
          );

          if (addCartons) {
            // Update the carton count for the existing location
            existingLocation.cartonCount += cartonCount
              ? parseInt(cartonCount, 10)
              : 1;

            // Send the update request to the server, including the PO number
            fetch("/edit", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                itemId: itemNumber,
                locationId: newLocation,
                cartonCount: existingLocation.cartonCount,
                itemsPerCarton: existingLocation.itemsPerCarton,
                poNumber: poNumber || null, // Include PO number if present
              }),
            })
              .then((response) => response.json())
              .then((data) => {
                alert(data.message);
                searchItemForPutAway(); // Refresh the form and current locations
              })
              .catch((error) => {
                console.error("Error updating location:", error);
                alert("Error updating location. Please try again.");
              });

            return; // Exit the function after updating the location
          } else {
            return; // Cancel the operation if the user doesn't want to add more cartons
          }
        }
      }

      // If the item does not exist in the location, proceed to add the new location
      const payload = {
        itemNumber,
        newLocation,
        cartonCount: cartonCount ? parseInt(cartonCount, 10) : 1,
        itemsPerCarton: itemsPerCarton ? parseInt(itemsPerCarton, 10) : null,
        poNumber: poNumber || null, // Include PO number if provided
      };

      fetch("/addLocation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((data) => {
          alert(data.message);
          document.getElementById("putawayNewLocation").value = ""; // Clear the form
          document.getElementById("putawayCartonCount").value = "";
          document.getElementById("putawayItemsPerCarton").value = "";
          document.getElementById("putawayPoNumber").value = ""; // Clear PO number field
          searchItemForPutAway(); // Refresh the form and current locations
        })
        .catch((error) => {
          console.error("Error adding new location:", error);
          alert("Error adding new location. Please try again.");
        });
    })
    .catch((error) => {
      console.error("Error fetching item details:", error);
      alert("Error fetching item details. Please try again.");
    });
}

// EDIT LOCATION FUNCTIONALITY

// Function to search and display location details for editing
function editLocation() {
  const rawLocationId = document.getElementById("editLocationId").value.trim();
  const locationId = standardizeLocation(rawLocationId);

  if (!locationId) {
    alert("Please enter a valid location ID.");
    return;
  }

  fetch(`/edit?locationId=${locationId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        let editHtml = "<h4>Location Details:</h4>";
        data.forEach((item) => {
          const itemNumber = item.itemNumber || "Unknown Item"; // Use itemNumber here
          const cartonCount = item.cartonCount !== null ? item.cartonCount : "";
          const itemsPerCarton =
            item.itemsPerCarton !== null ? item.itemsPerCarton : "";
          const poNumber = item.poNumber || ""; // Capture the PO number, default to empty string if not available

          editHtml += `
                          <div class="card mb-3">
                              <div class="card-body">
                                  <h5 class="card-title">Product: ${itemNumber}</h5> <!-- Display itemNumber -->
                                  <p class="card-text">Carton Count: <input type="number" inputmode="numeric" id="editCartonCount_${item.itemNumber}" value="${cartonCount}" class="form-control"></p>
                                  <p class="card-text">Items per Carton: <input type="number" inputmode="numeric" id="editItemsPerCarton_${item.itemNumber}" value="${itemsPerCarton}" class="form-control"></p>
                                  <p class="card-text">PO Number: <input type="text" id="editPoNumber_${item.itemNumber}" value="${poNumber}" class="form-control" placeholder="Enter PO Number (optional)"></p>
                                  <button class="btn btn-success mt-3" onclick="updateLocation('${item.itemNumber}', '${locationId}')">Update</button>
                                  <button class="btn btn-warning mt-3" onclick="moveToNewLocation('${item.itemNumber}', '${locationId}')">Move to New Location</button>
                                  <button class="btn btn-danger mt-3" onclick="removeItemFromLocation('${item.itemNumber}', '${locationId}')">Remove from Location</button>
                              </div>
                          </div>
                      `;
        });
        document.getElementById("editResults").innerHTML = editHtml;
        document.getElementById("editResults").style.display = "block";
      } else {
        document.getElementById("editResults").innerHTML =
          "<p>No product found in this location.</p>";
      }
    })
    .catch((error) => {
      console.error("Error editing location:", error);
      alert("Error editing location. Please try again.");
    });
}

// Function to update location details
function updateLocation(itemId, locationId) {
  const cartonCount = document
    .getElementById(`editCartonCount_${itemId}`)
    .value.trim();
  const itemsPerCarton = document
    .getElementById(`editItemsPerCarton_${itemId}`)
    .value.trim();
  const poNumber = document
    .getElementById(`editPoNumber_${itemId}`)
    .value.trim(); // Capture PO number

  if (cartonCount && isNaN(cartonCount)) {
    alert("Please enter a valid number for carton count.");
    return;
  }
  if (itemsPerCarton && isNaN(itemsPerCarton)) {
    alert("Please enter a valid number for items per carton.");
    return;
  }

  const payload = {
    itemId,
    locationId,
    cartonCount: cartonCount ? parseInt(cartonCount, 10) : 1,
    itemsPerCarton: itemsPerCarton ? parseInt(itemsPerCarton, 10) : null,
    poNumber: poNumber || null, // Include PO number in the payload
  };

  fetch("/edit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
      document.getElementById("editResults").style.display = "none"; // Hide the edit form after updating
    })
    .catch((error) => {
      console.error("Error updating location:", error);
      alert("Error updating location. Please try again.");
    });
}

// Function to move product to a new location
let currentItemId, currentOldLocationId;

function moveToNewLocation(itemId, oldLocationId) {
  currentItemId = itemId;
  currentOldLocationId = oldLocationId;

  // Show the modal
  $("#moveLocationModal").modal("show");
}

function confirmMoveLocation() {
  const rawNewLocationId = document
    .getElementById("newLocationId")
    .value.trim();
  const newLocationId = standardizeLocation(rawNewLocationId);

  if (!newLocationId) {
    alert("Please enter a valid new location ID.");
    return;
  }

  const cartonCount = document
    .getElementById(`editCartonCount_${currentItemId}`)
    .value.trim();
  const itemsPerCarton = document
    .getElementById(`editItemsPerCarton_${currentItemId}`)
    .value.trim();

  if (cartonCount && isNaN(cartonCount)) {
    alert("Please enter a valid number for carton count.");
    return;
  }
  if (itemsPerCarton && isNaN(itemsPerCarton)) {
    alert("Please enter a valid number for items per carton.");
    return;
  }

  const payload = {
    itemId: currentItemId,
    oldLocationId: currentOldLocationId,
    newLocationId,
    cartonCount: cartonCount ? parseInt(cartonCount, 10) : 1,
    itemsPerCarton: itemsPerCarton ? parseInt(itemsPerCarton, 10) : null,
  };

  fetch("/move", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
      editLocation(); // Refresh the edit form to reflect the new location
      $("#moveLocationModal").modal("hide"); // Hide the modal
    })
    .catch((error) => {
      console.error("Error moving to new location:", error);
      alert("Error moving to new location. Please try again.");
    });
}

// Function to remove an item from a location
function removeItemFromLocation(itemId, locationId) {
  if (confirm("Are you sure you want to remove this item from the location?")) {
    const payload = { itemId, locationId };

    fetch("/removeItem", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.message);
        editLocation(); // Refresh the edit form
      })
      .catch((error) => {
        console.error("Error removing item from location:", error);
        alert("Error removing item from location. Please try again.");
      });
  }
}

// Clear data when switching tabs
document.querySelectorAll(".nav-link").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.getElementById("locateResults").innerHTML = "";
    document.getElementById("putawayForm").style.display = "none";
    document.getElementById("currentLocations").innerHTML = "";
    document.getElementById("editResults").innerHTML = "";
    document.getElementById("locateSearch").value = "";
    document.getElementById("locateLocationId").value = "";
    document.getElementById("putawayItemNumber").value = "";
    document.getElementById("editLocationId").value = "";

    // If the "All Items" tab is clicked, load the items
    if (tab.id === "all-items-tab") {
      loadAllItems(); // Call the function to load all items
    }
  });
});

function standardizeLocation(input) {
  // Convert to uppercase
  input = input.toUpperCase();

  // Match and format A-1-B
  const match = input.match(/^([A-Z]{1,2})[-]?(\d{1,2})[-]?([A-E])$/);
  if (match) {
    const letterPart = match[1];
    const numberPart = parseInt(match[2], 10); // Ensures the number is not padded
    const letterSuffix = match[3];
    return `${letterPart}-${numberPart}-${letterSuffix}`;
  } else {
    console.error(`Invalid location format encountered: ${input}`);
    throw new Error("Invalid location format");
  }
}

function handleLocationInput(event) {
  const standardizedLocation = standardizeLocation(event.target.value);
  if (standardizedLocation) {
    event.target.value = standardizedLocation; // Update the input field with the formatted value
  }
}

function standardizeItemNumber(input) {
  return input.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

let isEditing = false;

// Function to toggle editing mode
function toggleEditItems() {
  // Save the current scroll position
  const scrollPosition = window.scrollY;

  // Get the edit button and other elements
  const editButton = document.getElementById("editItemsFooterBtn");
  const cartonCountFields = document.querySelectorAll(".carton-count-input");
  const deleteIcons = document.querySelectorAll(".delete-icon");

  if (!editButton) {
    console.error("Edit button not found");
    return;
  }

  isEditing = !isEditing; // Toggle global isEditing

  // Determine if we're enabling or disabling edit mode
  editButton.textContent = isEditing ? "Disable Editing" : "Edit Items";

  // Enable or disable the input fields and show/hide delete icons
  cartonCountFields.forEach((field) => {
    field.disabled = !isEditing; // Enable/disable the input fields
  });

  deleteIcons.forEach((icon) => {
    icon.style.display = isEditing ? "inline" : "none"; // Show/hide delete icons
  });

  // Restore the scroll position after enabling/disabling edit mode
  setTimeout(() => {
    window.scrollTo(0, scrollPosition); // Ensure the page scroll position is restored after layout adjustments
  }, 0);
}

function getLocationParts(location) {
  const match = location.match(/^([A-Z]+)-(\d+)-([A-D])$/);
  return match
    ? { letterPart: match[1], numberPart: parseInt(match[2]), side: match[3] }
    : null;
}

function sortLocations(data) {
  return data.sort((a, b) => {
    const locA = getLocationParts(a.locationId);
    const locB = getLocationParts(b.locationId);

    if (!locA || !locB) return 0; // Fallback for invalid location ID

    // First, sort by the letter part (A, B, C, etc.)
    if (locA.letterPart !== locB.letterPart) {
      return locA.letterPart.localeCompare(locB.letterPart);
    }

    // Second, sort by the numeric part (1, 2, 3, etc.)
    if (locA.numberPart !== locB.numberPart) {
      return locA.numberPart - locB.numberPart;
    }

    // Lastly, sort by the side (A-B before C-D)
    const sidePriority = { A: 1, B: 2, C: 3, D: 4 };
    return sidePriority[locA.side] - sidePriority[locB.side];
  });
}

function loadAllItems() {
  fetch("/getAllItems")
    .then((response) => response.json())
    .then((data) => {
      const sortedData = sortLocations(data); // Always sort locations when loading

      const tableBody = document.querySelector("#allItemsTable tbody");
      tableBody.innerHTML = ""; // Clear any existing rows

      sortedData.forEach((item) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${item.itemNumber}</td>
            <td>${item.locationId}</td>
            <td>
              <div class="carton-count-container">
                <input type="number" class="form-control carton-count-input" 
                       value="${item.cartonCount}" 
                       data-item-number="${item.itemNumber}" 
                       data-location-id="${item.locationId}"
                       disabled onblur="saveCartonCount(this)" />
                <i class="fas fa-trash-alt delete-icon" 
                   onclick="deleteItem('${item.locationId}')"
                   style="display: none; cursor: pointer; margin-left: 5px;"></i>
              </div>
            </td>
          `;

        tableBody.appendChild(row);
      });
    })
    .catch((error) => {
      console.error("Error loading items:", error);
      alert("Error loading items. Please try again.");
    });
}

function deleteItem(locationId) {
  const scrollPosition = window.scrollY; // Save current scroll position

  // Check if we are in editing mode by checking the button text or a global flag
  const isEditing =
    document.getElementById("editItemsFooterBtn").textContent ===
    "Disable Editing";

  fetch("/getCurrentData")
    .then((response) => response.json())
    .then((data) => {
      let updatedData = data;

      // Find or create the blank item entry
      let blankItemEntry = updatedData.find((item) => item.itemNumber === "");
      if (!blankItemEntry) {
        blankItemEntry = {
          itemNumber: "",
          locations: [],
        };
        updatedData.push(blankItemEntry);
      }

      // Move the location to the blank item entry
      blankItemEntry.locations = blankItemEntry.locations.filter(
        (location) => location.locationId !== locationId
      );
      blankItemEntry.locations.push({
        locationId,
        cartonCount: 0,
        itemsPerCarton: null,
      });

      // Remove the location from the original item
      updatedData = updatedData.map((item) => {
        if (item.itemNumber !== "") {
          item.locations = item.locations.filter(
            (location) => location.locationId !== locationId
          );
        }
        return item;
      });

      // Save the updated data
      return fetch("/replaceData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });
    })
    .then((response) => response.json())
    .then((result) => {
      // Reload items and retain the scroll position and edit mode
      loadAllItems(); // Reload the items

      // Ensure the page scrolls back to the correct position after reloading
      window.scrollTo(0, scrollPosition);

      // Keep edit mode active if it was already active
      if (isEditing) {
        toggleEditItems(); // This will ensure that edit mode stays on
      }
    })
    .catch((error) => {
      console.error("Error deleting item:", error);
      alert("Error deleting item. Please try again.");
    });
}

function saveCartonCount(input) {
  console.log(isEditing);
  if (!isEditing) return; // Prevent saving if editing is disabled
  console.log(isEditing);
  const itemNumber = input.dataset.itemNumber;
  const locationId = input.dataset.locationId;
  const cartonCount = input.value;

  fetch("/edit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      itemId: itemNumber,
      locationId: locationId,
      cartonCount: parseInt(cartonCount, 10),
      //itemsPerCarton: null, // Assuming we're only editing cartonCount
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      console.log(result.message);
    })
    .catch((error) => {
      console.error("Error saving carton count:", error);
    });
}

function displayAllItems(items) {
  const tableBody = document.querySelector("#allItemsTable tbody");
  tableBody.innerHTML = ""; // Clear any existing rows

  if (items.length > 0) {
    items.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                  <td>${item.itemNumber}</td>
                  <td>${item.locationId}</td>
                  <td>${item.cartonCount}</td>
                  <td><button class="btn btn-primary btn-sm" onclick="printLabel('${item.locationId}')">Print Label</button></td>
              `;
      tableBody.appendChild(row);
    });
  } else {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="4" class="text-center">No items found.</td>';
    tableBody.appendChild(row);
  }
}

let itemsPerCartonCounts = {};

function updateItemsPerCartonCount(value) {
  if (value) {
    value = parseInt(value, 10);
    if (itemsPerCartonCounts[value]) {
      itemsPerCartonCounts[value]++;
    } else {
      itemsPerCartonCounts[value] = 1;
    }
  }
}

function getMostFrequentItemsPerCarton(locations) {
  const counts = {};
  locations.forEach((location) => {
    const value = location.itemsPerCarton;
    if (value) {
      counts[value] = (counts[value] || 0) + 1;
    }
  });

  let mostFrequent = null;
  let maxCount = 0;
  for (let value in counts) {
    if (
      counts[value] > maxCount ||
      (counts[value] === maxCount &&
        parseInt(value, 10) > parseInt(mostFrequent, 10))
    ) {
      maxCount = counts[value];
      mostFrequent = value;
    }
  }

  return mostFrequent;
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("input").forEach((input) => {
    input.setAttribute("spellcheck", "false");
  });
});

function printLabel(locationId) {
  // Determine the arrow direction based on the last character of the location ID
  let arrowDirection = "";
  const lastChar = locationId.slice(-1).toUpperCase();

  if (lastChar === "A" || lastChar === "C") {
    arrowDirection = "↓"; // Down arrow
  } else if (lastChar === "B" || lastChar === "D") {
    arrowDirection = "↑"; // Up arrow
  }

  // Create a new window for the label
  const labelWindow = window.open("", "PRINT", "height=400,width=600");

  // Create the label content with the appropriate layout
  labelWindow.document.write(`
          <html>
          <head>
              <title>Print Label</title>
              <style>
                  @page { size: 6in 4in; margin: 0; } /* Set page size to 6x4 inches with no margin for landscape orientation */
                  body {
                      margin: 0;
                      padding: 0;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      font-family: Arial, sans-serif;
                      height: 4in; /* Set body height to 4 inches */
                      width: 6in; /* Set body width to 6 inches */
                  }
                  .label-container {
                      width: 6in;
                      height: 4in;
                      display: flex;
                      justify-content: space-between;
                      padding: 0;
                      box-sizing: border-box; /* Include padding in the element's width and height */
                  }
                  .text-container {
                      display: flex;
                      flex-direction: column;
                      justify-content: center;
                      flex-grow: 1;
                      margin-left: 20px; /* Add a small margin to the text for better spacing */
                  }
                  .location-name {
                      font-size: 72px; /* Larger size for location name */
                      text-align: left;
                  }
                  .barcode-container {
                      margin-top: 20px;
                      text-align: left;
                  }
                  .arrow-container {
                      font-size: 100px; /* Arrow size */
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      margin-left: 20px;
                      margin-right: 20px; /* Add margin to ensure the arrow is nicely spaced */
                  }
                  .print-button {
                      position: absolute;
                      top: 10px;
                      right: 10px;
                      font-size: 16px;
                      padding: 10px 20px;
                      cursor: pointer;
                  }
                  @media print {
                      .print-button {
                          display: none; /* Hide the print button when printing */
                      }
                  }
              </style>
          </head>
          <body>
              <button class="print-button" onclick="window.print()">Print</button>
              <div class="label-container">
                  <div class="text-container">
                      <div class="location-name">${locationId}</div>
                      <div class="barcode-container">
                          <svg id="barcode"></svg>
                      </div>
                  </div>
                  <div class="arrow-container">${arrowDirection}</div>
              </div>
              <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.0/dist/JsBarcode.all.min.js"></script>
              <script>
                  // Generate the barcode
                  JsBarcode(document.getElementById('barcode'), '${locationId}', {
                      format: "CODE128",
                      width: 4,
                      height: 100,
                      displayValue: false
                  });
              </script>
          </body>
          </html>
      `);

  labelWindow.document.close();
  labelWindow.focus();
}

//   Printing Bulk Lables

function printBulkLabels() {
  fetch("/readLabelsJson")
    .then((response) => response.json())
    .then((locationIds) => {
      generateBulkLabels(locationIds.map((item) => item.locationId));
    })
    .catch((error) => {
      console.error("Error reading labels JSON file:", error);
      alert("Error reading labels JSON file. Please try again.");
    });
}

function getArrowDirection(locationId) {
  const lastChar = locationId.slice(-1).toUpperCase();
  if (lastChar === "A" || lastChar === "C") {
    return "↓"; // Down arrow
  } else if (lastChar === "B" || lastChar === "D") {
    return "↑"; // Up arrow
  } else {
    return ""; // No arrow
  }
}

function generateBulkLabels(locationIds) {
  if (locationIds.length === 0) {
    alert("No valid location IDs found in the CSV file.");
    return;
  }

  // Create a new window for the labels
  const labelsWindow = window.open("", "PRINT", "height=800,width=600");

  labelsWindow.document.write(`
          <html>
          <head>
              <title>Print Bulk Labels</title>
              <style>
                  @page { size: 6in 4in; margin: 0; }
                  body {
                      margin: 0;
                      padding: 0;
                      font-family: Arial, sans-serif;
                  }
                  .label-container {
                      width: 6in;
                      height: 4in;
                      display: flex;
                      justify-content: space-between;
                      padding: 20px;
                      box-sizing: border-box;
                      page-break-after: always;
                  }
                  .text-container {
                      display: flex;
                      flex-direction: column;
                      justify-content: center;
                      flex-grow: 1;
                  }
                  .location-name {
                      font-size: 72px;
                      text-align: left;
                  }
                  .barcode-container {
                      margin-top: 20px;
                      text-align: left;
                  }
                  .arrow-container {
                      font-size: 100px;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      margin-left: 20px;
                      margin-right: 20px;
                  }
              </style>
          </head>
          <body>
      `);

  locationIds.forEach((locationId) => {
    const arrowDirection = getArrowDirection(locationId);
    labelsWindow.document.write(`
              <div class="label-container">
                  <div class="text-container">
                      <div class="location-name">${locationId}</div>
                      <div class="barcode-container">
                          <svg id="barcode-${locationId}"></svg>
                      </div>
                  </div>
                  <div class="arrow-container">${arrowDirection}</div>
              </div>
          `);
  });

  labelsWindow.document.write(`
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.0/dist/JsBarcode.all.min.js"></script>
          <script>
              ${locationIds
                .map(
                  (locationId) => `
                  JsBarcode(document.getElementById('barcode-${locationId}'), '${locationId}', {
                      format: "CODE128",
                      width: 4,
                      height: 100,
                      displayValue: false
                  });
              `
                )
                .join("")}
          </script>
          </body>
          </html>
      `);

  labelsWindow.document.close();
  labelsWindow.focus();
}

function startBarcodeScanner(inputId) {
  const scannerOverlay = document.createElement("div");
  scannerOverlay.id = "scanner-overlay";
  scannerOverlay.style.position = "fixed";
  scannerOverlay.style.top = "0";
  scannerOverlay.style.left = "0";
  scannerOverlay.style.width = "100%";
  scannerOverlay.style.height = "100%";
  scannerOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  scannerOverlay.style.zIndex = "1000";
  scannerOverlay.style.display = "flex";
  scannerOverlay.style.justifyContent = "center";
  scannerOverlay.style.alignItems = "center";

  const video = document.createElement("video");
  video.style.width = "100%";
  video.style.height = "100%";
  video.style.objectFit = "cover";
  scannerOverlay.appendChild(video);
  document.body.appendChild(scannerOverlay);

  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment" } })
    .then((stream) => {
      video.srcObject = stream;
      video.play();

      video.addEventListener("loadedmetadata", () => {
        Quagga.init(
          {
            inputStream: {
              type: "LiveStream",
              target: video,
            },
            decoder: {
              readers: ["code_128_reader"],
            },
          },
          function (err) {
            if (err) {
              console.error(err);
              return;
            }
            Quagga.start();
          }
        );
      });

      Quagga.onDetected(function (data) {
        document.getElementById(inputId).value = data.codeResult.code;

        // Automatically trigger the corresponding button
        triggerSearchButton(inputId);

        stopBarcodeScanner(stream);
      });
    })
    .catch((err) => {
      console.error("Error accessing camera:", err);
      if (scannerOverlay && scannerOverlay.parentNode) {
        document.body.removeChild(scannerOverlay);
      }
    });
}

function stopBarcodeScanner(stream) {
  Quagga.stop();

  // Stop the camera stream
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }

  // Remove the scanner overlay safely
  const scannerOverlay = document.getElementById("scanner-overlay");
  if (scannerOverlay && scannerOverlay.parentNode) {
    document.body.removeChild(scannerOverlay);
  }
}

function triggerSearchButton(inputId) {
  let buttonId;

  if (inputId === "locateSearch") {
    buttonId = "locateSearchBtn";
  } else if (inputId === "locateLocationId") {
    buttonId = "locateLocationIdBtn";
  } else if (inputId === "editLocationId") {
    buttonId = "editLocationIdBtn";
  } else if (inputId === "newLocationId") {
    buttonId = "newLocationIdBtn";
  }

  if (buttonId) {
    document.getElementById(buttonId).click();
  }
}

function filterTable() {
  const itemNumberFilter = document
    .getElementById("itemNumberFilter")
    .value.trim()
    .toUpperCase();
  const locationIdFilter = document
    .getElementById("locationIdFilter")
    .value.trim()
    .toUpperCase();
  const cartonCountFilter = document
    .getElementById("cartonCountFilter")
    .value.trim();

  const table = document.getElementById("allItemsTable");
  const rows = Array.from(table.getElementsByTagName("tbody")[0].rows);

  rows.forEach((row) => {
    const itemNumber = row.cells[0].innerText.trim().toUpperCase();
    const locationId = row.cells[1].innerText.trim().toUpperCase();
    const cartonCount = row.cells[2].innerText.trim();

    const itemNumberMatch = itemNumber.includes(itemNumberFilter);
    const locationIdMatch = locationId.includes(locationIdFilter);
    const cartonCountMatch = cartonCount.includes(cartonCountFilter);

    if (itemNumberMatch && locationIdMatch && cartonCountMatch) {
      row.style.display = ""; // Show the row
    } else {
      row.style.display = "none"; // Hide the row
    }
  });
}

let currentSortColumn = null;
let currentSortOrder = "asc"; // Default sort order

function sortTable(column) {
  const table = document
    .getElementById("allItemsTable")
    .getElementsByTagName("tbody")[0];
  let rows = Array.from(table.rows);

  // If sorting Location ID, use the custom location sort function
  if (column === "locationId") {
    rows.sort((a, b) => {
      const aValue = parseLocationId(
        a.cells[getColumnIndex(column)].innerText.trim()
      );
      const bValue = parseLocationId(
        b.cells[getColumnIndex(column)].innerText.trim()
      );

      return compareLocationIds(aValue, bValue);
    });

    // Sort in reverse if necessary
    if (currentSortOrder === "desc") {
      rows.reverse();
    }

    currentSortOrder = currentSortOrder === "asc" ? "desc" : "asc"; // Toggle sort order

    while (table.firstChild) {
      table.removeChild(table.firstChild);
    }
    rows.forEach((row) => table.appendChild(row));

    updateSortArrows(column);
  } else {
    // Handle other columns if necessary
  }
}

// Helper function to parse the Location ID into its components
function parseLocationId(locationId) {
  const parts = locationId.split("-");
  return {
    isle: parts[0],
    row: parseInt(parts[1], 10), // Convert the row part to an integer
    spot: parts[2],
  };
}

// Helper function to compare two Location IDs based on the custom sorting logic
function compareLocationIds(a, b) {
  if (a.isle < b.isle) return -1;
  if (a.isle > b.isle) return 1;

  if (a.row < b.row) return -1;
  if (a.row > b.row) return 1;

  // Sort A-B before C-D
  if ((a.spot === "A" || a.spot === "B") && (b.spot === "C" || b.spot === "D"))
    return -1;
  if ((a.spot === "C" || a.spot === "D") && (b.spot === "A" || b.spot === "B"))
    return 1;

  return a.spot < b.spot ? -1 : 1;
}

// Helper function to parse the Location ID into its components
function parseLocationId(locationId) {
  const parts = locationId.split("-");
  return {
    isle: parts[0],
    row: parseInt(parts[1], 10), // Convert the row part to an integer
    spot: parts[2],
  };
}

// Helper function to compare two Location IDs based on your custom sorting logic
function compareLocationIds(a, b) {
  if (a.isle < b.isle) return -1;
  if (a.isle > b.isle) return 1;

  if (a.row < b.row) return -1;
  if (a.row > b.row) return 1;

  // Sort spots A-B before C-D
  if (a.spot === b.spot) return 0;
  if (a.spot === "A" || a.spot === "B") {
    if (b.spot === "A" || b.spot === "B") {
      return a.spot < b.spot ? -1 : 1;
    } else {
      return -1;
    }
  } else if (a.spot === "C" || a.spot === "D") {
    if (b.spot === "C" || b.spot === "D") {
      return a.spot < b.spot ? -1 : 1;
    } else {
      return 1;
    }
  }
  return 0;
}

function getColumnIndex(column) {
  switch (column) {
    case "itemNumber":
      return 0;
    case "locationId":
      return 1;
    case "cartonCount":
      return 2;
    default:
      return 0;
  }
}

function updateSortArrows(column) {
  document.querySelectorAll(".sort-arrow").forEach((arrow) => {
    arrow.innerText = ""; // Clear all arrows
  });

  const arrowElement = document.getElementById(`sort${capitalize(column)}`);
  arrowElement.innerText = currentSortOrder === "asc" ? "↑" : "↓";
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateAndPrintLabelRange() {
  const startLocation = document.getElementById("startLocation").value.trim();
  const endLocation = document.getElementById("endLocation").value.trim();

  const labelsJson = generateLabelRangeJson(startLocation, endLocation);

  if (labelsJson && labelsJson.length > 0) {
    generateBulkLabels(labelsJson.map((label) => label.locationId));
  } else {
    alert("No labels generated. Please check the range and try again.");
  }
}

function generateLabelRangeJson(startLocation, endLocation) {
  // Standardize the input locations
  startLocation = standardizeLocation(startLocation);
  endLocation = standardizeLocation(endLocation);

  const start = parseLocationId(startLocation);
  const end = parseLocationId(endLocation);

  if (start.isle !== end.isle) {
    alert("Isle must be the same for the range.");
    return;
  }

  const labels = [];
  const maxSections = 48; // 12 rows * 4 spots = 48 sections
  let totalSections = 0;

  // First, collect the left side (A and B)
  for (let row = start.row; row <= end.row; row++) {
    for (let spot of ["A", "B"]) {
      if (row === start.row && spot < start.spot) continue;
      if (row === end.row && spot > end.spot) break;

      totalSections++;

      if (totalSections > maxSections) {
        alert("The range cannot exceed 48 sections.");
        return;
      }

      const location = `${start.isle}-${row}-${spot}`;
      labels.push({ locationId: location });
    }
  }

  // Then, collect the right side (C and D)
  for (let row = start.row; row <= end.row; row++) {
    for (let spot of ["C", "D"]) {
      if (row === start.row && spot < start.spot) continue;
      if (row === end.row && spot > end.spot) break;

      totalSections++;

      if (totalSections > maxSections) {
        alert("The range cannot exceed 48 sections.");
        return;
      }

      const location = `${start.isle}-${row}-${spot}`;
      labels.push({ locationId: location });
    }
  }

  return labels;
}

function parseLocationId(locationId) {
  const parts = locationId.split("-");
  return {
    isle: parts[0],
    row: parseInt(parts[1], 10),
    spot: parts[2],
  };
}

function getSideValue(spot) {
  if (spot === "A" || spot === "B") {
    return 0; // Right side
  } else if (spot === "C" || spot === "D") {
    return 1; // Left side
  }
}

// Import CSV with Password Protection, Backup, and Replacement

function importCsv() {
  const password = prompt("Please enter the password:");
  if (password !== "Alex1122") {
    alert("Incorrect password.");
    return;
  }

  const fileInput = document.getElementById("csvFileInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a CSV file.");
    return;
  }

  // Create a backup of the current data.json file before proceeding
  backupCurrentData();

  const reader = new FileReader();
  reader.onload = function (event) {
    const csvData = event.target.result;
    const newProcessedData = processCsvData(csvData);
    generateDifferenceReport(newProcessedData); // Generate differences report
    replaceJsonData(newProcessedData); // Replace the existing JSON data with the new data
  };
  reader.readAsText(file);
}

// Create a backup of the current JSON file
function backupCurrentData() {
  const dateTime = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\..+/, "");
  const backupFileName = `/backup/data~backup${dateTime}.json`;

  fetch("/backupData", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ backupFileName }),
  })
    .then((response) => response.json())
    .then((result) => {
      console.log("Backup created successfully:", result.message);
    })
    .catch((error) => {
      console.error("Error creating backup:", error);
    });
}

// Process the CSV file and prepare new data
function processCsvData(csvData) {
  const rows = csvData.split("\n").filter((row) => row.trim() !== "");
  const newData = {};

  rows.slice(1).forEach((row) => {
    const [itemNumber, locationId, cartonCount, itemsPerCarton] = row
      .split(",")
      .map((cell) => cell.trim());

    const standardizedItemNumber = standardizeItemNumber(itemNumber);
    const standardizedLocationId = standardizeLocation(locationId);
    const standardizedCartonCount = parseInt(cartonCount, 10) || 1;
    const standardizedItemsPerCarton = parseInt(itemsPerCarton, 10) || null;

    // Add the data to the newData structure, handling multiple items per location
    if (!newData[standardizedItemNumber]) {
      newData[standardizedItemNumber] = {
        itemNumber: standardizedItemNumber,
        locations: [],
      };
    }
    newData[standardizedItemNumber].locations.push({
      locationId: standardizedLocationId,
      cartonCount: standardizedCartonCount,
      itemsPerCarton: standardizedItemsPerCarton,
    });
  });

  return Object.values(newData);
}

// Replace the JSON data with new data
function replaceJsonData(newData) {
  fetch("/replaceData", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newData),
  })
    .then((response) => response.json())
    .then((result) => {
      alert(result.message);
    })
    .catch((error) => {
      console.error("Error replacing data:", error);
      alert("Error replacing data. Please try again.");
    });
}

// Compare old data with new data and generate a CSV report of differences
function generateDifferenceReport(newData) {
  fetch("/getCurrentData")
    .then((response) => response.json())
    .then((currentData) => {
      const differences = [
        [
          "Item Number",
          "Location ID",
          "Old Carton Count",
          "New Carton Count",
          "Old Items Per Carton",
          "New Items Per Carton",
        ],
      ];

      newData.forEach((newItem) => {
        const existingItem = currentData.find(
          (item) => item.itemNumber === newItem.itemNumber
        );

        newItem.locations.forEach((newLocation) => {
          const existingLocation = existingItem
            ? existingItem.locations.find(
                (loc) => loc.locationId === newLocation.locationId
              )
            : null;

          if (existingLocation) {
            if (
              existingLocation.cartonCount !== newLocation.cartonCount ||
              existingLocation.itemsPerCarton !== newLocation.itemsPerCarton
            ) {
              differences.push([
                newItem.itemNumber,
                newLocation.locationId,
                existingLocation.cartonCount,
                newLocation.cartonCount,
                existingLocation.itemsPerCarton,
                newLocation.itemsPerCarton,
              ]);
            }
          } else {
            // New location added
            differences.push([
              newItem.itemNumber,
              newLocation.locationId,
              "N/A",
              newLocation.cartonCount,
              "N/A",
              newLocation.itemsPerCarton,
            ]);
          }
        });
      });

      saveDifferenceReport(differences);
    })
    .catch((error) => {
      console.error("Error generating difference report:", error);
    });
}

// Save the difference report as a CSV file
function saveDifferenceReport(differences) {
  const csvContent = differences.map((e) => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("href", url);
  a.setAttribute(
    "download",
    `difference_report_${new Date().toISOString()}.csv`
  );
  a.click();
}

// Utility functions to standardize inputs
function standardizeLocation(input) {
  input = input.toUpperCase();
  const match = input.match(/^([A-Z]{1,2})[-]?(\d{1,2})[-]?([A-E])$/);
  if (match) {
    const letterPart = match[1];
    const numberPart = parseInt(match[2], 10);
    const letterSuffix = match[3];
    return `${letterPart}-${numberPart}-${letterSuffix}`;
  } else {
    console.error(`Invalid location format encountered: ${input}`);
    throw new Error("Invalid location format");
  }
}

function standardizeItemNumber(input) {
  return input.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

document.addEventListener("DOMContentLoaded", loadAllItems);

function cleanAndBackupLocations() {
  // Step 1: Backup the data
  fetch("/backupData", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ backupFileName: `backup_${Date.now()}.json` }),
  })
    .then((response) => response.json())
    .then((backupResponse) => {
      console.log(backupResponse.message);

      // Step 2: Clean the locations after backup is complete
      fetch("/cleanLocations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => response.json())
        .then((cleanResponse) => {
          alert(cleanResponse.message);
        })
        .catch((error) => console.error("Error cleaning locations:", error));
    })
    .catch((error) => console.error("Error creating backup:", error));
}

function showHiddenProducts() {
  // Hide all current sections
  document.querySelectorAll(".tab-pane").forEach((tab) => {
    tab.style.display = "none";
  });

  // Show the hidden products page
  document.getElementById("hiddenProductsPage").style.display = "block";

  // Fetch and display the hidden products
  fetch("/hiddenProductsReport")
    .then((response) => response.json())
    .then((data) => {
      const tableBody = document.getElementById("hiddenProductsTableBody");
      tableBody.innerHTML = ""; // Clear existing rows

      if (data.hiddenProducts.length > 0) {
        data.hiddenProducts.forEach((product) => {
          const row = document.createElement("tr");
          row.innerHTML = `
              <td>${product.itemNumber}</td>
              <td>${product.locationId}</td>
              <td>${product.blockedBy}</td>
            `;
          tableBody.appendChild(row);
        });
      } else {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="3">No hidden products found</td>`;
        tableBody.appendChild(row);
      }
    })
    .catch((error) => {
      console.error("Error fetching hidden products report:", error);
      alert("Error fetching report.");
    });
}
