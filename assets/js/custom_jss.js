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

document.addEventListener('DOMContentLoaded', () => {
    
    const cardData = [
        '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', 
        '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'
    ];

    let cards = [];
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let moves = 0;
    let matches = 0;
    let totalPairs = 0;
    let gameActive = false;
    let timerInterval;
    let seconds = 0;
    
    const board = document.getElementById('game-board');
    const difficultySelect = document.getElementById('difficulty');
    const startBtn = document.getElementById('btn-start');
    const restartBtn = document.getElementById('btn-restart');
    const moveDisplay = document.getElementById('move-count');
    const matchDisplay = document.getElementById('match-count');
    const totalPairsDisplay = document.getElementById('total-pairs');
    const timerDisplay = document.getElementById('timer');
    const winMessage = document.getElementById('win-message');
    const bestScoreDisplay = document.getElementById('best-score');
    const finalMovesDisplay = document.getElementById('final-moves');
    const finalTimeDisplay = document.getElementById('final-time');

    

    updateBestScoreDisplay();


    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', restartGame);
    difficultySelect.addEventListener('change', () => {

        updateBestScoreDisplay();
        if (gameActive) {
            restartGame();
        }
    });



    function startGame() {
        gameActive = true;
        startBtn.disabled = true;
        restartBtn.disabled = false;
        difficultySelect.disabled = true;
        
        resetStats();
        initBoard();
        startTimer();
        
        winMessage.style.display = 'none';
    }

    function restartGame() {
        stopTimer();

        winMessage.style.display = 'none';
        

        gameActive = true;
        resetStats();
        initBoard();
        startTimer();
    }

    function initBoard() {
        board.innerHTML = ''; 
        const difficulty = difficultySelect.value;
        

        let itemsToUse;
        if (difficulty === 'easy') {
            totalPairs = 6;
            board.className = 'game-board grid-easy';
            itemsToUse = cardData.slice(0, 6); 
        } else {
            totalPairs = 12;
            board.className = 'game-board grid-hard';
            itemsToUse = cardData.slice(0, 12);
        }

        totalPairsDisplay.textContent = totalPairs;

        cards = [...itemsToUse, ...itemsToUse]; 
        shuffleArray(cards);

        cards.forEach(item => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('memory-card');
            cardElement.dataset.framework = item; 

            const frontFace = document.createElement('div');
            frontFace.classList.add('front-face');
            frontFace.textContent = item; 

            const backFace = document.createElement('div');
            backFace.classList.add('back-face');

            cardElement.appendChild(frontFace);
            cardElement.appendChild(backFace);
            
            cardElement.addEventListener('click', flipCard);
            
            board.appendChild(cardElement);
        });
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }



    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return;

        this.classList.add('flip');

        if (!hasFlippedCard) {
            hasFlippedCard = true;
            firstCard = this;
            return;
        }


        secondCard = this;
        incrementMoves();
        checkForMatch();
    }

    function checkForMatch() {
        let isMatch = firstCard.dataset.framework === secondCard.dataset.framework;

        isMatch ? disableCards() : unflipCards();
    }

    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        

        firstCard.classList.add('matched');
        secondCard.classList.add('matched');

        matches++;
        matchDisplay.textContent = matches;
        
        resetBoard();
        checkWinCondition();
    }

    function unflipCards() {
        lockBoard = true; 

        setTimeout(() => {
            firstCard.classList.remove('flip');
            secondCard.classList.remove('flip');
            resetBoard();
        }, 1000);
    }

    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }

    function incrementMoves() {
        moves++;
        moveDisplay.textContent = moves;
    }



    function checkWinCondition() {
        if (matches === totalPairs) {
            stopTimer();
            handleWin();
        }
    }

    function handleWin() {
        winMessage.style.display = 'block';
        finalMovesDisplay.textContent = moves;
        finalTimeDisplay.textContent = timerDisplay.textContent;
        

        startBtn.disabled = false;
        difficultySelect.disabled = false;
        
        saveBestScore();
    }

    function resetStats() {
        moves = 0;
        matches = 0;
        seconds = 0;
        moveDisplay.textContent = '0';
        matchDisplay.textContent = '0';
        timerDisplay.textContent = '00:00';
    }



    function saveBestScore() {
        const difficulty = difficultySelect.value;
        const storageKey = `memory_best_${difficulty}`;
        const currentBest = localStorage.getItem(storageKey);


        if (!currentBest || moves < parseInt(currentBest)) {
            localStorage.setItem(storageKey, moves);
            updateBestScoreDisplay();
        }
    }

    function updateBestScoreDisplay() {
        const difficulty = difficultySelect.value;
        const storageKey = `memory_best_${difficulty}`;
        const best = localStorage.getItem(storageKey);
        
        bestScoreDisplay.textContent = best ? best : '-';
    }

    function startTimer() {
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            seconds++;
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            // Format 00:00
            timerDisplay.textContent = 
                `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }
});