document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed");

    // Initialize Lucide icons
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    } else {
        console.warn("Lucide is not defined. Ensure it is properly imported or included.");
    }

    initParticleNetwork();
    generateDateOptions();
    loadRoom();
    handleTimeSlotSelection();
    handleLocationSelection();
    initializeTopNavbar();

    const bookRoomBtn = document.getElementById("bookRoomBtn");
    if (bookRoomBtn) {
        bookRoomBtn.addEventListener("click", bookRoom);
    } else {
        console.error("Book Room button not found.");
    }
});

// Initialize particle network
function initParticleNetwork() {
    const canvas = document.getElementById("particleCanvas");
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");

    // Set canvas to full window size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Particle class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.radius = Math.random() * 1.5 + 0.5;
            this.color = "#00FFFF";
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges
            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    // Create particles
    const particleCount = 100;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // Draw lines between particles that are close
    function drawLines() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0, 255, 255, ${0.2 * (1 - distance / 100)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        particles.forEach((particle) => {
            particle.update();
            particle.draw();
        });

        drawLines();

        requestAnimationFrame(animate);
    }

    animate();
}

// Initialize top navbar functionality
function initializeTopNavbar() {
    // Notification button click
    const notificationBtn = document.getElementById("notificationBtn");
    if (notificationBtn) {
        notificationBtn.addEventListener("click", () => {
            showNotification("You have 2 new notifications", "info");
        });
    }

    // Settings button click
    const settingsBtn = document.getElementById("settingsBtn");
    if (settingsBtn) {
        settingsBtn.addEventListener("click", () => {
            showNotification("Settings panel will be available soon", "info");
        });
    }
}





// Generate date options for the next 7 days
function generateDateOptions() {
    console.log("Generating date options...");
    const dateSelection = document.getElementById("dateSelection");

    if (!dateSelection) {
        console.error("Date selection container not found.");
        return;
    }

    dateSelection.innerHTML = ""; // Clear old content

    for (let i = 0; i < 7; i++) {
        let date = new Date();
        date.setDate(date.getDate() + i);
        let formattedDate = date.toISOString().split("T")[0]; // YYYY-MM-DD
        let day = date.toLocaleString("en-us", { weekday: "short" });
        let dateNum = date.getDate();
        let month = date.toLocaleString("en-us", { month: "short" });

        let dateButton = document.createElement("div");
        dateButton.classList.add("date-slot");
        dateButton.dataset.date = formattedDate;
        dateButton.innerHTML = `<div class="date-num">${dateNum} ${month}</div><div class="day">${day}</div>`;

        // Select first date by default
        if (i === 0) {
            dateButton.classList.add("selected");
        }

        // Click event to select date
        dateButton.addEventListener("click", function() {
            document.querySelectorAll(".date-slot").forEach(btn => btn.classList.remove("selected"));
            dateButton.classList.add("selected");

            // Fetch room bookings when a date is selected
            fetchBookings(formattedDate);
        });

        dateSelection.appendChild(dateButton);
    }
}

// Fetch booked time slots from backend and update UI
function fetchBookings(selectedDate) {
    console.log("Fetching bookings for:", selectedDate);

    const roomNumberElement = document.querySelector("#room-number");
    if (!roomNumberElement) {
        console.error("Room number not found.");
        return;
    }
    const roomNo = roomNumberElement.textContent.trim();

    // In a real app, you would fetch from your API
    // For demo purposes, we'll simulate some bookings
    const simulatedBookings = [
        { startTime: "09:00:00", endTime: "10:30:00" } // This would make the 8 AM - 11 AM slot booked
    ];

    updateTimeSlots(simulatedBookings);

    // Uncomment this for real API integration
    
    fetch(`http://192.168.1.7:8080/room/${roomNo}/date/${selectedDate}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch bookings");
            }
            return response.json();
        })
        .then(data => {
            console.log("Received bookings:", data);
            updateTimeSlots(data);
        })
        .catch(error => {
            console.error("Error fetching bookings:", error);
        });
    
}

// Convert 12-hour format to 24-hour format
function convertTo24Hour(time) {
    let [hour, modifier] = time.split(" ");
    let [h, m] = hour.split(":");

    h = parseInt(h);
    if (modifier === "PM" && h !== 12) h += 12;
    if (modifier === "AM" && h === 12) h = 0;

    return `${h.toString().padStart(2, "0")}:${m ? m : "00"}`;
}

// Check if a time slot is within a booked range
function isTimeWithinRange(slotStart, slotEnd, bookedStart, bookedEnd) {
    return (
        (bookedStart >= slotStart && bookedStart < slotEnd) || // Booking starts inside the slot
        (bookedEnd > slotStart && bookedEnd <= slotEnd) || // Booking ends inside the slot
        (bookedStart <= slotStart && bookedEnd >= slotEnd) // Booking covers entire slot
    );
}

// Update time slots UI based on booked slots
function updateTimeSlots(bookings) {
    console.log("Updating time slots with bookings:", bookings);

    const timeSlots = document.querySelectorAll(".time-slots .time-slot");

    // Reset all slots to available
    timeSlots.forEach(slot => {
        slot.classList.remove("booked", "selected");
        slot.classList.add("available");
        slot.style.pointerEvents = "auto"; 

        let statusElement = slot.querySelector(".status");
        if (statusElement) {
            statusElement.textContent = "Available"; // Reset status text
            statusElement.classList.add("available");
            statusElement.classList.remove("booked");
        }
    });

    // Check each booking and mark the appropriate slots as booked
    bookings.forEach(booking => {
        let bookedStartTime = booking.startTime.substring(0, 5);
        let bookedEndTime = booking.endTime.substring(0, 5);

        timeSlots.forEach(slot => {
            let slotTimes = slot.dataset.time.split(" - ");
            let slotStartTime = convertTo24Hour(slotTimes[0].trim());
            let slotEndTime = convertTo24Hour(slotTimes[1].trim());

            if (isTimeWithinRange(slotStartTime, slotEndTime, bookedStartTime, bookedEndTime)) {
                slot.classList.add("booked");
                slot.classList.remove("available");
                slot.style.pointerEvents = "none"; 

                let statusElement = slot.querySelector(".status");
                if (statusElement) {
                    statusElement.textContent = "Booked"; // Update status text
                    statusElement.classList.remove("available");
                    statusElement.classList.add("booked");
                }
            }
        });
    });

    console.log("Time slots updated successfully.");
}

// Handle time slot selection
function handleTimeSlotSelection() {
    document.querySelectorAll(".time-slots .time-slot").forEach(slot => {
        slot.addEventListener("click", function() {
            if (this.classList.contains("booked")) return; // Ignore booked slots

            document.querySelectorAll(".time-slots .time-slot").forEach(s => s.classList.remove("selected"));
            this.classList.add("selected");
        });
    });
}

// Handle location badge selection
function handleLocationSelection() {
    document.querySelectorAll(".location-badges .badge").forEach(badge => {
        badge.addEventListener("click", function() {
            document.querySelectorAll(".location-badges .badge").forEach(b => b.classList.remove("active"));
            this.classList.add("active");
        });
    });
}

// Convert 12-hour format to 24-hour format (e.g., "8 AM" -> "08:00:00")
function convertTo24HourFormat(timeStr) {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (!minutes) minutes = 0; // If minutes are not provided

    if (modifier === "PM" && hours !== 12) {
        hours += 12;
    } else if (modifier === "AM" && hours === 12) {
        hours = 0;
    }

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}

// Book the room
function bookRoom() {
    console.log("Booking room...");

    // Get selected room number
    const roomNumberElement = document.querySelector("#room-number");
    if (!roomNumberElement) {
        showNotification("Room number not found. Please try again.", "error");
        return;
    }
    const roomNum = roomNumberElement.textContent.trim();

    // Get selected date
    const selectedDateButton = document.querySelector(".date-slot.selected");
    if (!selectedDateButton) {
        showNotification("Please select a date before booking.", "error");
        return;
    }
    const selectedDate = selectedDateButton.dataset.date; // Format: YYYY-MM-DD

    // Get selected time slot
    const selectedTimeSlot = document.querySelector(".time-slots .time-slot.selected");
    if (!selectedTimeSlot) {
        showNotification("Please select a time slot before booking.", "error");
        return;
    }
    const timeRange = selectedTimeSlot.dataset.time.split(" - ");
    const startTime = convertTo24HourFormat(timeRange[0]); // Convert to 24-hour format
    const endTime = convertTo24HourFormat(timeRange[1]);   // Convert to 24-hour format

    const userData = JSON.parse(localStorage.getItem('userData'));
    console.log(userData);
    



    // Get user ID (in a real app, this would come from authentication)
    const userId = userData.id;

    // Prepare Booking object
    const bookingData = {
        conferenceRoom: { roomNo: roomNum },
        user: { id: userId },
        bookingDate: selectedDate,
        startTime: startTime,
        endTime: endTime
    };

    console.log("Sending booking data:", bookingData);

    // In a real app, you would send this to your API
    // For demo purposes, we'll simulate a successful booking
    showNotification("Room booked successfully!", "success");
    
    // // Store booking in localStorage for the bookings page
    // const roomName = document.getElementById("roomName").textContent;
    // const roomCapacity = document.getElementById("capacityText").textContent.replace("Capacity: ", "").replace(" people", "");
    // const roomLocation = document.getElementById("locationText").textContent.replace("Location: ", "");
    // const roomImage = document.getElementById("roomImage").src;
    
    // const bookedRoom = {
    //     id: roomNum,
    //     name: roomName,
    //     capacity: roomCapacity,
    //     location: roomLocation,
    //     image: roomImage,
    //     bookingDate: selectedDate,
    //     bookingTime: timeRange.join(" - ")
    // };
    
    // // Store in localStorage
    // localStorage.setItem("bookedRoom", JSON.stringify(bookedRoom));
    
    // Redirect to bookings page after a short delay
    // setTimeout(() => {
    //     window.location.href = "User_All_Booking.html";
    // }, 1500);

    // Uncomment this for real API integration
    
    fetch("http://192.168.1.7:8080/room", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(bookingData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to book room");
        }
        return response.json();
    })
    .then(data => {
        console.log("Booking successful:", data);
        showNotification("Room booked successfully!", "success");
        localStorage.setItem("bookedRoom", JSON.stringify(data)); // Save in local storage
        
    })
    .catch(error => {
        console.error("Error booking room:", error);
        showNotification("Error booking room. Please try again.", "error");
    });
    
}

// Load the booked room from localStorage
function loadRoom() {
    console.log("Fetching room data from localStorage...");

    let roomData = localStorage.getItem("bookedRoom");
    console.log("Room data from localStorage:", roomData);

    if (!roomData) {
        console.warn("No room data found in localStorage.");
        return;
    }

    try {
        roomData = JSON.parse(roomData);
    } catch (error) {
        console.error("Error parsing room data:", error);
        return;
    }

    console.log("Loaded room from localStorage:", roomData);

    // Get room card elements
    const roomTitle = document.getElementById("roomName");
    const capacityText = document.getElementById("capacityText");
    const locationText = document.getElementById("locationText");
    const roomImage = document.getElementById("roomImage");
    const roomNo = document.getElementById("room-number");
    const infoTitle = document.getElementById("infoTitle");

    // Check if elements exist
    if (!roomTitle || !capacityText || !locationText || !roomImage || !roomNo || !infoTitle) {
        console.error("One or more room elements are missing in the HTML.");
        return;
    }

    // Set the room details dynamically
    roomTitle.textContent = roomData.name || "Unknown Room";
    roomNo.textContent = roomData.roomId || roomData.id || "";
    infoTitle.textContent = roomData.name || "Unknown Room";
    capacityText.textContent = `Capacity: ${roomData.capacity || "N/A"} people`;
    locationText.textContent = `Location: ${roomData.location || "Unknown"}`;
    roomImage.src = roomData.image || "";
    roomImage.alt = roomData.name || "Room Image";

    console.log("Room details updated successfully in HTML.");
}

// Show notification
function showNotification(message, type = "success") {
    // Remove any existing notifications
    const existingNotification = document.querySelector(".notification");
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;

    // Style based on type
    if (type === "success") {
        notification.style.background = "linear-gradient(to right, var(--cyan-500), var(--blue-600))";
    } else if (type === "error") {
        notification.style.background = "linear-gradient(to right, var(--rose-500), var(--rose-400))";
    } else if (type === "info") {
        notification.style.background = "linear-gradient(to right, var(--blue-400), var(--indigo-500))";
    } else if (type === "warning") {
        notification.style.background = "linear-gradient(to right, var(--amber-500), var(--amber-300))";
    }

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = "0";
        notification.style.transform = "translateY(20px)";
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}


