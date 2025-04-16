document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    } else {
      console.warn('Lucide is not defined. Ensure it is properly imported or included.');
    }
    
  initParticleNetwork();
  fetchBookingsFromBackend();
  });
  
  // Mock booking data
  let bookingsData = [];
  
  async function fetchBookingsFromBackend() {
    const userData = JSON.parse(localStorage.getItem("userData")) 
    const userId = userData.id; 
    console.log(userId); 
    try {
      const response = await fetch(`http://192.168.1.7:8080/room/bookings/${userId}`); // Replace with your actual API endpoint
      const data = await response.json();
      console.log(data); 
      // Transform backend format to match existing UI format
      bookingsData = data.map((booking, index) => {
        const dateObj = new Date(booking.bookingDate);
        const day = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
        const date = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  
        return {
          id: booking.id,
          date: { day, date },
          timeSlot: formatTimeRange(booking.startTime, booking.endTime),
          location: booking.location,
          roomType: booking.roomName,
          status: "Confirmed", // default status
        };
      });
  
      initBookings();
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    }
  }
  
  function formatTimeRange(startTime, endTime) {
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    
  
    const options = { hour: 'numeric', minute: '2-digit', hour12: true };
    return `${start.toLocaleTimeString('en-US', options)} – ${end.toLocaleTimeString('en-US', options)}`;
  }
  

  // Group bookings by date
  function groupBookingsByDate(bookings) {
    return bookings.reduce((groups, booking) => {
      const dateKey = `${booking.date.day}-${booking.date.date}`;
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: booking.date,
          bookings: [],
        };
      }
      groups[dateKey].bookings.push(booking);
      return groups;
    }, {});
  }
  
  // Initialize bookings
  function initBookings() {
    const groupedBookings = groupBookingsByDate(bookingsData);
    const bookingsContainer = document.getElementById('bookingsContainer');
    bookingsContainer.innerHTML = '';
    
    Object.values(groupedBookings).forEach((group, groupIndex) => {
      const bookingGroup = document.createElement('div');
      bookingGroup.className = 'booking-group';
      bookingGroup.style.animationDelay = `${0.1 * groupIndex}s`;
      
      // Date header
      const dateHeader = document.createElement('div');
      dateHeader.className = 'date-header';
      dateHeader.innerHTML = `
        <div class="date-card">
          <div class="date-pattern">
            <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path d="M10,30 L90,30" stroke="white" stroke-width="0.5" fill="none" />
              <path d="M10,50 L90,50" stroke="white" stroke-width="0.5" fill="none" />
              <path d="M10,70 L90,70" stroke="white" stroke-width="0.5" fill="none" />
              <path d="M30,10 L30,90" stroke="white" stroke-width="0.5" fill="none" />
              <path d="M50,10 L50,90" stroke="white" stroke-width="0.5" fill="none" />
              <path d="M70,10 L70,90" stroke="white" stroke-width="0.5" fill="none" />
              <circle cx="30" cy="30" r="2" fill="white" />
              <circle cx="50" cy="50" r="2" fill="white" />
              <circle cx="70" cy="70" r="2" fill="white" />
            </svg>
          </div>
          <span class="date-day">${group.date.day}</span>
          <span class="date-number">${group.date.date}</span>
        </div>
        <div class="date-info">
          ${group.bookings.length} booking${group.bookings.length !== 1 ? 's' : ''} for this date
        </div>
      `;
      bookingGroup.appendChild(dateHeader);
      
      // Booking cards
      const bookingCards = document.createElement('div');
      bookingCards.className = 'booking-cards';
      
      group.bookings.forEach((booking, index) => {
        const bookingCard = document.createElement('div');
        bookingCard.className = 'booking-card';
        bookingCard.style.animationDelay = `${0.1 * index}s`;
        bookingCard.innerHTML = `
          <div class="card-glow"></div>
          <div class="card-bg"></div>
          <div class="card-pattern">
            <svg width="100%" height="100%" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,100 L400,100" stroke="cyan" stroke-width="0.5" fill="none" />
              <path d="M100,0 L100,200" stroke="cyan" stroke-width="0.5" fill="none" />
              <path d="M200,0 L200,200" stroke="cyan" stroke-width="0.5" fill="none" />
              <path d="M300,0 L300,200" stroke="cyan" stroke-width="0.5" fill="none" />
              <circle cx="100" cy="100" r="3" fill="cyan" />
              <circle cx="200" cy="100" r="3" fill="cyan" />
              <circle cx="300" cy="100" r="3" fill="cyan" />
            </svg>
          </div>
          <div class="card-content">
            <div class="booking-details">
              <div class="detail-item">
                <div class="detail-icon time">
                  <i data-lucide="clock"></i>
                </div>
                <div class="detail-text">
                  <span class="detail-value">${booking.timeSlot}</span>
                  <span class="detail-label">Duration</span>
                </div>
              </div>
              
              <div class="detail-item">
                <div class="detail-icon location">
                  <i data-lucide="map-pin"></i>
                </div>
                <div class="detail-text">
                  <span class="detail-value">${booking.location}</span>
                  <span class="detail-label">Location</span>
                </div>
              </div>
              
              <div class="detail-item">
                <div class="detail-icon room">
                  <i data-lucide="home"></i>
                </div>
                <div class="detail-text">
                  <span class="detail-value">${booking.roomType}</span>
                  <span class="detail-label">Room Type</span>
                </div>
              </div>
            </div>
            
            <div class="card-footer">
              <div class="status-badge ${booking.status.toLowerCase()}">
                <div class="status-dot"></div>
                ${booking.status}
              </div>
              
              <div class="cancel-container" data-booking-id="${booking.id}">
                <button class="cancel-btn">Cancel</button>
                <div class="cancel-confirm" style="display: none;">
                  <button class="cancel-no">No</button>
                  <button class="cancel-yes">Yes, Cancel</button>
                </div>
              </div>
            </div>
          </div>
        `;
        bookingCards.appendChild(bookingCard);
        
        // Add event listeners for cancel buttons after the card is added to the DOM
        setTimeout(() => {
          const cancelBtn = bookingCard.querySelector('.cancel-btn');
          const cancelConfirm = bookingCard.querySelector('.cancel-confirm');
          const cancelNo = bookingCard.querySelector('.cancel-no');
          const cancelYes = bookingCard.querySelector('.cancel-yes');
          
          cancelBtn.addEventListener('click', () => {
            cancelBtn.style.display = 'none';
            cancelConfirm.style.display = 'flex';
          });
          
          cancelNo.addEventListener('click', () => {
            cancelConfirm.style.display = 'none';
            cancelBtn.style.display = 'block';
          });
          
          cancelYes.addEventListener('click', () => {
            handleCancel(booking.id);
          });
        }, 0);
      });
      
      bookingGroup.appendChild(bookingCards);
      bookingsContainer.appendChild(bookingGroup);
    });
    
    // Re-initialize Lucide icons after adding new elements
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    } else {
      console.warn('Lucide is not defined. Ensure it is properly imported or included.');
    }
  }
  
  function handleCancel(bookingId) {
    // Send DELETE request to backend
    console.log("Deleting booking with ID:", bookingId);  
    fetch(`http://192.168.1.7:8080/room/bookings/${bookingId}`, {
      method: 'DELETE',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to delete booking.");
        }
        // Remove from local data
        const index = bookingsData.findIndex(booking => booking.id === bookingId);
        if (index !== -1) {
          bookingsData.splice(index, 1);
          initBookings(); // Re-render UI
        }
      })
      .catch(error => {
        console.error("Error deleting booking:", error);
        alert("Could not cancel the booking. Please try again.");
      });
  }
  
  // Initialize particle network
  function initParticleNetwork() {
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas to full window size
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
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
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      drawLines();
      
      requestAnimationFrame(animate);
    }
    
    animate();
  }