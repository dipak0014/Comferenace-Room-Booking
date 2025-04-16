document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons()
  } else {
    console.warn("Lucide is not defined. Ensure it is properly imported or included.")
  }

  initParticleNetwork()
  fetchRoomsFromBackend()
  initializeTopNavbar()
})

// Initialize top navbar functionality
function initializeTopNavbar() {
  // Notification button click
  const notificationBtn = document.querySelector(".navbar-action-btn:nth-child(1)")
  if (notificationBtn) {
    notificationBtn.addEventListener("click", () => {
      showNotification("You have 2 new notifications", "info")
    })
  }

  // Settings button click
  const settingsBtn = document.querySelector(".navbar-action-btn:nth-child(4)")
  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      showNotification("Settings panel will be available soon", "info")
    })
  }
}

// Fetch rooms from backend
async function fetchRoomsFromBackend() {
  console.log("DOM fully loaded and parsed")

  const roomContainer = document.querySelector(".room-grid")

  // API URL
  const apiUrl = "http://192.168.1.7:8080/ConferenceRoom"

  try {
    // Fetch data from API
    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`)
    }

    const rooms = await response.json()
    console.log("API Data:", rooms)

    // If no rooms are returned, show sample data
    if (!rooms || rooms.length === 0) {
      const sampleRooms = [
        {
          roomNo: "A101",
          roomName: "Executive Suite",
          capaicty: 12,
          location: "Main Building, 1st Floor",
        },
        {
          roomNo: "B205",
          roomName: "Innovation Lab",
          capaicty: 8,
          location: "Tech Wing, 2nd Floor",
        },
        {
          roomNo: "C310",
          roomName: "Conference Hall",
          capaicty: 24,
          location: "East Wing, 3rd Floor",
        },
        {
          roomNo: "D102",
          roomName: "Brainstorm Room",
          capaicty: 6,
          location: "Creative Zone, 1st Floor",
        },
      ]

      renderRooms(sampleRooms)
    } else {
      renderRooms(rooms)
    }

    // Initialize AI-like effect after data is loaded
    initializeAIEffect()
  } catch (error) {
    console.error("Error fetching API data:", error)
    showNotification("Failed to load room data. Using sample data instead.", "warning")

    // Show sample data on error
    const sampleRooms = [
      {
        roomNo: "A101",
        roomName: "Executive Suite",
        capaicty: 12,
        location: "Main Building, 1st Floor",
      },
      {
        roomNo: "B205",
        roomName: "Innovation Lab",
        capaicty: 8,
        location: "Tech Wing, 2nd Floor",
      },
      {
        roomNo: "C310",
        roomName: "Conference Hall",
        capaicty: 24,
        location: "East Wing, 3rd Floor",
      },
      {
        roomNo: "D102",
        roomName: "Brainstorm Room",
        capaicty: 6,
        location: "Creative Zone, 1st Floor",
      },
    ]

    renderRooms(sampleRooms)
    initializeAIEffect()
  }
}

// Render rooms to the DOM
function renderRooms(rooms) {
  const roomContainer = document.querySelector(".room-grid")
  roomContainer.innerHTML = ""

  rooms.forEach((room, index) => {
    createRoomCard({
      id: room.roomNo,
      name: room.roomName,
      capacity: room.capaicty,
      location: room.location,
      image: "https://img.freepik.com/free-photo/business-meeting-room-high-rise-office-building_105762-1717.jpg",
      avatars: ["https://randomuser.me/api/portraits/men/32.jpg", "https://randomuser.me/api/portraits/women/44.jpg"],
    })
  })
}

// Create room card
function createRoomCard(room) {
  const card = document.createElement("div")
  card.className = "room-card"

  card.innerHTML = `
    <div class="ai-glow"></div>
    <div class="room-image">
      <img src="${room.image}" alt="${room.name}" onerror="this.src='https://img.freepik.com/free-photo/business-meeting-room-high-rise-office-building_105762-1717.jpg'">
    </div>
    <div class="room-no">${room.id}</div>
    <div class="room-content">
      <h3 class="room-title">${room.name}</h3>
      <div class="room-details">
        <p class="room-capacity">Capacity: ${room.capacity} people</p>
        <p class="room-location">Location: ${room.location}</p>
      </div>
      <div class="room-footer">
        <button class="delete-btn">Book Room</button>
        <div class="user-avatars">
          ${room.avatars.map((avatar) => `<img src="${avatar}" class="avatar" alt="User">`).join("")}
        </div>
      </div>
    </div>
  `

  // Add hover effects and interactions
  addRoomCardEffects(card)

  // Append to the room container
  const roomContainer = document.querySelector(".room-grid")
  roomContainer.appendChild(card)
}

// Add hover and button click effects
function addRoomCardEffects(card) {
  // AI glow effect that follows mouse
  card.addEventListener("mousemove", (e) => {
    const glow = card.querySelector(".ai-glow")
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    glow.style.left = `${x - 75}px`
    glow.style.top = `${y - 75}px`
  })

  // Book button effect
  const bookBtn = card.querySelector(".delete-btn")
  bookBtn.addEventListener("click", () => {
    bookBtn.style.transform = "scale(0.95)"
    bookBtn.style.transition = "transform 0.2s"

    setTimeout(() => {
      bookBtn.style.transform = "scale(1)"
    }, 200)

    const roomTitle = card.querySelector(".room-title").textContent
    const roomCapacity = card
      .querySelector(".room-capacity")
      .textContent.replace("Capacity: ", "")
      .replace(" people", "")
    const roomLocation = card.querySelector(".room-location").textContent.replace("Location: ", "")
    const roomImage = card.querySelector(".room-image img").src
    const roomNo = card.querySelector(".room-no").textContent

    // Store booked room details in localStorage
    const bookedRoom = {
      name: roomTitle,
      roomId: roomNo,
      capacity: roomCapacity,
      location: roomLocation,
      image: roomImage,
    }

    localStorage.setItem("bookedRoom", JSON.stringify(bookedRoom))

    showNotification(`Room "${roomTitle}" booked successfully!`, "success")

    // Redirect to booking.html
    window.location.href = "bookroom.html"
    
  })
}

// Notification function
function showNotification(message, type = "success") {
  const notification = document.createElement("div")
  notification.className = "notification"
  notification.textContent = message

  // Style based on type
  if (type === "success") {
    notification.style.background = "linear-gradient(to right, var(--cyan-500), var(--blue-600))"
  } else if (type === "warning") {
    notification.style.background = "linear-gradient(to right, var(--amber-500), var(--rose-500))"
  } else if (type === "info") {
    notification.style.background = "linear-gradient(to right, var(--blue-400), var(--indigo-500))"
  }

  document.body.appendChild(notification)

  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.style.opacity = "0"
    notification.style.transform = "translateY(20px)"
    setTimeout(() => {
      notification.remove()
    }, 300)
  }, 3000)
}

// Initialize AI-like animation effect
function initializeAIEffect() {
  const roomCards = document.querySelectorAll(".room-card")

  // Staggered entrance animation
  roomCards.forEach((card, index) => {
    card.style.opacity = "0"
    card.style.transform = "translateY(30px)"
    card.style.transition = "all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)"

    setTimeout(
      () => {
        card.style.opacity = "1"
        card.style.transform = "translateY(0)"
      },
      100 + index * 150,
    )
  })

  // Add typing animation to the header
  const header = document.querySelector(".main-header h1")
  if (header) {
    const text = header.textContent
    header.textContent = ""

    let i = 0
    const typeWriter = () => {
      if (i < text.length) {
        header.textContent += text.charAt(i)
        i++
        setTimeout(typeWriter, 50)
      }
    }

    setTimeout(typeWriter, 500)
  }
}

// Initialize particle network
function initParticleNetwork() {
  const canvas = document.getElementById("particleCanvas")
  const ctx = canvas.getContext("2d")

  // Set canvas to full window size
  function resizeCanvas() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }

  resizeCanvas()
  window.addEventListener("resize", resizeCanvas)

  // Particle class
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width
      this.y = Math.random() * canvas.height
      this.vx = (Math.random() - 0.5) * 0.3
      this.vy = (Math.random() - 0.5) * 0.3
      this.radius = Math.random() * 1.5 + 0.5
      this.color = "#00FFFF"
    }

    update() {
      this.x += this.vx
      this.y += this.vy

      // Bounce off edges
      if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx
      if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy
    }

    draw() {
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
      ctx.fillStyle = this.color
      ctx.fill()
    }
  }

  // Create particles
  const particleCount = 100
  const particles = []

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle())
  }

  // Draw lines between particles that are close
  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 100) {
          ctx.beginPath()
          ctx.strokeStyle = `rgba(0, 255, 255, ${0.2 * (1 - distance / 100)})`
          ctx.lineWidth = 0.5
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.stroke()
        }
      }
    }
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Update and draw particles
    particles.forEach((particle) => {
      particle.update()
      particle.draw()
    })

    drawLines()

    requestAnimationFrame(animate)
  }

  animate()
}
