

// --- ELEMENT SELECTORS ---
// Grabbing buttons and containers from the HTML to use in JS
const addButton = document.querySelector(".add-btn");
const container = document.querySelector("#course-container");
const calcButton = document.querySelector(".calc-btn"); 

/**
 * Generates the HTML string for a grade selection dropdown.
 * Using a template string makes it easy to maintain the list of grades.
 */
function createGradeDropdown() {
    return `
        <select class="grade">
            <option value="">Grade</option>
            <option value="A">A</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B">B</option>
            <option value="B-">B-</option>
            <option value="C+">C+</option>
            <option value="C">C</option>
            <option value="C-">C-</option>
            <option value="D+">D+</option>
            <option value="D">D</option>
            <option value="D-">D-</option>
            <option value="F">F</option>
        </select>
    `;
}

/**
 * Creates a new course row element.
 * It combines the grade dropdown and a number input for credits.
 */
function createRows() {
    const row = document.createElement("div");
    row.classList.add("row");

    // Inject the dropdown and the credit input into the new div
    row.innerHTML = `
        ${createGradeDropdown()}
        <input type="number" class="credits" placeholder="Credits">
    `;

    return row;
}

// --- INITIALIZATION ---
// When the page first loads, automatically create 4 empty course rows
for (let i = 0; i < 4; i++) {
    container.appendChild(createRows());
}

// --- EVENT LISTENERS ---

// Add a new row whenever the user clicks the "Add Class +" button
addButton.addEventListener("click", () => {
    container.appendChild(createRows());
});

// Run the GPA calculation logic when the calculate button is clicked
calcButton.addEventListener("click", calculateGPA);

function calculateGPA() {
    // Select all current course rows in the container
    const rows = document.querySelectorAll("#course-container .row");
    let totalPoints = 0;
    let totalCredits = 0;

    // Loop through each row to pull user data
    rows.forEach(row => {
        const grade = row.querySelector(".grade").value;
        const credits = Number(row.querySelector(".credits").value);

        // Standard GPA point values (IU Scale)
        const gradeMap = {
            "A": 4.0, "A-": 3.7,
            "B+": 3.3, "B": 3.0, "B-": 2.7,
            "C+": 2.3, "C": 2.0, "C-": 1.7,
            "D+": 1.3, "D": 1.0, "D-": 0.7,
            "F": 0.0
        };

        const gradeValue = gradeMap[grade];

        // Data Validation: Skip the row if a grade isn't selected or credits are missing/zero
        if (!grade || !credits || credits <= 0) return;

        // Points for a class = (Grade Value) * (Number of Credits)
        totalPoints += gradeValue * credits;
        totalCredits += credits;
    });

    // GPA = Total Grade Points / Total Number of Credits
    // We check totalCredits > 0 to avoid a "Division by Zero" error
    const gpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;

    // Display the result formatted to 2 decimal places
    document.getElementById("result").textContent = "Cumulative GPA: " + gpa.toFixed(2);
}

// --- AI ASSISTANT SECTION ---

const aiButton = document.querySelector("#ai-btn");
const aiInput = document.querySelector("#ai-input");
const aiOutput = document.querySelector("#ai-output");

aiButton.addEventListener("click", outputDisplay);

async function outputDisplay() {
    const message = aiInput.value.trim();
    
    // Clear the input box immediately after sending to improve UX
    aiInput.value = "";

    // Don't send anything to the server if the input is empty
    if (!message) return;

    aiOutput.textContent = "Thinking...";

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message }),
        });

        const data = await response.json();
        
        // Debugging: This will show you exactly what the server sent in the F12 console
        console.log("Server Response:", data);

        // FIX: Check for 'data.reply' OR 'data.text'. 
        // If both are missing, use an empty string to prevent the 'marked' error.
        const contentToParse = data.reply || data.text || "";

        if (!contentToParse) {
            aiOutput.textContent = "AI returned an empty response.";
            return;
        }

        const htmlOutput = marked.parse(contentToParse); 
        document.getElementById("ai-output").innerHTML = htmlOutput;
    }
    catch(err) {
        // Log the error for debugging and tell the user something went wrong
        console.error(err);
        aiOutput.textContent = "Something went wrong. Please check your connection.";
    }
}