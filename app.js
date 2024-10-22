// Fixed fees and charges
const fixedFees = {
    dealerAgencyFee: 912.25,
    establishmentFee: 395,
    securityRegistrationFee: 6,
    fortnightlyRepaymentFee: 4.95,
    ppsrFee: 9.75
};

// Function to display error messages
function displayError(vehicleNum, message) {
    const errorElement = document.getElementById(`error${vehicleNum}`);
    errorElement.textContent = message;
    errorElement.classList.add('error-input');
}

// Function to clear error messages
function clearError(vehicleNum) {
    const errorElement = document.getElementById(`error${vehicleNum}`);
    errorElement.textContent = '';
    errorElement.classList.remove('error-input');
}

// Function to validate minimum required inputs (Vehicle 1 and Vehicle 2)
function validateMinimumInputs() {
    const vehicle1Complete = document.getElementById('name1').value && document.getElementById('loan1').value && document.getElementById('rate1').value;
    const vehicle2Complete = document.getElementById('name2').value && document.getElementById('loan2').value && document.getElementById('rate2').value;

    if (!vehicle1Complete || !vehicle2Complete) {
        displayError(1, 'Vehicle 1 and 2 data are required.');
        return false;
    }
    clearError(1);
    return true;
}

// Function to validate additional vehicles (Vehicle 3, 4, 5)
function validateAdditionalVehicles() {
    for (let i = 3; i <= 5; i++) {
        const name = document.getElementById(`name${i}`).value;
        const loan = document.getElementById(`loan${i}`).value;
        const rate = document.getElementById(`rate${i}`).value;

        if ((name || loan || rate) && !(name && loan && rate)) {
            displayError(i, `Please complete all required fields for Vehicle ${i} or leave it blank.`);
            return false;
        }
        clearError(i);
    }
    return true;
}

// Function to show a loading spinner during calculations
function showSpinner() {
    document.getElementById('spinner').style.display = 'block';
}

// Function to hide the loading spinner after calculations
function hideSpinner() {
    document.getElementById('spinner').style.display = 'none';
}

// Keep track of the chart instance
let chartInstance = null;

// Main function to calculate loan for all vehicles
function calculateAll() {
    if (!validateMinimumInputs() || !validateAdditionalVehicles()) {
        return;
    }

    showSpinner();

    // Fix: Loop through only vehicles with valid data
    setTimeout(() => {
        for (let i = 1; i <= 5; i++) {
            const loan = document.getElementById(`loan${i}`).value;

            if (loan) {  // Only calculate if there is valid loan data
                calculateLoan(i);
            } else {
                console.log(`Vehicle ${i} has no loan data, skipping...`);
            }
        }
        hideSpinner();
        highlightBestOption();
    }, 1000);  // Simulate a delay in calculations
}

// Function to calculate the loan for each vehicle
function calculateLoan(vehicleNum) {
    const loan = parseFloat(document.getElementById(`loan${vehicleNum}`).value);
    const rate = parseFloat(document.getElementById(`rate${vehicleNum}`).value);
    const term = parseFloat(document.getElementById(`term${vehicleNum}`).value);
    const down = parseFloat(document.getElementById(`down${vehicleNum}`).value) || 0;
    const balloon = parseFloat(document.getElementById(`balloon${vehicleNum}`).value) || 0;
    const extra = parseFloat(document.getElementById(`extra${vehicleNum}`).value) || 0;

    const loanAmount = loan - down - balloon;

    // Fixed fees (one-time fees)
    const oneTimeFees = fixedFees.dealerAgencyFee + fixedFees.establishmentFee + fixedFees.securityRegistrationFee + fixedFees.ppsrFee;
    
    // Fortnightly fee converted to monthly (approx. 2.17 fortnights in a month)
    const monthlyFortnightlyFee = fixedFees.fortnightlyRepaymentFee * 2.17;

    // Add one-time fees to loan amount for calculation
    const adjustedLoanAmount = loanAmount + oneTimeFees;

    const monthlyRate = rate / 100 / 12;
    const months = term * 12;

    // Monthly payment calculation with adjusted loan amount
    const monthlyPayment = (adjustedLoanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));

    // Add the monthly recurring fee and any extra payments
    const totalMonthlyPayment = monthlyPayment + monthlyFortnightlyFee + extra;

    console.log(`Vehicle ${vehicleNum} monthly payment (with fees): $${totalMonthlyPayment.toFixed(2)}`);
    document.getElementById(`result${vehicleNum}`).textContent = `Monthly Payment: $${totalMonthlyPayment.toFixed(2)}`;
    updateChart();
}


// Function to update the chart with vehicle data
function updateChart() {
    const vehicleNames = [];
    const monthlyPayments = [];

    for (let i = 1; i <= 5; i++) {
        const name = document.getElementById(`name${i}`).value || `Vehicle ${i}`;
        const resultText = document.getElementById(`result${i}`).textContent;
        const payment = parseFloat(resultText.replace(/[^\d.]/g, '')) || 0;

        vehicleNames.push(name);
        monthlyPayments.push(payment);
    }

    const ctx = document.getElementById('comparisonChart').getContext('2d');

    // Destroy the old chart instance if it exists
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Create a new chart instance
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: vehicleNames,
            datasets: [{
                label: 'Monthly Payment',
                data: monthlyPayments,
                backgroundColor: ['#FFEBEE', '#E8F5E9', '#E3F2FD', '#FFF3E0', '#F3E5F5']
            }]
        },
        options: {
            responsive: true,
            animation: {
                duration: 1000,
                easing: 'easeInOutQuad'
            }
        }
    });
}

// Function to highlight the best option (lowest monthly payment)
function highlightBestOption() {
    let bestVehicle = 1;
    let lowestPayment = Infinity;

    for (let i = 1; i <= 5; i++) {
        const resultText = document.getElementById(`result${i}`).textContent;
        const payment = parseFloat(resultText.replace(/[^\d.]/g, ''));

        if (payment < lowestPayment) {
            lowestPayment = payment;
            bestVehicle = i;
        }
    }

    for (let i = 1; i <= 5; i++) {
        document.getElementById(`vehicle${i}`).style.border = '1px solid #ccc';
    }

    document.getElementById(`vehicle${bestVehicle}`).style.border = '2px solid green';
}

// Save data in localStorage
function saveData() {
    for (let i = 1; i <= 5; i++) {
        const data = {
            name: document.getElementById(`name${i}`).value,
            loan: document.getElementById(`loan${i}`).value,
            rate: document.getElementById(`rate${i}`).value,
            term: document.getElementById(`term${i}`).value,
            down: document.getElementById(`down${i}`).value,
            balloon: document.getElementById(`balloon${i}`).value,
            extra: document.getElementById(`extra${i}`).value
        };
        localStorage.setItem(`vehicle${i}`, JSON.stringify(data));
    }
}

// Load data from localStorage
function loadData() {
    for (let i = 1; i <= 5; i++) {
        const data = JSON.parse(localStorage.getItem(`vehicle${i}`));
        if (data) {
            document.getElementById(`name${i}`).value = data.name;
            document.getElementById(`loan${i}`).value = data.loan;
            document.getElementById(`rate${i}`).value = data.rate;
            document.getElementById(`term${i}`).value = data.term;
            document.getElementById(`down${i}`).value = data.down;
            document.getElementById(`balloon${i}`).value = data.balloon;
            document.getElementById(`extra${i}`).value = data.extra;
        }
    }
}

// Function to clear all input fields and refresh the page
function clearAll() {
    location.reload();
}
