document.addEventListener('DOMContentLoaded', () => {
    
    // Select Elements
    const form = document.getElementById('contactForm');
    const resultDiv = document.getElementById('formResult');
    const popup = document.getElementById('successPopup');
    const closePopupBtn = document.getElementById('closePopup');
    const submitBtn = document.getElementById('submitBtn');

    // 1. --- FORM SUBMISSION (Required Task) ---
    if (form) {
        form.addEventListener('submit', (e) => {
            // STOP PAGE RELOAD
            e.preventDefault(); 

            console.log("Submit clicked. Processing...");

            // Collect Data
            const formData = {
                name: document.getElementById('name').value,
                surname: document.getElementById('surname').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                ratings: [
                    parseInt(document.getElementById('q1').value) || 0,
                    parseInt(document.getElementById('q2').value) || 0,
                    parseInt(document.getElementById('q3').value) || 0
                ]
            };

            // Requirement: Print object to console
            console.log(formData);

            // Calculate Average
            const sum = formData.ratings.reduce((a, b) => a + b, 0);
            const average = (sum / formData.ratings.length).toFixed(1);

            // Determine Color
            let colorClass = '';
            if (average < 4) {
                colorClass = 'avg-red';
            } else if (average < 7) {
                colorClass = 'avg-orange';
            } else {
                colorClass = 'avg-green';
            }

            // Requirement: Display Data below form
            // Using inline styles or classes to match your request "one item per line"
            resultDiv.innerHTML = `
                <h3>Submission Results</h3>
                <p><b>Name: ${formData.name}</p></b>
                <p><b>Surname: ${formData.surname}</p></b>
                <p><b>Email: ${formData.email}</p></b>
                <p><b>Phone number: ${formData.phone}</p></b>
                <p><b>Address: ${formData.address}</p></b>
                
                <p style="font-size: 1.25rem; margin-top: 1rem;">
                    Rating Average: <span class="${colorClass}">${formData.name} ${formData.surname}: ${average}</span>
                </p>
            `;
            
            // Show result div
            resultDiv.classList.remove('hidden');

            // Requirement: Show Popup
            if(popup) popup.classList.remove('hidden');
        });
    }

    // Close Popup Logic
    if (closePopupBtn) {
        closePopupBtn.addEventListener('click', () => {
            popup.classList.add('hidden');
        });
    }

    // 2. --- OPTIONAL TASK: Validation & Masking ---
    
    // Regex Patterns
    const patterns = {
        name: /^[a-zA-Z]+$/,
        surname: /^[a-zA-Z]+$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        address: /.+/, // Not empty
        phone: /^\+370 \d{3} \d{5}$/ // Matches mask +370 6xx xxxxx
    };

    function validateField(field, regex) {
        if(field.type === "number") return true; // Skip strict regex for rating numbers
        
        const errorMsg = field.nextElementSibling; // The <small> tag
        const isValid = regex.test(field.value);

        if (isValid) {
            field.classList.remove('invalid');
            field.classList.add('valid');
            if(errorMsg) errorMsg.style.display = 'none';
        } else {
            field.classList.add('invalid');
            field.classList.remove('valid');
            if(errorMsg) {
                errorMsg.style.display = 'block';
                errorMsg.textContent = field.value === "" ? "Field cannot be empty" : "Invalid format";
            }
        }
        return isValid;
    }

    // Phone Masking Logic
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            // Remove non-digits
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,5})/);
            // Format: +370 6XX XXXXX
            e.target.value = !x[2] ? x[1] : '+370 ' + x[2] + (x[3] ? ' ' + x[3] : '');
            
            validateField(e.target, patterns.phone);
            checkFormValidity();
        });
    }

    // Attach listeners to other inputs
    const inputs = document.querySelectorAll('#contactForm input');
    inputs.forEach(input => {
        if (input.id !== 'phone') {
            input.addEventListener('keyup', (e) => {
                if (patterns[e.target.name]) {
                    validateField(e.target, patterns[e.target.name]);
                }
                checkFormValidity();
            });
        }
    });

    // Toggle Submit Button
    function checkFormValidity() {
        let allValid = true;
        inputs.forEach(input => {
            if (input.type !== "submit" && input.type !== "number") {
                if (!input.classList.contains('valid')) allValid = false;
            }
            // Basic check for ratings
            if (input.type === "number" && input.value === "") allValid = false;
        });
        
        // Disabled until valid
        if(submitBtn) submitBtn.disabled = !allValid;
    }
});