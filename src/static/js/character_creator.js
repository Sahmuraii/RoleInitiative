function generateClassPage(inputClass) {
    parentObject = document.getElementById("class");
    parentObject.innerHTML += `
        <div id="${inputClass}" class="tab-content">
            <p>This is class ${inputClass}.</p>
        </div>
    `
}


function generateClassTabs(inputClass) {
    tabObject = document.getElementById("classtabs");
    tabObject.innerHTML += `<button class="tab" onclick="generateClassPage('${inputClass}'); showTab('${inputClass}')">${inputClass}</button>`
}

// Show and hide attribute sections based on selected method
document.getElementById('stat_method').addEventListener('change', function () {
    const method = this.value;
    // Hide all sections
    document.getElementById('standard_array').style.display = 'none';
    document.getElementById('point_buy').style.display = 'none';
    document.getElementById('roll').style.display = 'none';
    document.getElementById('manual').style.display = 'none';
    document.getElementById('attribute_fields').style.display = 'none';
    document.getElementById('attribute_fields_dropdown').style.display = 'none';

    // Show the selected section
    document.getElementById(method).style.display = 'block';

    // Reset remaining points if switching to Point Buy
    if (method === 'point_buy') {
        remainingPoints = maxPoints;
        document.getElementById('remainingPoints').innerText = `Points left: ${remainingPoints}`;
        document.getElementById('remainingPoints').style.display = 'block';
    } else {
        document.getElementById('remainingPoints').style.display = 'none';
    }

    // Reset all attribute stats to default value
    if (method === 'point_buy' || method === 'manual') {
        document.getElementById('attribute_fields').style.display = '';
        document.querySelectorAll('#attribute_fields input[type="number"]').forEach(input => {
            input.value = method === 'point_buy' ? 8 : 10; // Reset to Point Buy or Manual defaults
        });
    } else {
        document.getElementById('attribute_fields_dropdown').style.display = '';
        // Hide initial values
        const dropdowns = document.querySelectorAll('#attribute_fields_dropdown select');
        dropdowns.forEach(dropdown => {
            const options = dropdown.querySelectorAll('option');

            options.forEach(option => {
                const value = parseInt(option.getAttribute('value'), 10); // Check the value attribute
                option.text = "—";
                if (method === 'standard_array') {
                    option.style.display = '';
                    option.text = (() => {
                        switch (value) {
                            case 0: return 15;
                            case 1: return 14;
                            case 2: return 13;
                            case 3: return 12;
                            case 4: return 10;
                            case 5: return 8;
                            default: return "—";
                        }
                    })();
                } else if (value >= 0) {
                    option.style.display = 'none'; // Hide the option
                }
            });
            dropdown.value = -1;
        });
    }
    updateAllButtonsVisibility();
});

// This is unfortunately necessary because loading the page will otherwise not be considered a "change" (dumb)
// Effectively calls the above on load
document.getElementById('stat_method').dispatchEvent(new Event('change'));

function checkAvailability(statId, optionValue) {
    if (optionValue == -1) {
        return;
    }
    const isStandardArray = document.getElementById('stat_method').value === 'standard_array';
    // We want to check that the optionValue being chosen either does not match the optionValue for any other stat (dropdown) or there are enough of that value to go around
    const currentDropdown = document.getElementById(statId);
    // Get all dropdowns in the attribute fields container
    const dropdowns = document.querySelectorAll('#attribute_fields_dropdown select');

    if (isStandardArray) {
        dropdowns.forEach(dropdown => {
            if (dropdown.value == optionValue && currentDropdown != dropdown) {
                dropdown.value = -1;
            }
        });
    } else { // Is Rolls
        const spanText = document.getElementById('roll_attribute_array').textContent;
        // Split text into array
        const valuesArray = spanText.split(', ').map(value => value.trim());

        // Create a dictionary from the array of values
        let valueDict = {};
        valuesArray.forEach(value => {
            if (!isNaN(value)) { // Check if the value is a valid number. Keep this
                if (valueDict[value] === undefined) {
                    valueDict[value] = 1; // Initialize count as 1 if it is the first occurrence
                } else {
                    valueDict[value]++; // Increment the count if the value already exists
                }
            }
        });
        console.log(valueDict);

        let occurrences = 0;
        dropdowns.forEach(dropdown => {
            const selectedOption = dropdown.querySelector(`option[value="${dropdown.value}"]`);
            console.log("selected option: " + selectedOption);
            // Check for the actual text value of our option (is a number. DON'T PARSEINT. didn't work when I did)
            const optionText = selectedOption.textContent;
            if (dropdown.value == optionValue && currentDropdown != dropdown) {
                occurrences++;
                console.log("occurrences: " + occurrences);
                if (occurrences >= (valueDict[optionText])) {
                    // admittedly, this feels like it removes at random so
                    //it's a tiny bit janky but it isn't random. Don't know
                    //what alternative there'd be with this implementation
                    dropdown.value = -1;
                }
            }
        });
    }
}

// Point Buy implementation
const maxPoints = 27;
let remainingPoints = maxPoints;

function adjustStat(statId, change) {
    const statInput = document.getElementById(statId);
    let currentValue = parseInt(statInput.value);
    // Assuming buttons being available to be pressed logic works, this is always true, but safeguard
    if (currentValue + change >= statInput.min && currentValue + change <= statInput.max) {

        // Handle Point Buy logic if applicable
        if (document.getElementById('point_buy').style.display !== 'none') {
            if (change == 1) {
                // + button hit going to 14 or 15
                if (currentValue + change >= 14) {
                    remainingPoints -= 2;
                } else {
                    remainingPoints -= 1;
                }
            } else {
                // - button hit going to 14 or 13
                if (currentValue + change >= 13) {
                    remainingPoints += 2;
                } else {
                    remainingPoints += 1;
                }
            }
            // Actually update the value
            statInput.value = currentValue + change;
        } else {
            // Manual Adjustment
            statInput.value = currentValue + change;
        }

        // Update remaining points display if using Point Buy
        const remainingPointsDisplay = document.getElementById('remainingPoints');
        if (remainingPointsDisplay.style.display !== 'none') {
            remainingPointsDisplay.innerText = `Points left: ${remainingPoints}`;
        }
        updateAllButtonsVisibility();
    }
}

// Handles + and - button visibility and disability
function updateAllButtonsVisibility() {
    const isPointBuy = document.getElementById('stat_method').value === 'point_buy';
    const isManual = document.getElementById('stat_method').value === 'manual';

    document.querySelectorAll('#attribute_fields input[type="number"]').forEach(statInput => {
        const statId = statInput.id;
        const increaseButton = statInput.nextElementSibling;
        const decreaseButton = statInput.previousElementSibling;
        if (isPointBuy || isManual) {
            const currentValue = parseInt(statInput.value);

            // Maximum and minimum limits for Point Buy and Manual modes
            const maxLimit = isPointBuy ? 15 : 20;
            const minLimit = isPointBuy ? 8 : 1;

            // Determine if there are sufficient points for Point Buy
            const canIncrease = isPointBuy
            ? remainingPoints >= 2 || (remainingPoints >= 1 && currentValue <= 12)
            : true;

            // Show/hide buttons based on conditions
            increaseButton.style.visibility = "visible";
            decreaseButton.style.visibility = "visible";
            //increaseButton.style.visibility = (currentValue < maxLimit && canIncrease) ? 'visible' : 'hidden';
            //decreaseButton.style.visibility = (currentValue > minLimit) ? 'visible' : 'hidden'; // No need to check remaining points on decrease
            if (currentValue < maxLimit && canIncrease) {
                increaseButton.removeAttribute("disabled");
            } else {
                increaseButton.setAttribute("disabled", "true");
            }
            if (currentValue > minLimit) {
                decreaseButton.removeAttribute("disabled");
            } else {
                decreaseButton.setAttribute("disabled", "true");
            }
        } else {
            increaseButton.style.visibility = "hidden";
            decreaseButton.style.visibility = "hidden";

        }
    });
}


// Roll stats with 3 inputs
function rollStats(numDice = 4, diceType = 6, dropLowest = 1) {
    const attributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    let results = [];
    attributes.forEach(attribute => { // Now that self assign, technically no point in this but still iterates correct number of times
        let rolls = [];

        // Roll the dice
        for (let i = 0; i < numDice; i++) {
            rolls.push(Math.floor(Math.random() * diceType) + 1);
        }

        // Sort rolls and drop the lowest Z
        rolls.sort((a, b) => a - b);
        const keptRolls = rolls.slice(dropLowest);

        // Calculate the total and update the field
        const total = keptRolls.reduce((sum, roll) => sum + roll, 0);
        results.push(total);
    });
    results.sort((a, b) => b - a);
    // Hide initial values
    const dropdowns = document.querySelectorAll('#attribute_fields_dropdown select');
    dropdowns.forEach(dropdown => {
        let seenValues = []
        const options = dropdown.querySelectorAll('option');

        options.forEach(option => {
            const value = parseInt(option.getAttribute('value'), 10); // Check the value attribute
            option.text = "—";
            option.style.display = '';
            prospectiveText = (() => {
                switch (value) {
                    case 0: return results[0];
                    case 1: return results[1];
                    case 2: return results[2];
                    case 3: return results[3];
                    case 4: return results[4];
                    case 5: return results[5];
                    default: return "—";
                }
            })();
            option.text = prospectiveText;
            if (seenValues.includes(prospectiveText)) {
                option.style.display = 'none'; // Hide the option if there's a duplicate
            }
            seenValues.push(prospectiveText);
        });
        // Remove "—" from seenValues and sort
        seenValues = seenValues.filter(value => value !== "—").sort((a, b) => b - a);
        // Display seenValues in the roll_attribute_array span
        const seenValuesSpan = document.getElementById('roll_attribute_array');
        if (seenValuesSpan) {
            seenValuesSpan.textContent = seenValues.join(', '); // Update span with comma-separated list of seenValues
        }
        dropdown.value = -1;
    });
}

// Example usage: roll 4d6 and drop the lowest 1, Now customizable pog
document.getElementById('rollStatsButton').addEventListener('click', function() {
    const numDice = document.getElementById('numDice').value;
    const typeDice = document.getElementById('typeDice').value;
    const dropDice = document.getElementById('dropDice').value;
    rollStats(numDice, typeDice, dropDice);
});

// Because my brother is a goblin. Hard enforce max and min so he can't break it
document.getElementById("numDice").addEventListener("input", function() {
    const value = parseInt(this.value, 10);
    const min = parseInt(this.min, 10);
    const max = parseInt(this.max, 10);

    if (value < min) {
        this.value = min;
    } else if (value > max) {
        this.value = max;
    }
});

document.getElementById("typeDice").addEventListener("input", function() {
    const value = parseInt(this.value, 10);
    const min = parseInt(this.min, 10);
    const max = parseInt(this.max, 10);

    if (value < min) {
        this.value = min;
    } else if (value > max) {
        this.value = max;
    }
});

document.getElementById("dropDice").addEventListener("input", function() {
    const value = parseInt(this.value, 10);
    const min = parseInt(this.min, 10);
    const max = parseInt(this.max, 10);

    if (value < min) {
        this.value = min;
    } else if (value > max) {
        this.value = max;
    }
});

// For the big tabs at top but can reuse for my class implementation idea
function showTab(tabId) {
    // Remove 'active' class from all tabs and tab contents
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Add 'active' class to selected tab and corresponding content
    document.querySelector(`button[onclick="showTab('${tabId}')"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

function prepFormSubmission(){
    setHiddenCharacterSummary()
}

function setHiddenCharacterSummary() {
    storeFinalValue("final-str", "summary-strength");
    storeFinalValue("final-dex", "summary-dexterity");
    storeFinalValue("final-con", "summary-constitution");
    storeFinalValue("final-int", "summary-intelligence");
    storeFinalValue("final-wis", "summary-wisdom");
    storeFinalValue("final-cha", "summary-charisma");
}

function storeFinalValue(finalValue, summaryValue) {
    document.getElementById(finalValue).value = document.getElementById(summaryValue).textContent;
}

const firstClassSelect = document.getElementById("selectFirstClass");
function showClassProficiencies() {
    if ( firstClassSelect.value === "None") {
        document.getElementById("class_proficiency_list_no-class-selected").style.display = "block";
        var class_proficiency_lists = document.getElementsByName("class_proficiency_lists");
        class_proficiency_lists.forEach(element => {
            element.style.display = "none";
            element.setAttribute("disabled", "true");
        });
    } else {
        document.getElementById("class_proficiency_list_no-class-selected").style.display = "none";
        var class_proficiency_lists = document.getElementsByName("class_proficiency_lists");
        class_proficiency_lists.forEach(element => {
            element.style.display = "none";
            element.setAttribute("disabled", "true");
        });
        document.getElementById(`class_proficiency_list_${firstClassSelect.value}`).style.display = "block";
        document.getElementById(`class_proficiency_list_${firstClassSelect.value}`).removeAttribute("disabled");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Update summary values on input changes
    const summaryElements = {
        name: document.getElementById("summary-name"),
        race: document.getElementById("summary-race"),
        class: document.getElementById("summary-class"),
        stats: {
            strength: document.getElementById("summary-strength"),
            dexterity: document.getElementById("summary-dexterity"),
            constitution: document.getElementById("summary-constitution"),
            intelligence: document.getElementById("summary-intelligence"),
            wisdom: document.getElementById("summary-wisdom"),
            charisma: document.getElementById("summary-charisma"),
        },
    };

    // Update name
    const charNameInput = document.getElementById("charname");
    charNameInput.addEventListener("input", () => {
        summaryElements.name.textContent = charNameInput.value || "None";
    });

    // Update race
    const raceSelect = document.getElementById("charrace");
    raceSelect.addEventListener("change", () => {
        // Subtract 1 to account for no id's with value 0
        summaryElements.race.textContent = raceSelect.options[raceSelect.value - 1]?.text || "None";
    });

    // Update class summary
    const inputLevels = document.getElementsByName("multiclass_level");
    const classLabels = document.getElementsByName("multiclass_label");

    const summaryClassChange = () => {
        var summaryClass = document.getElementById("summary-class");
        var firstClassSelect = document.getElementById("selectFirstClass");
        var inputClasses = [];
        var classes = [];
        var levels = [];

        inputClasses.push("Null")
        for (var i = 0; i < inputLevels.length; i++) {
            inputClasses.push(classLabels[i].textContent);
        }

        for (var i = 0; i < inputLevels.length; i++) {
            if (inputLevels[i].value != 0) {
                classes.push(i+1);
                levels.push(inputLevels[i].value);
            }
        }
        
        if(classes.length == 0) {
            firstClassSelect.innerHTML = `<option value="None">No Classes Selected</option>`;
            summaryClass.textContent = "None";
        }
        else if (classes.length == 1) {
            summaryClass.textContent = `${inputClasses[classes[0]]} Lvl. ${levels[0]}`;
            firstClassSelect.innerHTML = `<option value="${classes[0]}">${inputClasses[classes[0]]}</option>`;
        } else {
            var totalLevel = 0;
            summaryClass.textContent = "";
            firstClassSelect.innerHTML = "";
            for (var i = 0; i < levels.length; i++) {
                totalLevel += Number(levels[i]);
            }
            summaryClass.textContent += `Total Level: ${totalLevel}, \n`;
            for (var i = 0; i < levels.length; i++) {
                if(i == levels.length - 1) {
                    summaryClass.textContent += `${inputClasses[classes[i]]} Lvl. ${levels[i]} \n`;
                } else {
                    summaryClass.textContent += `${inputClasses[classes[i]]} Lvl. ${levels[i]}, \n`;
                }
                firstClassSelect.innerHTML += `<option value="${classes[i]}">${inputClasses[classes[i]]}</option>`;
            }
        }

        //Update Proficiency Display
        showClassProficiencies()
    };

    const setLevelAllocation = () => {
        levels = document.getElementsByName("multiclass_level");
        spareLevelHTML = document.getElementById("sparelevels");
        currentLevelHTML = document.getElementById("currentlevel");
        var starting_level = 20;
        spare_levels = starting_level;

        levels.forEach(element => {
            spare_levels -= parseInt(element.value);
        });
        
        currentLevelHTML.innerHTML = `<p id="currentlevel">Your current level: ${20 - spare_levels}</p>`
        spareLevelHTML.innerHTML = `<p id="sparelevels">Levels left to allocate: ${spare_levels}</p>`

        levels.forEach(element => {
            element.setAttribute("max", parseInt(element.value) + spare_levels)
        });
    }

    // Add change listeners to class inputs
    inputLevels.forEach(input => {
        input.addEventListener("change", setLevelAllocation);
        input.addEventListener("change", summaryClassChange);
    });

    // Update stats
    const statInputs = [
        { id: "strength", key: "strength" },
        { id: "dexterity", key: "dexterity" },
        { id: "constitution", key: "constitution" },
        { id: "intelligence", key: "intelligence" },
        { id: "wisdom", key: "wisdom" },
        { id: "charisma", key: "charisma" },
    ];

    const updateDropdownStatDisplay = () => {
        statInputs.forEach((stat) => {
            const stat_id = stat.id + "_dd";
            const dropdown = document.getElementById(stat_id);
            const attribute_value = dropdown.querySelector(`option[value="${dropdown.value}"]`)?.text;
            summaryElements.stats[stat.key].textContent = attribute_value || 8;
        });
    };

    const updateStatDisplay = () => {
        statInputs.forEach((stat) => {
            const attrField = document.getElementById(stat.id);
            summaryElements.stats[stat.key].textContent = attrField.value || 8;
        });
    };

    const updateOnChangeStatDisplay = () => {
        const method = document.getElementById("stat_method").value;
        const isDropdown = method === "roll" || method === "standard_array";
        if (isDropdown) {
            updateDropdownStatDisplay();
        } else {
            updateStatDisplay();
        }
    };

    statInputs.forEach((stat) => {
        const stat_id = stat.id + "_dd";
        const dropdown = document.getElementById(stat_id);

        dropdown.addEventListener("change", updateDropdownStatDisplay);

        // Attach the update function to the relevant buttons
        document.querySelector(`[onclick="adjustStat('${stat.id}', -1)"]`).addEventListener("click", updateStatDisplay);
        document.querySelector(`[onclick="adjustStat('${stat.id}', 1)"]`).addEventListener("click", updateStatDisplay);

        // Ensure display is updated when stat method changes
        document.getElementById("stat_method").addEventListener("change", updateOnChangeStatDisplay);
    });

    //Update Class Proficiency List display
    const ClassChoiceSelect = document.getElementById("selectFirstClass");
    ClassChoiceSelect.addEventListener("change", showClassProficiencies);

    // Ensure the display is updated on page load
    if (charNameInput) charNameInput.dispatchEvent(new Event("input"));
    if (raceSelect) raceSelect.dispatchEvent(new Event("change"));
    if (inputLevels && classLabels) summaryClassChange();
    updateStatDisplay();
});

