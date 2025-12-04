document.addEventListener("DOMContentLoaded", () => {
  // UPI Constants
  const BLANKET_PRICE = 400;              // ₹ per blanket
  const UPI_ID = "krishgoyal3101@okhdfcbank";        // todo: replace with real vpa
  const UPI_NAME = "Kindera"     // todo: replace with actual name

  // UPI URL Helper Function
  function createUpiUrl(amount, note) {
    const pa = encodeURIComponent(UPI_ID);
    const pn = encodeURIComponent(UPI_NAME);
    const am = encodeURIComponent(amount);
    const tn = encodeURIComponent(note);
    const cu = "inr";
    return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&tn=${tn}&cu=${cu}`;
  }

  // QR Code Image Generator Function
  function generateQrCodeImage(data) {
    // Using a public QR code API
    // Documentation: https://goqr.me/api/
    // Example: https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=your-upi-link
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(data)}`; // Increased QR size
  }

  // Image Slider Logic
  const sliderImagesSrc = [
    "https://media.istockphoto.com/id/476151350/photo/poor-children-sitting-in-winter-season.jpg?s=612x612&w=0&k=20&c=ZAiQrki3FLQNuDZ5MjpCGJ_Y3GjYeRI28gAg1ZiCspE=",
    "https://d1vdjc70h9nzd9.cloudfront.net/media/campaign/547000/547803/image/61a9f0789f1f9.jpeg",
    "https://media.istockphoto.com/id/1386022497/photo/poor-girl-warming-hands-using-fire-during-winter-season.jpg?s=612x612&w=0&k=20&c=Ne0JeQ8OajI3saM2jRqDNlPR1WVlDfISO76gLd2yVOI=",
    "https://www.aljazeera.com/wp-content/uploads/2023/01/AP23002159839888.jpg",
    "https://asf.org.in/wp-content/uploads/2022/12/dsc_6008_011316122445.webp",
    "https://sc0.blr1.digitaloceanspaces.com/large/778023-20c8e4b1-83fe-4bd1-9147-fd0fb59e6cdd.jpg",
    "https://islamic-relief.org/wp-content/uploads/2019/10/RS143926_3B0A9658.jpg",
    "https://www.globalgiving.org/pfil/22095/pict_original.jpg",
    "https://images.unsplash.com/photo-1607956744673-f75e67453620?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cG9vciUyMGtpZHN8ZW58MHx8MHx8fDA%3D",
    "https://images.csmonitor.com/csm/2022/01/0125%20afghanistan_poverty%20road.jpg?alias=standard_900x600"
  ];

  const sliderViewport = document.querySelector(".slider-viewport");
  if (sliderViewport && sliderImagesSrc.length > 0) {
    sliderImagesSrc.forEach((src, index) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = "Donation moment " + (index + 1);
      img.className = "slider-image" + (index === 0 ? " active" : "");
      sliderViewport.appendChild(img);
    });

    const sliderEls = sliderViewport.querySelectorAll(".slider-image");
    let currentSlide = 0;
    setInterval(() => {
      if (sliderEls.length === 0) return;
      sliderEls[currentSlide].classList.remove("active");
      currentSlide = (currentSlide + 1) % sliderEls.length;
      sliderEls[currentSlide].classList.add("active");
    }, 4500); // every 4.5 seconds
  }

  // Donate Modal Logic
  const donateBtn = document.getElementById("open-donate-modal");
  const modalBackdrop = document.getElementById("donate-modal");
  const modalClose = document.getElementById("close-modal");
  const modalQtyInput = document.getElementById("modal-quantity");
  const modalDecrease = document.getElementById("modal-decrease");
  const modalIncrease = document.getElementById("modal-increase");
  const modalTotalSpan = document.getElementById("modal-total");
  const modalPayBtn = document.getElementById("modal-pay-btn");

  function updateModalTotal() {
    let qty = parseInt(modalQtyInput.value) || 1;
    if (qty < 1) qty = 1;
    if (qty > 100) qty = 100; // Max quantity
    modalQtyInput.value = qty;
    const total = qty * BLANKET_PRICE;
    modalTotalSpan.textContent = `₹${total}`;
  }

  if (donateBtn && modalBackdrop) {
    donateBtn.addEventListener("click", () => {
      modalBackdrop.classList.add("active");
      modalQtyInput.value = 1; // Reset quantity on open
      updateModalTotal();
    });
  }

  if (modalClose) {
    modalClose.addEventListener("click", () => {
      modalBackdrop.classList.remove("active");
    });
  }

  // Close modal when clicking outside the box
  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) {
      modalBackdrop.classList.remove("active");
    }
  });

  if (modalDecrease) {
      modalDecrease.addEventListener("click", () => {
        modalQtyInput.value = Math.max(1, (parseInt(modalQtyInput.value) || 1) - 1);
        updateModalTotal();
      });
  }

  if (modalIncrease) {
      modalIncrease.addEventListener("click", () => {
        modalQtyInput.value = Math.min(100, (parseInt(modalQtyInput.value) || 1) + 1);
        updateModalTotal();
      });
  }

  if (modalQtyInput) {
      modalQtyInput.addEventListener("input", updateModalTotal);
  }

  if (modalPayBtn) {
      modalPayBtn.addEventListener("click", () => {
        const qty = parseInt(modalQtyInput.value) || 1;
        const total = qty * BLANKET_PRICE;
        const note = `Blanket donation (${qty} blankets) for Warm Hearts`;
        const upiUrl = createUpiUrl(total, note);
        window.location.href = upiUrl; // opens upi app on mobile
      });
  }


  // UPI QR Code Modal Logic
  const showQrBtn = document.getElementById("show-qr");
  const qrModalBackdrop = document.getElementById("qr-modal");
  const closeQrModalBtn = document.getElementById("close-qr-modal");
  const upiQrImage = document.getElementById("upi-qr-image");

  if (showQrBtn && qrModalBackdrop && upiQrImage) {
    showQrBtn.addEventListener("click", () => {
      // Generate UPI link for the QR code. We can use a default amount
      // or the currently selected amount from the donate modal if it was open last.
      // For a static QR, a default 1 INR or 0 amount with a generic note is common.
      const defaultQrAmount = 1; // Or current modalQtyInput.value * BLANKET_PRICE if preferred to dynamically fill
      const qrNote = "Donation for Warm Hearts Blanket Drive";
      const upiLink = createUpiUrl(defaultQrAmount, qrNote);

      upiQrImage.src = generateQrCodeImage(upiLink);
      qrModalBackdrop.classList.add("active");
    });
  }

  if (closeQrModalBtn) {
    closeQrModalBtn.addEventListener("click", () => {
      qrModalBackdrop.classList.remove("active");
    });
  }

  // Close QR modal when clicking outside the box
  if (qrModalBackdrop) {
      qrModalBackdrop.addEventListener("click", (e) => {
        if (e.target === qrModalBackdrop) {
          qrModalBackdrop.classList.remove("active");
        }
      });
  }
});
