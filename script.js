document.addEventListener('DOMContentLoaded', () => {
    // --- Constants ---
    const BLANKET_PRICE = 400; // ₹ per blanket
    const UPI_ID = 'krishgoyal3101@okhdfcbank';      // TODO: Replace with real VPA
    const UPI_NAME = 'Krish Goyal';  // TODO: Replace with actual name

    // --- DOM Elements ---
    const header = document.querySelector('.header');
    const navLinks = document.querySelectorAll('.nav-link');
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav');
    const body = document.body;

    // Donate section elements
    const decreaseQtyBtn = document.getElementById('decrease-qty');
    const increaseQtyBtn = document.getElementById('increase-qty');
    const blanketQuantityInput = document.getElementById('blanket-quantity');
    const donatedBlanketsSpan = document.getElementById('donated-blankets');
    const totalAmountSpan = document.getElementById('total-amount');
    const donationForm = document.getElementById('donation-form');
    const donorNameInput = document.getElementById('donor-name');
    const donorEmailInput = document.getElementById('donor-email');
    const donorPhoneInput = document.getElementById('donor-phone');
    const nameErrorSpan = document.getElementById('name-error');
    const emailErrorSpan = document.getElementById('email-error');
    const phoneErrorSpan = document.getElementById('phone-error');
    const paymentLoadingMessage = document.getElementById('payment-loading-message');
    const showQrBtn = document.getElementById('show-qr-btn');
    const qrcodeContainer = document.getElementById('qrcode-container');

    // Testimonials slider elements
    const testimonialSlider = document.querySelector('.testimonial-slider');
    const testimonialCards = document.querySelector('.testimonial-cards');
    const testimonialCardElements = document.querySelectorAll('.testimonial-card');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    // FAQ elements
    const faqQuestions = document.querySelectorAll('.faq-question');

    // Contact form elements
    const contactForm = document.getElementById('contact-form');
    const contactNameInput = document.getElementById('contact-name');
    const contactEmailInput = document.getElementById('contact-email');
    const contactMessageInput = document.getElementById('contact-message');
    const contactNameError = document.getElementById('contact-name-error');
    const contactEmailError = document.getElementById('contact-email-error');
    const contactMessageError = document.getElementById('contact-message-error');
    const contactSuccessMessage = document.getElementById('contact-success-message');

    // --- Navbar Functionality ---
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileNav.classList.toggle('active');
        body.classList.toggle('nav-open'); // To disable body scroll when nav is open
    });

    // Close mobile nav and remove active class from hamburger when a link is clicked
    mobileNav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileNav.classList.remove('active');
            body.classList.remove('nav-open');
        });
    });

    // Smooth scrolling for all nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Active nav link highlight based on scroll position (Intersection Observer)
    const sections = document.querySelectorAll('section');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5 // Adjust as needed, 0.5 means when 50% of the section is visible
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.id;
            const correspondingLink = document.querySelector(`.nav-link[href="#${id}"]`);

            if (correspondingLink) {
                if (entry.isIntersecting) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    correspondingLink.classList.add('active');
                } else {
                    // Optional: remove active when scrolling past
                    // correspondingLink.classList.remove('active');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // Handle initial active link on page load for the hero section
    const initialSection = document.querySelector('section');
    if (initialSection) {
        document.querySelector(`.nav-link[href="#${initialSection.id}"]`).classList.add('active');
    }


    // --- Donate Section Functionality ---

    /**
     * Creates a UPI deeplink URL for payment.
     * @param {number} amount amount in INR (e.g., 400, not paise)
     * @param {string} note   transaction note shown in UPI app
     * @returns {string}      UPI deeplink URL
     */
    function createUpiUrl(amount, note) {
        const pa = encodeURIComponent(UPI_ID);       // Payee VPA
        const pn = encodeURIComponent(UPI_NAME);     // Payee name
        const am = encodeURIComponent(amount.toFixed(2)); // Amount in rupees, 2 decimal places
        const tn = encodeURIComponent(note);         // Transaction note
        const cu = 'INR';

        return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&tn=${tn}&cu=${cu}`;
    }

    function updateDonationAmount() {
        let quantity = parseInt(blanketQuantityInput.value);

        // Clamp quantity between 1 and 100
        quantity = Math.max(1, Math.min(100, isNaN(quantity) ? 1 : quantity));
        blanketQuantityInput.value = quantity; // Update input field if clamped

        const totalAmount = quantity * BLANKET_PRICE;

        donatedBlanketsSpan.textContent = quantity;
        totalAmountSpan.textContent = totalAmount.toLocaleString('en-IN'); // Format with Indian locale
    }

    decreaseQtyBtn.addEventListener('click', () => {
        blanketQuantityInput.value = parseInt(blanketQuantityInput.value) - 1;
        updateDonationAmount();
    });

    increaseQtyBtn.addEventListener('click', () => {
        blanketQuantityInput.value = parseInt(blanketQuantityInput.value) + 1;
        updateDonationAmount();
    });

    blanketQuantityInput.addEventListener('input', updateDonationAmount);
    blanketQuantityInput.addEventListener('change', updateDonationAmount); // Also on change for direct typing

    function validateDonationForm() {
        let isValid = true;

        // Name validation
        if (donorNameInput.value.trim() === '') {
            nameErrorSpan.textContent = 'Full Name is required.';
            nameErrorSpan.classList.add('active');
            isValid = false;
        } else {
            nameErrorSpan.classList.remove('active');
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (donorEmailInput.value.trim() === '') {
            emailErrorSpan.textContent = 'Email is required.';
            emailErrorSpan.classList.add('active');
            isValid = false;
        } else if (!emailRegex.test(donorEmailInput.value.trim())) {
            emailErrorSpan.textContent = 'Please enter a valid email address.';
            emailErrorSpan.classList.add('active');
            isValid = false;
        } else {
            emailErrorSpan.classList.remove('active');
        }

        // Phone validation (10 digits for India)
        const phoneRegex = /^[0-9]{10}$/;
        if (donorPhoneInput.value.trim() === '') {
            phoneErrorSpan.textContent = 'Phone number is required.';
            phoneErrorSpan.classList.add('active');
            isValid = false;
        } else if (!phoneRegex.test(donorPhoneInput.value.trim())) {
            phoneErrorSpan.textContent = 'Please enter a valid 10-digit phone number.';
            phoneErrorSpan.classList.add('active');
            isValid = false;
        } else {
            phoneErrorSpan.classList.remove('active');
        }

        return isValid;
    }

    // Clear errors on input
    donorNameInput.addEventListener('input', () => {
        if (donorNameInput.value.trim() !== '') nameErrorSpan.classList.remove('active');
    });
    donorEmailInput.addEventListener('input', () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (donorEmailInput.value.trim() !== '' && emailRegex.test(donorEmailInput.value.trim())) emailErrorSpan.classList.remove('active');
    });
    donorPhoneInput.addEventListener('input', () => {
        const phoneRegex = /^[0-9]{10}$/;
        if (donorPhoneInput.value.trim() !== '' && phoneRegex.test(donorPhoneInput.value.trim())) phoneErrorSpan.classList.remove('active');
    });


    donationForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (validateDonationForm()) {
            paymentLoadingMessage.style.display = 'block';

            const quantity = parseInt(blanketQuantityInput.value);
            const totalAmount = quantity * BLANKET_PRICE;

            const donorName = donorNameInput.value.trim();
            // const donorEmail = donorEmailInput.value.trim(); // Not directly used in UPI link
            // const donorPhone = donorPhoneInput.value.trim(); // Not directly used in UPI link

            // Short note for UPI app
            const note = `Blanket Donation: ${quantity} blankets (${donorName})`;

            const upiUrl = createUpiUrl(totalAmount, note);
            console.log('UPI URL:', upiUrl);

            setTimeout(() => {
                window.location.href = upiUrl;

                paymentLoadingMessage.style.display = 'none';
                donationForm.reset();
                updateDonationAmount(); // Reset quantity display
                // Clear any displayed QR code
                qrcodeContainer.innerHTML = '';
                alert('Opening your UPI app. Please complete the donation there.');
            }, 800);
        }
    });

    // Initialize donation amount on page load
    updateDonationAmount();

    // QR Code generation (optional)
    if (typeof QRCode !== 'undefined' && showQrBtn && qrcodeContainer) {
        let qrCodeInstance = null; // To store the QR code instance

        showQrBtn.addEventListener('click', () => {
            const quantity = parseInt(blanketQuantityInput.value);
            const totalAmount = quantity * BLANKET_PRICE;
            const donorName = donorNameInput.value.trim() || 'Anonymous'; // Use anonymous if name not entered
            const note = `Blanket Donation: ${quantity} blankets (${donorName})`;
            const upiUrl = createUpiUrl(totalAmount, note);

            // Clear previous QR code
            qrcodeContainer.innerHTML = '';

            // Generate new QR code
            qrCodeInstance = new QRCode(qrcodeContainer, {
                text: upiUrl,
                width: 200,
                height: 200,
                colorDark: "#0A1128",
                colorLight: "#FDFDFD",
                correctLevel: QRCode.CorrectLevel.H
            });
            console.log('QR Code generated for:', upiUrl);
        });
    }


    // --- Impact Section (Progress Bar Animation) ---
    const progressBarContainer = document.querySelector('.progress-bar-container');
    const progressBarFill = document.querySelector('.progress-bar-fill');

    const progressObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate to 52% (2600/5000)
                progressBarFill.style.width = '52%';
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, {
        threshold: 0.5 // When 50% of the container is visible
    });

    if (progressBarContainer) {
        progressObserver.observe(progressBarContainer);
    }


    // --- Testimonials Slider ---
    let currentSlideIndex = 0;
    const numSlides = testimonialCardElements.length;
    let autoSlideInterval;

    function getSlideWidth() {
        if (window.innerWidth <= 768) {
            return testimonialCardElements[0].offsetWidth + 30; // Card width + margin
        } else {
            return testimonialCardElements[0].offsetWidth * 2 + 30; // Two cards + margin
        }
    }

    function showSlide(index) {
        if (index >= numSlides) {
            currentSlideIndex = 0;
        } else if (index < 0) {
            currentSlideIndex = numSlides - 1;
        } else {
            currentSlideIndex = index;
        }

        const offset = -currentSlideIndex * getSlideWidth();
        testimonialCards.style.transform = `translateX(${offset}px)`;
    }

    function nextSlide() {
        showSlide(currentSlideIndex + 1);
    }

    function prevSlide() {
        showSlide(currentSlideIndex - 1);
    }

    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    }

    function pauseAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    if (testimonialCardElements.length > 0) {
        prevBtn.addEventListener('click', () => {
            pauseAutoSlide();
            prevSlide();
            startAutoSlide();
        });

        nextBtn.addEventListener('click', () => {
            pauseAutoSlide();
            nextSlide();
            startAutoSlide();
        });

        testimonialSlider.addEventListener('mouseenter', pauseAutoSlide);
        testimonialSlider.addEventListener('mouseleave', startAutoSlide);

        // Update slider position on window resize
        window.addEventListener('resize', () => {
            showSlide(currentSlideIndex); // Re-calculate offset based on new width
        });

        showSlide(currentSlideIndex); // Initialize slider
        startAutoSlide();
    }


    // --- FAQ Accordion ---
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;

            // Close all other open answers
            faqQuestions.forEach(otherQuestion => {
                if (otherQuestion !== question && otherQuestion.classList.contains('active')) {
                    otherQuestion.classList.remove('active');
                    otherQuestion.nextElementSibling.classList.remove('active');
                }
            });

            // Toggle the clicked question and answer
            question.classList.toggle('active');
            answer.classList.toggle('active');
        });
    });


    // --- Contact Form ---
    function validateContactForm() {
        let isValid = true;

        if (contactNameInput.value.trim() === '') {
            contactNameError.textContent = 'Name is required.';
            contactNameError.classList.add('active');
            isValid = false;
        } else {
            contactNameError.classList.remove('active');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (contactEmailInput.value.trim() === '') {
            contactEmailError.textContent = 'Email is required.';
            contactEmailError.classList.add('active');
            isValid = false;
        } else if (!emailRegex.test(contactEmailInput.value.trim())) {
            contactEmailError.textContent = 'Please enter a valid email address.';
            contactEmailError.classList.add('active');
            isValid = false;
        } else {
            contactEmailError.classList.remove('active');
        }

        if (contactMessageInput.value.trim() === '') {
            contactMessageError.textContent = 'Message cannot be empty.';
            contactMessageError.classList.add('active');
            isValid = false;
        } else {
            contactMessageError.classList.remove('active');
        }

        return isValid;
    }

    // Clear errors on input
    contactNameInput.addEventListener('input', () => { if (contactNameInput.value.trim() !== '') contactNameError.classList.remove('active'); });
    contactEmailInput.addEventListener('input', () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (contactEmailInput.value.trim() !== '' && emailRegex.test(contactEmailInput.value.trim())) contactEmailError.classList.remove('active');
    });
    contactMessageInput.addEventListener('input', () => { if (contactMessageInput.value.trim() !== '') contactMessageError.classList.remove('active'); });


    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (validateContactForm()) {
            const formData = {
                name: contactNameInput.value.trim(),
                email: contactEmailInput.value.trim(),
                message: contactMessageInput.value.trim()
            };
            console.log('Contact Form Data:', formData);

            contactSuccessMessage.style.display = 'block';
            contactForm.reset();

            setTimeout(() => {
                contactSuccessMessage.style.display = 'none';
            }, 5000); // Hide after 5 seconds
        }
    });

    // --- Scroll Animations (Fade-in) ---
    const animateElements = document.querySelectorAll('.animate-on-scroll');

    const animateObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, {
        threshold: 0.2 // When 20% of the element is visible
    });

    animateElements.forEach(element => {
        animateObserver.observe(element);
    });
});