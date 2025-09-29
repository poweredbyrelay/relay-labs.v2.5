// Plan selection functionality
document.addEventListener('DOMContentLoaded', function() {
    // Handle plan selection buttons
    const selectPlanButtons = document.querySelectorAll('.select-plan');
    
    selectPlanButtons.forEach(button => {
        button.addEventListener('click', function() {
            const planName = this.getAttribute('data-plan');
            
            // Store selected plan in sessionStorage
            if (typeof(Storage) !== "undefined") {
                sessionStorage.setItem('selectedPlan', planName);
            }
            
            // Redirect to contact page
            window.location.href = 'contact.html';
        });
    });
    
    // Auto-fill plan selection on contact page
    if (window.location.pathname.includes('contact.html') || window.location.pathname.endsWith('contact.html')) {
        const planSelect = document.getElementById('plan');
        
        if (planSelect && typeof(Storage) !== "undefined") {
            const selectedPlan = sessionStorage.getItem('selectedPlan');
            if (selectedPlan) {
                planSelect.value = selectedPlan;
                // Clear the stored plan after using it
                sessionStorage.removeItem('selectedPlan');
            }
        }
    }
    
    // Handle CRM dropdown - show "Other" input when "Other" is selected
    const crmSelect = document.getElementById('crm');
    const otherCrmInput = document.getElementById('other-crm-input');
    const otherCrmField = document.getElementById('other-crm');
    
    if (crmSelect) {
        crmSelect.addEventListener('change', function() {
            if (this.value === 'Other') {
                // Show the other CRM input field
                if (otherCrmInput) {
                    otherCrmInput.style.display = 'block';
                    if (otherCrmField) {
                        otherCrmField.required = true;
                    }
                }
            } else {
                // Hide the other CRM input field
                if (otherCrmInput) {
                    otherCrmInput.style.display = 'none';
                    if (otherCrmField) {
                        otherCrmField.required = false;
                        otherCrmField.value = '';
                    }
                }
            }
        });
    }
    
    // Simple form validation for contact form (no AJAX - let Formspree handle submission)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        // Add checkbox validation
        const checkboxes = contactForm.querySelectorAll('input[name="goals"]');
        
        function validateCheckboxes() {
            const checked = Array.from(checkboxes).some(checkbox => checkbox.checked);
            
            checkboxes.forEach(checkbox => {
                const label = checkbox.closest('.checkbox-label');
                if (!checked) {
                    label.style.borderColor = 'rgba(239, 68, 68, 0.6)';
                } else {
                    label.style.borderColor = '#27272a';
                }
            });
            
            return checked;
        }
        
        // Validate checkboxes on change
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', validateCheckboxes);
        });
        
        // Reset button state when page loads (fixes the "Sending..." issue)
        const button = contactForm.querySelector('button[type="submit"]');
        if (button) {
            button.textContent = 'Send Message';
            button.disabled = false;
        }
        
        // Form submission handler (validation only)
        contactForm.addEventListener('submit', function(e) {
            const isCheckboxValid = validateCheckboxes();
            
            if (!isCheckboxValid) {
                e.preventDefault();
                alert('Please select at least one main goal.');
                return false;
            }
            
            // Add loading state to submit button
            const submitButton = this.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.textContent = 'Sending...';
                submitButton.disabled = true;
                
                // Reset button after 5 seconds in case something goes wrong
                setTimeout(function() {
                    if (submitButton.textContent === 'Sending...') {
                        submitButton.textContent = 'Send Message';
                        submitButton.disabled = false;
                    }
                }, 5000);
            }
            
            // Let the form submit normally to Formspree
        });
    }
    
    // Show success message on homepage if redirected from successful form submission
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('success') === 'true') {
            // Create and show success notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #22c55e, #16a34a);
                color: white;
                padding: 20px 25px;
                border-radius: 12px;
                box-shadow: 0 8px 25px rgba(0,0,0,0.3);
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-weight: 600;
                transform: translateX(400px);
                transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            `;
            notification.textContent = 'Message sent successfully! We\'ll be in touch soon.';
            
            document.body.appendChild(notification);
            
            // Animate in
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
            }, 100);
            
            // Remove after 5 seconds
            setTimeout(() => {
                notification.style.transform = 'translateX(400px)';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 400);
            }, 5000);
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
});