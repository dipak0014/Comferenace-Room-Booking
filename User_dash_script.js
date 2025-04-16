document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons()
  } else {
    console.warn("Lucide is not defined. Ensure it is properly imported or included.")
  }

  initParticleNetwork()
  initSlider()
  initMobileNav()
  initPageNavigation()
})

// Initialize particle network
function initParticleNetwork() {
  const canvas = document.getElementById("particleCanvas")
  if (!canvas) return
  
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

// Initialize slider
function initSlider() {
  const sliderTrack = document.querySelector(".slider-track")
  const sliderDots = document.querySelector(".slider-dots")
  const prevBtn = document.querySelector(".slider-arrow.prev")
  const nextBtn = document.querySelector(".slider-arrow.next")
  
  if (!sliderTrack || !sliderDots || !prevBtn || !nextBtn) return

  // Conference room images
  const rooms = [
    {
      image: "N-1.png",
      date: "17.05.2023",
      time: "4:30 PM",
    },
    {
      image: "N-2.png",
      date: "18.05.2023",
      time: "10:00 AM",
    },
    {
      image: "N-3.png",
      date: "19.05.2023",
      time: "2:15 PM",
    },
    {
      image: "N-4.png",
      date: "20.05.2023",
      time: "9:45 AM",
    },
    {
      image: "N-5.png",
      date: "20.05.2023",
      time: "9:45 AM",
    },
  ]

  let currentSlide = 0

  // Create slides
  rooms.forEach((room, index) => {
    const slide = document.createElement("div")
    slide.className = "slide"
    slide.innerHTML = `
        <img src="${room.image}" alt="Conference Room ${index + 1}">
        <div class="slide-info">
          <div class="slide-date">${room.date}</div>
          <div class="slide-time">${room.time}</div>
        </div>
      `
    sliderTrack.appendChild(slide)

    // Create dots
    const dot = document.createElement("div")
    dot.className = `slider-dot ${index === 0 ? "active" : ""}`
    dot.addEventListener("click", () => goToSlide(index))
    sliderDots.appendChild(dot)
  })

  // Add event listeners to buttons
  prevBtn.addEventListener("click", prevSlide)
  nextBtn.addEventListener("click", nextSlide)

  // Auto slide
  let slideInterval = setInterval(nextSlide, 3000)

  // Reset interval on manual navigation
  function resetInterval() {
    clearInterval(slideInterval)
    slideInterval = setInterval(nextSlide, 3000)
  }

  // Go to previous slide
  function prevSlide() {
    currentSlide = (currentSlide - 1 + rooms.length) % rooms.length
    updateSlider()
    resetInterval()
  }

  // Go to next slide
  function nextSlide() {
    currentSlide = (currentSlide + 1) % rooms.length
    updateSlider()
    resetInterval()
  }

  // Go to specific slide
  function goToSlide(index) {
    currentSlide = index
    updateSlider()
    resetInterval()
  }

  // Update slider position and active dot
  function updateSlider() {
    sliderTrack.style.transform = `translateX(-${currentSlide * 20}%)`

    // Update active dot
    document.querySelectorAll(".slider-dot").forEach((dot, index) => {
      dot.classList.toggle("active", index === currentSlide)
    })
  }

  // Add keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      prevSlide()
    } else if (e.key === "ArrowRight") {
      nextSlide()
    }
  })

  // Add swipe support for touch devices
  let touchStartX = 0
  let touchEndX = 0

  const sliderContainer = document.querySelector(".slider-container")
  if (sliderContainer) {
    sliderContainer.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX
    })

    sliderContainer.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX
      handleSwipe()
    })
  }

  function handleSwipe() {
    const swipeThreshold = 50

    if (touchEndX < touchStartX - swipeThreshold) {
      // Swipe left
      nextSlide()
    } else if (touchEndX > touchStartX + swipeThreshold) {
      // Swipe right
      prevSlide()
    }
  }
}

// Initialize mobile navigation
function initMobileNav() {
  const menuToggle = document.querySelector(".menu-toggle")
  const sidebar = document.querySelector(".sidebar")

  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open")
    })

    // Close sidebar when clicking outside
    document.addEventListener("click", (e) => {
      if (!sidebar.contains(e.target) && !menuToggle.contains(e.target) && sidebar.classList.contains("open")) {
        sidebar.classList.remove("open")
      }
    })
  }
}

// Initialize page navigation without page reload
function initPageNavigation() {
  const navLinks = document.querySelectorAll(".sidebar-nav .nav-item")
  
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {

      navLinks.forEach((l) => l.classList.remove("active"))
      this.classList.add("active")

      const href = this.getAttribute("href")
      loadPageContent(href)
    })
  })
}