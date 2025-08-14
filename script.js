function initNavigation() {
        const navContainer = document.querySelector('nav');
        const navItems = document.querySelectorAll('.nav-item');

        navContainer.addEventListener('click', function (e) {
            const clickedItem = e.target.closest('.nav-item');
            if (!clickedItem) return; // Click wasn't on a nav item
            e.preventDefault();

            // Update active state
            navItems.forEach(item => item.classList.remove('active'));
            clickedItem.classList.add('active');

            // Smooth scroll to target section
            const targetId = clickedItem.getAttribute('href')?.substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                const scrollOffset = targetSection.offsetTop - 160; // Adjust for fixed header
                window.scrollTo({
                    top: scrollOffset,
                    behavior: 'smooth'
                });
            }
        });
    }

    function hideLoadingOverlay() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        const header = document.querySelector('header');
        const nav = document.querySelector('nav');

        // Fade out overlay
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            header.style.visibility = 'visible';
            nav.style.visibility = 'visible';
        }, 200);
    }

    window.addEventListener('load', function () {
        initNavigation();

        // Test nav visibility without waiting for long animations
        setTimeout(hideLoadingOverlay, 500);
    });

    <nav>
  <a href="#home" class="nav-item">Home</a>
  <a href="#ra-contact" class="nav-item">Meet Your RAs</a>
  <a href="#osu-links" class="nav-item">OSU Resources</a>
  <a href="#chatbot" class="nav-item">Chatbot</a>
  <a href="#newsletters" class="nav-item">Newsletters</a>
  <a href="#events" class="nav-item">Events & Deadlines</a>
</nav>
