document.addEventListener('DOMContentLoaded', () => {
  
    const typePasswordRadio = document.getElementById('typePassword');
    const typePassphraseRadio = document.getElementById('typePassphrase');
    const lengthInput = document.getElementById('length');
    const lengthValueSpan = document.getElementById('lengthValue');
    const decreaseLengthBtn = document.getElementById('decreaseLengthBtn');
    const increaseLengthBtn = document.getElementById('increaseLengthBtn');
    const passwordOptionsDiv = document.querySelector('.characters-options .checkbox-group');
    const uppercaseCheckbox = document.getElementById('uppercase');
    const lowercaseCheckbox = document.getElementById('lowercase');
    const numbersCheckbox = document.getElementById('numbers');
    const symbolsCheckbox = document.getElementById('symbols');
    const generateBtn = document.getElementById('generateBtn');
    const passwordOutput = document.getElementById('passwordOutput');
    const copyBtn = document.getElementById('copyBtn');
    const strengthScoreEl = document.getElementById('strengthScore');
    const crackTimeEl = document.getElementById('crackTime');
    const suggestionsList = document.getElementById('suggestions');

    let copyButtonTimeoutId = null;

    const updateStrengthFeedback = (strength, time, suggestions) => {
        strengthScoreEl.className = '';
        strengthScoreEl.textContent = strength;
        crackTimeEl.textContent = time;

        switch (strength) {
            case "Very Weak": strengthScoreEl.classList.add('strength-very-weak'); break;
            case "Weak": strengthScoreEl.classList.add('strength-weak'); break;
            case "Fair": strengthScoreEl.classList.add('strength-fair'); break;
            case "Good": strengthScoreEl.classList.add('strength-good'); break;
            case "Excellent": strengthScoreEl.classList.add('strength-excellent'); break;
        }

        suggestionsList.innerHTML = '';
        if (suggestions.length > 0) {
            suggestions.forEach(suggestion => {
                const li = document.createElement('li');
                li.textContent = suggestion;
                suggestionsList.appendChild(li);
            });
        }
    };

    const evaluatePasswordStrength = (password) => {
        if (password.length === 0) {
            updateStrengthFeedback('', '', []);
            return;
        }

        if (typeof zxcvbn === 'undefined') {
            console.error("Error: Password strength library not loaded.");
            strengthScoreEl.textContent = "Error: Strength library not loaded.";
            crackTimeEl.textContent = "";
            suggestionsList.innerHTML = '';
            return;
        }

        const result = zxcvbn(password);
        let strengthText = "";
        const suggestions = result.feedback.suggestions || [];
        let crackTimeDisplay = result.crack_times_display.realistic;

        switch (result.score) {
            case 0: strengthText = "Very Weak"; break;
            case 1: strengthText = "Weak"; break;
            case 2: strengthText = "Fair"; break;
            case 3: strengthText = "Good"; break;
            case 4: strengthText = "Excellent"; break;
        }
        updateStrengthFeedback(strengthText, crackTimeDisplay, suggestions);
    };

    const generatePassword = () => {
        const length = parseInt(lengthInput.value);
        let password = '';

        let characters = '';
        if (uppercaseCheckbox.checked) { characters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; }
        if (lowercaseCheckbox.checked) { characters += 'abcdefghijklmnopqrstuvwxyz'; }
        if (numbersCheckbox.checked) { characters += '0123456789'; }
        if (symbolsCheckbox.checked) { characters += '!@#$%^&*()_+{}[]|:;<>,.?/~`'; }

        if (!characters) {
            passwordOutput.value = 'Select at least one character type.';
            updateStrengthFeedback('', '', []);
            return;
        }
        if (length === 0) {
            passwordOutput.value = '';
            updateStrengthFeedback('', '', []);
            return;
        }

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            password += characters.charAt(randomIndex);
        }

        passwordOutput.value = password;
        evaluatePasswordStrength(password);

        if (copyButtonTimeoutId) {
            clearTimeout(copyButtonTimeoutId);
            copyButtonTimeoutId = null;
        }
        copyBtn.textContent = 'Copy';
        copyBtn.classList.remove('copied-state');
    };

    const updateOptionsVisibility = () => {
        passwordOptionsDiv.classList.remove('hidden');
        lengthInput.min = 1;
        lengthInput.max = 64;

        if (!uppercaseCheckbox.checked && !lowercaseCheckbox.checked && !numbersCheckbox.checked && !symbolsCheckbox.checked) {
            uppercaseCheckbox.checked = true;
            lowercaseCheckbox.checked = true;
        }
        generatePassword();
    };

    const copyToClipboard = () => {
        const originalBtnText = 'Copy';

        passwordOutput.select();
        passwordOutput.setSelectionRange(0, 99999);

        if (copyButtonTimeoutId) {
            clearTimeout(copyButtonTimeoutId);
            copyButtonTimeoutId = null;
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(passwordOutput.value)
                .then(() => {
                    copyBtn.textContent = 'Copied!';
                    copyBtn.classList.add('copied-state');
                    copyButtonTimeoutId = setTimeout(() => {
                        copyBtn.textContent = originalBtnText;
                        copyBtn.classList.remove('copied-state');
                        copyButtonTimeoutId = null;
                    }, 1500);
                })
                .catch(err => {
                    console.error('Error copying with modern API: ', err);
                    
                    try {
                        document.execCommand('copy');
                        copyBtn.textContent = 'Copied!';
                        copyBtn.classList.add('copied-state');
                        copyButtonTimeoutId = setTimeout(() => {
                            copyBtn.textContent = originalBtnText;
                            copyBtn.classList.remove('copied-state');
                            copyButtonTimeoutId = null;
                        }, 1500);
                    } catch (err2) {
                        console.error('Failed to copy to clipboard with execCommand: ', err2);
                        alert('Your browser does not support automatic copying. Please copy manually.');
                    }
                });
        } else {
           
            try {
                document.execCommand('copy');
                copyBtn.textContent = 'Copied!';
                copyBtn.classList.add('copied-state');
                copyButtonTimeoutId = setTimeout(() => {
                    copyBtn.textContent = originalBtnText;
                    copyBtn.classList.remove('copied-state');
                    copyButtonTimeoutId = null;
                }, 1500);
            } catch (err) {
                console.error('Failed to copy to clipboard: ', err);
                alert('Your browser does not support automatic copying. Please copy manually.');
            }
        }
    };

    decreaseLengthBtn.addEventListener('click', () => {
        let currentLength = parseInt(lengthInput.value);
        if (currentLength > parseInt(lengthInput.min)) {
            lengthInput.value = currentLength - 1;
            lengthValueSpan.textContent = lengthInput.value;
            generatePassword();
        }
    });

    increaseLengthBtn.addEventListener('click', () => {
        let currentLength = parseInt(lengthInput.value);
        if (currentLength < parseInt(lengthInput.max)) {
            lengthInput.value = currentLength + 1;
            lengthValueSpan.textContent = lengthInput.value;
            generatePassword();
        }
    });

    lengthInput.addEventListener('input', () => {
        lengthValueSpan.textContent = lengthInput.value;
        generatePassword();
    });

    generateBtn.addEventListener('click', generatePassword);
    copyBtn.addEventListener('click', copyToClipboard);

    passwordOutput.addEventListener('input', () => evaluatePasswordStrength(passwordOutput.value));

    updateOptionsVisibility();
});