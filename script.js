function initNavigation() {
    const navContainer = document.querySelector('nav');
    const navItems = document.querySelectorAll('.nav-item');
    const checkInput = document.getElementById('check');

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

        // Close sidebar menu on click
        if (checkInput) checkInput.checked = false;
    });
}

function hideLoadingOverlay() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');

    if (loadingOverlay) {
        // Fade out overlay
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            if (header) header.style.visibility = 'visible';
            if (nav) nav.style.visibility = 'visible';
        }, 200);
    } else {
        if (header) header.style.visibility = 'visible';
        if (nav) nav.style.visibility = 'visible';
    }
}

window.addEventListener('load', function () {
    initNavigation();

    // Test nav visibility without waiting for long animations
    setTimeout(hideLoadingOverlay, 500);
});

// Simple calendar and reservation system
const calendarContainer = document.getElementById('calendar-container');
const reservationsList = document.getElementById('reservations-list');

// Generate calendar for current week
function renderCalendar() {
    const now = new Date();
    const today = now.toISOString().slice(0,10);
    let html = '<table style="width:100%; border-collapse:collapse;">';
    html += '<tr><th>Date</th><th>Time Slot</th><th>Reserve</th></tr>';
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset);
        const dateStr = date.toISOString().slice(0,10);
        for (let hour = 0; hour < 24; hour++) {
            const timeStr = `${hour.toString().padStart(2,'0')}:00 - ${(hour+1).toString().padStart(2,'0')}:00`;
            html += `<tr>
                <td>${dateStr}</td>
                <td>${timeStr}</td>
                <td><button class="reserve-btn" data-date="${dateStr}" data-hour="${hour}" style="padding:4px 12px; border-radius:6px; background:var(--osu-red); color:#fff; border:none; cursor:pointer;">Reserve</button></td>
            </tr>`;
        }
    }
    html += '</table>';
    calendarContainer.innerHTML = html;
}
renderCalendar();

// Store reservations in localStorage for demo
function getReservations() {
    return JSON.parse(localStorage.getItem('studyRoomReservations') || '{}');
}
function saveReservations(reservations) {
    localStorage.setItem('studyRoomReservations', JSON.stringify(reservations));
}

// Handle reservation button clicks
calendarContainer.addEventListener('click', function(e) {
    if (e.target.classList.contains('reserve-btn')) {
        const date = e.target.getAttribute('data-date');
        const hour = e.target.getAttribute('data-hour');
        const user = prompt("Enter your name for the reservation:");
        if (user) {
            const reservations = getReservations();
            if (!reservations[date]) reservations[date] = {};
            if (reservations[date][hour]) {
                alert("This time slot is already reserved.");
            } else {
                reservations[date][hour] = user;
                saveReservations(reservations);
                alert("Reservation successful!");
                renderDailyReservations();
            }
        }
    }
});

// Display today's reservations
function renderDailyReservations() {
    const today = new Date().toISOString().slice(0,10);
    const reservations = getReservations();
    reservationsList.innerHTML = "";
    if (reservations[today]) {
        Object.entries(reservations[today]).forEach(([hour, user]) => {
            const timeStr = `${hour.toString().padStart(2,'0')}:00 - ${(parseInt(hour)+1).toString().padStart(2,'0')}:00`;
            const li = document.createElement('li');
            li.textContent = `${timeStr}: ${user}`;
            reservationsList.appendChild(li);
        });
    } else {
        reservationsList.innerHTML = "<li>No reservations for today.</li>";
    }
}
window.addEventListener('DOMContentLoaded', renderDailyReservations);
